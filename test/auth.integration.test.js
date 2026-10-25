import assert from "node:assert/strict";
import { after, before, beforeEach, describe, test } from "node:test";
import bcrypt from "bcrypt";
import session from "express-session";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";

process.env.NODE_ENV = "test";
process.env.SESSION_SECRET = "test-session-secret-that-is-long-enough";
process.env.CLIENT_ORIGIN = "http://localhost:3000";

const { createApp } = await import("../app.js");
const { bootstrapAdmin } = await import("../services/bootstrapAdmin.js");
const { default: User } = await import("../models/User.js");

let mongoServer;
let app;

const validUser = {
  email: "user@example.com",
  password: "correct-horse-battery-staple",
};

before(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  app = createApp({ sessionStore: new session.MemoryStore() });
});

beforeEach(async () => {
  await mongoose.connection.db.dropDatabase();
  delete process.env.ADMIN_EMAIL;
  delete process.env.ADMIN_PASSWORD;
});

after(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("authentication", () => {
  test("registers a normalized user, hashes the password, and starts a session", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .set("Origin", process.env.CLIENT_ORIGIN)
      .send({ email: "  USER@Example.COM ", password: validUser.password })
      .expect(201);

    assert.deepEqual(response.body.user.email, "user@example.com");
    assert.equal(response.body.user.role, "user");
    assert.equal(response.body.user.passwordHash, undefined);
    assert.match(response.headers["set-cookie"][0], /locations\.sid=/);
    assert.match(response.headers["set-cookie"][0], /HttpOnly/);
    assert.match(response.headers["set-cookie"][0], /SameSite=Lax/);
    assert.match(response.headers["set-cookie"][0], /Max-Age=86400/);

    const storedUser = await User.findOne({ email: validUser.email }).select(
      "+passwordHash",
    );
    assert.notEqual(storedUser.passwordHash, validUser.password);
    assert.equal(
      await bcrypt.compare(validUser.password, storedUser.passwordHash),
      true,
    );
  });

  test("rejects duplicate registration and public role assignment", async () => {
    await request(app).post("/api/auth/register").send(validUser).expect(201);

    await request(app).post("/api/auth/register").send(validUser).expect(409);

    const response = await request(app)
      .post("/api/auth/register")
      .send({ ...validUser, email: "admin@example.com", role: "admin" })
      .expect(400);

    assert.match(response.body.message, /Role cannot be assigned/);
  });

  test("logs in with valid credentials and uses generic failures", async () => {
    await request(app).post("/api/auth/register").send(validUser).expect(201);

    const response = await request(app)
      .post("/api/auth/login")
      .send(validUser)
      .expect(200);
    assert.equal(response.body.user.email, validUser.email);

    const unknown = await request(app)
      .post("/api/auth/login")
      .send({ ...validUser, email: "missing@example.com" })
      .expect(401);
    const incorrect = await request(app)
      .post("/api/auth/login")
      .send({ ...validUser, password: "incorrect-password" })
      .expect(401);
    assert.equal(unknown.body.message, incorrect.body.message);
  });

  test("returns the current user and invalidates the session on logout", async () => {
    const agent = request.agent(app);
    await agent.post("/api/auth/register").send(validUser).expect(201);
    await agent.get("/api/auth/me").expect(200);
    await agent.post("/api/auth/logout").expect(200);
    await agent.get("/api/auth/me").expect(401);
  });

  test("rejects sessions belonging to disabled or deleted users", async () => {
    const disabledAgent = request.agent(app);
    const disabled = await disabledAgent
      .post("/api/auth/register")
      .send(validUser)
      .expect(201);
    await User.findByIdAndUpdate(disabled.body.user.id, { status: "disabled" });
    await disabledAgent.get("/api/auth/me").expect(401);

    const deletedAgent = request.agent(app);
    const deleted = await deletedAgent
      .post("/api/auth/register")
      .send({ email: "deleted@example.com", password: validUser.password })
      .expect(201);
    await User.findByIdAndDelete(deleted.body.user.id);
    await deletedAgent.get("/api/auth/me").expect(401);
  });

  test("rejects state-changing requests from an untrusted origin", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .set("Origin", "https://attacker.example")
      .send(validUser)
      .expect(403);

    assert.match(response.body.message, /origin is not allowed/);
  });
});

describe("location authorization", () => {
  test("requires authentication for location reads", async () => {
    await request(app).get("/api/locations").expect(401);
  });

  test("allows users to read and filter but forbids writes", async () => {
    const agent = request.agent(app);
    await agent.post("/api/auth/register").send(validUser).expect(201);
    await agent.get("/api/locations?locationType=indoor").expect(200);
    await agent
      .post("/api/locations")
      .send({
        locationName: "Museum",
        locationType: "indoor",
        mapURL: "https://maps.example/museum",
        affordability: 3,
        rating: 4,
      })
      .expect(403);
  });

  test("allows administrators to create, update, and delete locations", async () => {
    const passwordHash = await bcrypt.hash(validUser.password, 4);
    await User.create({
      email: "admin@example.com",
      passwordHash,
      role: "admin",
    });

    const agent = request.agent(app);
    await agent
      .post("/api/auth/login")
      .send({ email: "admin@example.com", password: validUser.password })
      .expect(200);

    const created = await agent
      .post("/api/locations")
      .send({
        locationName: "Museum",
        locationType: "indoor",
        mapURL: "https://maps.example/museum",
        affordability: 3,
        rating: 4,
      })
      .expect(201);

    await agent
      .put(`/api/locations/${created.body._id}`)
      .send({
        locationName: "Updated Museum",
        locationType: "indoor",
        mapURL: "https://maps.example/museum",
        affordability: 2,
        rating: 5,
      })
      .expect(200);

    await agent.delete(`/api/locations/${created.body._id}`).expect(200);
  });
});

describe("administrator bootstrap", () => {
  test("is idempotent and does not overwrite an existing account", async () => {
    process.env.ADMIN_EMAIL = "bootstrap@example.com";
    process.env.ADMIN_PASSWORD = "bootstrap-password";

    const first = await bootstrapAdmin();
    const originalHash = (await User.findById(first.id).select("+passwordHash"))
      .passwordHash;

    process.env.ADMIN_PASSWORD = "different-password";
    const second = await bootstrapAdmin();
    const stored = await User.findById(second.id).select("+passwordHash");

    assert.equal(first.id, second.id);
    assert.equal(stored.passwordHash, originalHash);
    assert.equal(stored.role, "admin");
    assert.equal(
      await User.countDocuments({ email: process.env.ADMIN_EMAIL }),
      1,
    );
  });

  test("does not promote an existing normal user", async () => {
    const existing = await User.create({
      email: "existing@example.com",
      passwordHash: await bcrypt.hash(validUser.password, 4),
    });
    process.env.ADMIN_EMAIL = existing.email;
    process.env.ADMIN_PASSWORD = "bootstrap-password";

    const result = await bootstrapAdmin();
    assert.equal(result.role, "user");
  });
});
