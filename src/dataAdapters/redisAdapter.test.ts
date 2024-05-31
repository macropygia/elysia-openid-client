import { describe, expect, test } from "bun:test";
import { mockActiveSession, mockLoginSession } from "@mock/const";
import { RedisAdapter } from "./RedisAdapter";

describe("Unit/dataAdapter/RedisAdapter", () => {
  test.skipIf(!process.env.REDIS_HOST)("Default", async () => {
    const db = new RedisAdapter({
      port: Number(process.env.REDIS_PORT) || 6379,
      host: process.env.REDIS_HOST || "localhost",
    });
    // Insert & fetch
    await db.insert({
      ...mockActiveSession,
      sessionId: "session1",
      sessionExpiresAt: Date.now() + 10000,
    });
    expect((await db.fetch("session1"))?.sessionId).toBe("session1");

    await db.insert({
      ...mockLoginSession,
      sessionId: "session2",
    });
    expect((await db.fetch("session2"))?.sessionId).toBe("session2");

    // Update
    const now = Date.now() + 1000;
    await db.update({
      ...mockActiveSession,
      sessionId: "session2",
      sessionExpiresAt: now,
    });
    expect((await db.fetch("session2"))?.sessionExpiresAt).toBe(now);

    // Delete
    await db.delete("session1");
    expect(await db.fetch("session1")).toBeNull();

    await db.flushAll();
    await db.close();
  });
});
