import assert from "node:assert/strict";
import test from "node:test";
import {
  ExternalFetchError,
  fetchPublicText,
  isPublicIpv4,
  MAX_REDIRECTS,
  MAX_RESPONSE_BYTES,
  resolvePublicIpv4,
} from "../src/lib/server/safeExternalFetch.ts";

test("only globally routable IPv4 addresses are accepted", () => {
  assert.equal(isPublicIpv4("8.8.8.8"), true);
  assert.equal(isPublicIpv4("1.1.1.1"), true);

  for (const address of [
    "0.0.0.0",
    "10.0.0.1",
    "100.64.0.1",
    "127.0.0.1",
    "169.254.169.254",
    "172.16.0.1",
    "192.0.2.1",
    "192.168.1.1",
    "198.18.0.1",
    "203.0.113.1",
    "224.0.0.1",
    "240.0.0.1",
    "255.255.255.255",
    "::1",
    "not-an-ip",
  ]) {
    assert.equal(isPublicIpv4(address), false, `${address} should be blocked`);
  }
});

test("DNS resolution rejects mixed public and private answers", async () => {
  await assert.rejects(
    resolvePublicIpv4("menu.example.com", async () => ["93.184.216.34", "10.0.0.8"]),
    (error) => error instanceof ExternalFetchError && error.statusCode === 400,
  );
});

test("DNS resolution pins the first validated public answer", async () => {
  const address = await resolvePublicIpv4(
    "menu.example.com",
    async () => ["93.184.216.34", "1.1.1.1"],
  );
  assert.equal(address, "93.184.216.34");
});

test("DNS resolution fails closed when lookup times out", async () => {
  await assert.rejects(
    resolvePublicIpv4("menu.example.com", () => new Promise(() => {}), 1),
    (error) => error instanceof ExternalFetchError && error.statusCode === 504,
  );
});

test("unsafe URL schemes, credentials, ports, and IPv6 literals are rejected", async () => {
  for (const url of [
    "file:///etc/passwd",
    "http://user:pass@example.com/menu",
    "http://example.com:8080/menu",
    "http://[::1]/menu",
    "http://localhost/menu",
  ]) {
    await assert.rejects(fetchPublicText(url), ExternalFetchError, url);
  }
});

test("private IP literals are blocked before a request is made", async () => {
  await assert.rejects(fetchPublicText("http://169.254.169.254/latest/meta-data/"), {
    statusCode: 400,
  });
});

test("fetch uses the validated public address and returns only bounded text input", async () => {
  const requestCalls = [];
  const text = await fetchPublicText(
    "https://menu.example.com/menu#section",
    async (hostname) => {
      assert.equal(hostname, "menu.example.com");
      return ["93.184.216.34"];
    },
    async (url, address) => {
      requestCalls.push({ url: url.href, address });
      return {
        statusCode: 200,
        contentType: "text/html; charset=utf-8",
        body: Buffer.from("<main>Menu</main>"),
      };
    },
  );

  assert.equal(text, "<main>Menu</main>");
  assert.deepEqual(requestCalls, [
    { url: "https://menu.example.com/menu", address: "93.184.216.34" },
  ]);
});

test("redirects are manually revalidated and cannot reach a private target", async () => {
  let requests = 0;
  await assert.rejects(
    fetchPublicText(
      "https://menu.example.com/menu",
      async () => ["93.184.216.34"],
      async () => {
        requests += 1;
        return {
          statusCode: 302,
          location: "http://127.0.0.1/admin",
        };
      },
    ),
    (error) => error instanceof ExternalFetchError && error.statusCode === 400,
  );
  assert.equal(requests, 1, "no request should be issued to the redirect target");
});

test("redirects to public hosts are separately resolved and pinned", async () => {
  const lookups = [];
  const addresses = [];
  const text = await fetchPublicText(
    "https://menu.example.com/start",
    async (hostname) => {
      lookups.push(hostname);
      return hostname === "menu.example.com" ? ["93.184.216.34"] : ["1.1.1.1"];
    },
    async (url, address) => {
      addresses.push(address);
      if (url.pathname === "/start") {
        return { statusCode: 302, location: "https://cdn.example.net/menu" };
      }
      return {
        statusCode: 200,
        contentType: "text/plain",
        body: Buffer.from("menu text"),
      };
    },
  );

  assert.equal(text, "menu text");
  assert.deepEqual(lookups, ["menu.example.com", "cdn.example.net"]);
  assert.deepEqual(addresses, ["93.184.216.34", "1.1.1.1"]);
});

test("redirect chains stop at the configured hop limit", async () => {
  let requests = 0;
  await assert.rejects(
    fetchPublicText(
      "https://menu.example.com/start",
      async () => ["93.184.216.34"],
      async () => {
        requests += 1;
        return {
          statusCode: 302,
          location: `/hop-${requests + 1}`,
        };
      },
    ),
    (error) => error instanceof ExternalFetchError && error.statusCode === 502,
  );
  assert.equal(requests, MAX_REDIRECTS + 1);
});

test("oversized fetch bodies are rejected even if a requester violates its cap", async () => {
  await assert.rejects(
    fetchPublicText(
      "https://menu.example.com/menu",
      async () => ["93.184.216.34"],
      async () => ({
        statusCode: 200,
        contentType: "text/html",
        body: Buffer.alloc(MAX_RESPONSE_BYTES + 1),
      }),
    ),
    (error) => error instanceof ExternalFetchError && error.statusCode === 413,
  );
});
