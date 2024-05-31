import { describe, expect, test } from "bun:test";
import fs from "node:fs";
import { mockActiveSession, sqliteMockFile, sqliteTempFile } from "@mock/const";
import { sleep } from "bun";
import { SQLiteAdapter } from "./SQLiteAdapter";

describe("Unit/dataAdapter/SQLiteAdapter", () => {
  test("Default", () => {
    const db = new SQLiteAdapter();

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
    expect(db.fetch("session1")).toBeObject();
    expect(db.fetch("session2")).toBeNull();

    // Delete
    db.delete("session1");
    expect(db.fetch("session1")).toBeNull();

    db.close();
  });

  test("Load existing database", () => {
    const db = new SQLiteAdapter({
      filename: sqliteMockFile,
    });
    expect(db.fetch(mockActiveSession.sessionId)).toMatchObject(
      mockActiveSession,
    );
    db.close();
  });

  test("Create database", async () => {
    const db = new SQLiteAdapter({
      filename: sqliteTempFile,
    });
    db.close();

    await sleep(100);
    expect(fs.existsSync(db.options.filename)).toBeTruthy();
    await sleep(100);
    fs.unlinkSync(db.options.filename);
  });
});
