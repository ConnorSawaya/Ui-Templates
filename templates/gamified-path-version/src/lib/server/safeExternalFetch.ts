import { resolve4 } from "node:dns/promises";
import { isIP, type LookupFunction } from "node:net";
import { request as httpRequest, type RequestOptions } from "node:http";
import { request as httpsRequest } from "node:https";

export const MAX_URL_LENGTH = 2_048;
export const MAX_RESPONSE_BYTES = 1_000_000;
export const MAX_REDIRECTS = 3;
const MAX_TOTAL_TIME_MS = 8_000;
const MAX_DNS_TIME_MS = 2_500;
const MAX_REQUEST_TIME_MS = 4_000;

type Resolver = (hostname: string) => Promise<string[]>;

export class ExternalFetchError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "ExternalFetchError";
    this.statusCode = statusCode;
  }
}

function ipv4Number(address: string): number | null {
  if (isIP(address) !== 4) return null;
  const parts = address.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => part < 0 || part > 255)) {
    return null;
  }
  return parts.reduce((result, part) => ((result << 8) | part) >>> 0, 0);
}

function inCidr(address: number, network: number, prefix: number): boolean {
  const mask = (0xffff_ffff << (32 - prefix)) >>> 0;
  return (address & mask) === (network & mask);
}

/** True only for globally routable IPv4 unicast addresses. */
export function isPublicIpv4(address: string): boolean {
  const value = ipv4Number(address);
  if (value === null) return false;

  const nonPublicRanges: ReadonlyArray<readonly [number, number]> = [
    [0x0000_0000, 8], // Current network / unspecified
    [0x0a00_0000, 8], // Private
    [0x6440_0000, 10], // Shared address space
    [0x7f00_0000, 8], // Loopback
    [0xa9fe_0000, 16], // Link local
    [0xac10_0000, 12], // Private
    [0xc000_0000, 24], // IETF protocol assignments
    [0xc000_0200, 24], // Documentation
    [0xc058_6300, 24], // Deprecated 6to4 relay anycast
    [0xc0a8_0000, 16], // Private
    [0xc612_0000, 15], // Benchmarking
    [0xc633_6400, 24], // Documentation
    [0xcb00_7100, 24], // Documentation
    [0xe000_0000, 4], // Multicast and reserved
    [0xf000_0000, 4], // Reserved for future use
  ];

  return !nonPublicRanges.some(([network, prefix]) =>
    inCidr(value, network, prefix),
  );
}

function normalizeUrl(input: string | URL): URL {
  if (typeof input === "string" && input.length > MAX_URL_LENGTH) {
    throw new ExternalFetchError("URL is too long", 400);
  }

  let url: URL;
  try {
    url = input instanceof URL ? new URL(input.href) : new URL(input);
  } catch {
    throw new ExternalFetchError("A valid absolute URL is required", 400);
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new ExternalFetchError("Only HTTP and HTTPS URLs are allowed", 400);
  }
  if (url.username || url.password) {
    throw new ExternalFetchError("URLs with credentials are not allowed", 400);
  }
  if (url.port) {
    const expectedPort = url.protocol === "https:" ? "443" : "80";
    if (url.port !== expectedPort) {
      throw new ExternalFetchError("Nonstandard ports are not allowed", 400);
    }
  }

  const hostname = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (
    !hostname ||
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal") ||
    hostname.endsWith(".test") ||
    hostname.endsWith(".invalid") ||
    hostname.endsWith(".example") ||
    isIP(hostname) === 6
  ) {
    throw new ExternalFetchError("This hostname is not allowed", 400);
  }

  url.hash = "";
  return url;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new ExternalFetchError("Target lookup timed out", 504)),
      timeoutMs,
    );
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

export async function resolvePublicIpv4(
  hostname: string,
  resolver: Resolver = resolve4,
  timeoutMs = MAX_DNS_TIME_MS,
): Promise<string> {
  const literalIp = ipv4Number(hostname);
  if (literalIp !== null) {
    if (!isPublicIpv4(hostname)) {
      throw new ExternalFetchError("Private or reserved addresses are blocked", 400);
    }
    return hostname;
  }

  let records: string[];
  try {
    records = await withTimeout(resolver(hostname), timeoutMs);
  } catch (error) {
    if (error instanceof ExternalFetchError) throw error;
    throw new ExternalFetchError("Target hostname could not be resolved", 400);
  }

  if (records.length === 0 || records.some((address) => !isPublicIpv4(address))) {
    throw new ExternalFetchError("Private or reserved addresses are blocked", 400);
  }

  // Pin the outbound request to an already checked answer so a second DNS lookup
  // cannot rebind the hostname to a private address between validation and use.
  return records[0];
}

async function validateTarget(
  input: string | URL,
  resolver: Resolver,
  remainingMs: number,
): Promise<{ url: URL; address: string }> {
  const url = normalizeUrl(input);
  const hostname = url.hostname.replace(/^\[|\]$/g, "");
  const address = await resolvePublicIpv4(
    hostname,
    resolver,
    Math.max(1, Math.min(MAX_DNS_TIME_MS, remainingMs)),
  );
  return { url, address };
}

interface ResponseData {
  statusCode: number;
  location?: string;
  contentType?: string;
  body?: Buffer;
}

function pinnedLookup(address: string): LookupFunction {
  return (_hostname, options, callback) => {
    if ("all" in options && options.all) {
      callback(null, [{ address, family: 4 }]);
      return;
    }
    callback(null, address, 4);
  };
}

function requestPinned(
  url: URL,
  address: string,
  timeoutMs: number,
): Promise<ResponseData> {
  return new Promise((resolve, reject) => {
    const client = url.protocol === "https:" ? httpsRequest : httpRequest;
    const options: RequestOptions = {
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port ? Number(url.port) : undefined,
      method: "GET",
      path: `${url.pathname}${url.search}`,
      headers: {
        Accept: "text/html,application/xhtml+xml,text/plain;q=0.9",
        "Accept-Encoding": "identity",
        "User-Agent": "PlateVisionMenuReader/1.0",
      },
      lookup: pinnedLookup(address),
    };

    let settled = false;
    const finish = (error?: Error, data?: ResponseData) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (error) reject(error);
      else if (data) resolve(data);
      else reject(new Error("Empty response"));
    };

    const request = client(options, (response) => {
      const statusCode = response.statusCode ?? 502;
      const location = response.headers.location;
      const contentType = response.headers["content-type"];
      const length = Number(response.headers["content-length"] ?? 0);

      if ([301, 302, 303, 307, 308].includes(statusCode)) {
        response.resume();
        finish(undefined, { statusCode, location });
        return;
      }

      if (length > MAX_RESPONSE_BYTES) {
        response.destroy();
        finish(new ExternalFetchError("Fetched response is too large", 413));
        return;
      }

      const normalizedContentType = Array.isArray(contentType)
        ? contentType[0]
        : contentType;
      if (
        !normalizedContentType ||
        !/^text\/(html|plain)(\s*;|$)|^application\/xhtml\+xml(\s*;|$)/i.test(
          normalizedContentType,
        )
      ) {
        response.resume();
        finish(new ExternalFetchError("Target did not return a text page", 415));
        return;
      }

      const contentEncoding = response.headers["content-encoding"];
      if (contentEncoding && contentEncoding !== "identity") {
        response.resume();
        finish(new ExternalFetchError("Encoded responses are not supported", 415));
        return;
      }

      const chunks: Buffer[] = [];
      let bytes = 0;
      response.on("data", (chunk: Buffer | string) => {
        const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        bytes += buffer.length;
        if (bytes > MAX_RESPONSE_BYTES) {
          response.destroy();
          finish(new ExternalFetchError("Fetched response is too large", 413));
          return;
        }
        chunks.push(buffer);
      });
      response.on("end", () =>
        finish(undefined, {
          statusCode,
          contentType: normalizedContentType,
          body: Buffer.concat(chunks),
        }),
      );
      response.on("error", (error) => finish(error));
    });

    const timer = setTimeout(() => {
      request.destroy(new ExternalFetchError("Target request timed out", 504));
    }, timeoutMs);
    request.on("error", (error) => finish(error));
    request.end();
  });
}

export async function fetchPublicText(
  input: string,
  resolver: Resolver = resolve4,
  requester: typeof requestPinned = requestPinned,
): Promise<string> {
  const startedAt = Date.now();
  let target = input;

  for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects += 1) {
    const remainingMs = MAX_TOTAL_TIME_MS - (Date.now() - startedAt);
    if (remainingMs <= 0) {
      throw new ExternalFetchError("Target request timed out", 504);
    }

    const { url, address } = await validateTarget(target, resolver, remainingMs);
    const requestTime = Math.max(1, Math.min(MAX_REQUEST_TIME_MS, remainingMs));
    let response: ResponseData;
    try {
      response = await requester(url, address, requestTime);
    } catch (error) {
      if (error instanceof ExternalFetchError) throw error;
      throw new ExternalFetchError("Target could not be fetched", 502);
    }

    if ([301, 302, 303, 307, 308].includes(response.statusCode)) {
      if (!response.location || redirects === MAX_REDIRECTS) {
        throw new ExternalFetchError("Target redirected too many times", 502);
      }
      try {
        target = new URL(response.location, url).href;
      } catch {
        throw new ExternalFetchError("Target returned an invalid redirect", 502);
      }
      continue;
    }

    if (response.statusCode < 200 || response.statusCode >= 300 || !response.body) {
      throw new ExternalFetchError("Target could not be fetched", 502);
    }
    if (response.body.length > MAX_RESPONSE_BYTES) {
      throw new ExternalFetchError("Fetched response is too large", 413);
    }

    return new TextDecoder("utf-8").decode(response.body);
  }

  throw new ExternalFetchError("Target redirected too many times", 502);
}
