import { describe, expect, test } from "bun:test";
import { lowMockFile, mockActiveSession } from "@/__mock__/const";
import { sleep } from "bun";
import { LowdbAdapter } from "./LowdbAdapter";

describe("Unit/dataAdapter/LowdbAdapter", () => {
  test("Default", async () => {
    const db = await LowdbAdapter.create();

    // Insert & fetch
    await db.insert({
      ...mockActiveSession,
      sessionId: "session1",
      sessionExpiresAt: Date.now() + 10000,
    });
    expect(db.fetch("session1")?.sessionId).toBe("session1");

    await db.insert({
      ...mockActiveSession,
      sessionId: "session2",
    });
    expect(db.fetch("session2")?.sessionId).toBe("session2");

    // Update
    const now = Date.now() - 1000;
    await db.update({
      sessionId: "session2",
      sessionExpiresAt: now,
    });
    expect(db.fetch("session2")?.sessionExpiresAt).toBe(now);

    // Prune (manually)
    await db.prune();
    await sleep(10);
    expect(db.fetch("session1")).toBeObject();
    expect(db.fetch("session2")).toBeNull();

    // Delete
    await db.delete("session1");
    expect(db.fetch("session1")).toBeNull();

    await db.close();
  });

  // NOTES: Does not work only in test (due to Bun?)
  // biome-ignore lint/suspicious/noSkippedTests: <explanation>
  test.skip("Load existing database", async () => {
    const db = await LowdbAdapter.create({
      filename: lowMockFile,
    });
    expect(db.fetch(mockActiveSession.sessionId)).toMatchObject(
      mockActiveSession,
    );
  });
});
