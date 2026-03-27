import assert from "node:assert/strict";

import {
  getAuthRoutes,
  normalizeBaseUrl,
  readAccessToken,
  toApiError,
} from "../api/contract.ts";

function run(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    throw error;
  }
}

run("normalizeBaseUrl removes a trailing slash", () => {
  assert.equal(normalizeBaseUrl("https://localhost:7236/"), "https://localhost:7236");
});

run("getAuthRoutes returns the web auth endpoints", () => {
  assert.deepEqual(getAuthRoutes(), {
    login: "/api/auth/login",
    refresh: "/api/auth/refresh",
    logout: "/api/auth/logout",
  });
});

run("readAccessToken accepts the backend access token payload", () => {
  assert.equal(readAccessToken({ accessToken: "abc123", expiresIn: 900 }), "abc123");
});

run("readAccessToken rejects the stale legacy token payload", () => {
  assert.throws(
    () => readAccessToken({ token: "legacy" }),
    /accessToken/i
  );
});

run("toApiError maps ProblemDetails to a frontend-friendly shape", () => {
  assert.deepEqual(
    toApiError(
      {
        status: 401,
        title: "Unauthorized",
        detail: "Invalid email or password.",
      },
      "fallback message"
    ),
    {
      status: 401,
      message: "Invalid email or password.",
      title: "Unauthorized",
    }
  );
});
