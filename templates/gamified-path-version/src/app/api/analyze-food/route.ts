import { NextRequest, NextResponse } from "next/server";
import {
  ExternalFetchError,
  fetchPublicText,
} from "@/lib/server/safeExternalFetch";

const MAX_REQUEST_BYTES = 2_048;

export const runtime = "nodejs";

async function readJsonBody(request: NextRequest): Promise<unknown> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    throw new ExternalFetchError("JSON request body is required", 415);
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
    throw new ExternalFetchError("Request body is too large", 413);
  }

  const reader = request.body?.getReader();
  if (!reader) throw new ExternalFetchError("Request body is required", 400);

  const chunks: Uint8Array[] = [];
  let bytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > MAX_REQUEST_BYTES) {
      await reader.cancel().catch(() => undefined);
      throw new ExternalFetchError("Request body is too large", 413);
    }
    chunks.push(value);
  }

  const body = new Uint8Array(bytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return JSON.parse(new TextDecoder().decode(body));
  } catch {
    throw new ExternalFetchError("Request body must be valid JSON", 400);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await readJsonBody(request);
    if (
      !body ||
      typeof body !== "object" ||
      !("url" in body) ||
      typeof body.url !== "string" ||
      body.url.length === 0
    ) {
      throw new ExternalFetchError("A URL is required", 400);
    }

    const html = await fetchPublicText(body.url);

    // Extract text from the fetched page. Script and style blocks are discarded
    // before tags are stripped so their contents do not reach the analyzer.
    const textContent = html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, " ")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&[^;\s]+;/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return NextResponse.json(
      { text: textContent.slice(0, 10_000) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof ExternalFetchError) {
      return NextResponse.json(
        { error: error.message },
        {
          status: error.statusCode,
          headers: { "Cache-Control": "no-store" },
        },
      );
    }

    return NextResponse.json(
      { error: "Failed to process URL" },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
