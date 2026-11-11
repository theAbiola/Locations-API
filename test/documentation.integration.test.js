import assert from "node:assert/strict";
import { describe, test } from "node:test";
import session from "express-session";
import request from "supertest";

process.env.NODE_ENV = "test";
process.env.SESSION_SECRET = "test-session-secret-that-is-long-enough";
process.env.CLIENT_ORIGIN = "http://localhost:3000";

const { createApp } = await import("../app.js");

const app = createApp({ sessionStore: new session.MemoryStore() });

describe("API documentation", () => {
  test("logs the method and endpoint for every request", async () => {
    // eslint-disable-next-line no-console
    const originalConsoleLog = console.log;
    const logs = [];
    // eslint-disable-next-line no-console
    console.log = (message) => logs.push(message);

    try {
      await request(app).get("/health?check=ready").expect(503);
    } finally {
      // eslint-disable-next-line no-console
      console.log = originalConsoleLog;
    }

    assert.deepEqual(logs, ["GET /health?check=ready"]);
  });

  test("serves the OpenAPI document", async () => {
    const response = await request(app).get("/docs/openapi.json").expect(200);

    assert.equal(response.body.openapi, "3.0.3");
    assert.equal(response.body.info.title, "Locations API");
    assert.ok(response.body.paths["/api/locations/auth/login"]);
    assert.ok(response.body.paths["/api/locations/{id}"]);
    assert.equal(
      response.body.components.securitySchemes.sessionCookie.in,
      "cookie",
    );
  });

  test("serves an interactive Swagger UI page", async () => {
    const response = await request(app).get("/docs/").expect(200);

    assert.match(response.text, /Swagger UI/);
    assert.match(response.text, /swagger-ui-init\.js/);
  });
});
