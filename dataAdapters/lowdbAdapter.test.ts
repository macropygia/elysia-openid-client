import { describe, expect, test } from "bun:test";
import { mockActiveSession } from "@/__test__/const";
import { sleep } from "bun";
import { LowdbAdapter } from "./LowdbAdapter";

describe("Unit/dataAdapter/LowdbAdapter", () => {
  test("Default", async () => {
    const db = new LowdbAdapter();

    // Insert & fetch
    db.insert({
      ...mockActiveSession,
      sessionId: "session1",
      sessionExpiresAt: Date.now() + 10000,
    });
    expect(db.fetch("session1")?.sessionId).toBe("session1");

    db.insert({
      ...mockActiveSession,
      sessionId: "session2",
    });
    expect(db.fetch("session2")?.sessionId).toBe("session2");

    // Update
    const now = Date.now() - 1000;
    db.update({
      sessionId: "session2",
      sessionExpiresAt: now,
    });
    expect(db.fetch("session2")?.sessionExpiresAt).toBe(now);

    // Prune (manually)
    db.prune();
    await sleep(10);
    expect(db.fetch("session1")).toBeObject();
    expect(db.fetch("session2")).toBeNull();

    // Delete
    db.delete("session1");
    expect(db.fetch("session1")).toBeNull();

    db.close();
  });
});
