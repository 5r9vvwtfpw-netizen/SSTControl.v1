import assert from "node:assert/strict";
import test from "node:test";
import type { NextFunction, Request, Response } from "express";
import { securityHeaders } from "../../server/middleware/security-headers";

function responseRecorder() {
  const headers = new Map<string, string>();
  return {
    headers,
    response: {
      setHeader(name: string, value: string) {
        headers.set(name.toLowerCase(), value);
      },
    } as unknown as Response,
  };
}

test("security headers are applied to every environment", () => {
  const previousEnvironment = process.env.NODE_ENV;
  process.env.NODE_ENV = "development";
  const { headers, response } = responseRecorder();
  let nextCalled = false;

  securityHeaders(
    {} as Request,
    response,
    (() => {
      nextCalled = true;
    }) as NextFunction,
  );

  assert.equal(headers.get("x-content-type-options"), "nosniff");
  assert.equal(headers.get("x-frame-options"), "DENY");
  assert.equal(headers.get("referrer-policy"), "strict-origin-when-cross-origin");
  assert.equal(headers.get("permissions-policy"), "camera=(), microphone=(), geolocation=()");
  assert.equal(headers.has("strict-transport-security"), false);
  assert.equal(nextCalled, true);
  process.env.NODE_ENV = previousEnvironment;
});

test("HSTS is enabled in production", () => {
  const previousEnvironment = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";
  const { headers, response } = responseRecorder();

  securityHeaders({} as Request, response, (() => {}) as NextFunction);

  assert.equal(
    headers.get("strict-transport-security"),
    "max-age=63072000; includeSubDomains",
  );
  process.env.NODE_ENV = previousEnvironment;
});

test("production diagnostics and unsigned Stripe fallback stay disabled", async () => {
  const fs = await import("node:fs/promises");
  const indexSource = await fs.readFile("server/index.ts", "utf8");
  const routesSource = await fs.readFile("server/routes.ts", "utf8");

  assert.doesNotMatch(indexSource, /skipping signature verification/i);
  assert.match(indexSource, /Webhook verification unavailable/);
  assert.match(routesSource, /if \(process\.env\.NODE_ENV !== "production"\)/);
  assert.doesNotMatch(routesSource, /sst-diag-2026/);
  assert.match(routesSource, /randomInt\(100000, 1_000_000\)/);
  assert.match(routesSource, /send-verification", registrationRateLimiter/);
  assert.match(routesSource, /verify-code", loginRateLimiter/);
  assert.doesNotMatch(indexSource, /from ["']xlsx["']/);
});

