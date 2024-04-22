import { afterAll, describe, expect, test } from "bun:test";
import {
  mockActiveSession,
  mockBaseClient,
  mockResetRecursively,
} from "@/__mock__/const";
import { SQLiteAdapter } from "@/dataAdapters/SQLiteAdapter";
import { deleteSession } from "./deleteSession";

describe("Unit/methods/deleteSession", () => {
  const sessions = new SQLiteAdapter();
  mockBaseClient.sessions = sessions;

  afterAll(() => {
    sessions.close();
    mockResetRecursively(mockBaseClient);
  });

  test("Default", async () => {
    const currentSessionId = "deleteSession.Default";
    sessions.insert({
      ...mockActiveSession,
      sessionId: currentSessionId,
    });

    const before = sessions.fetch(currentSessionId);
    expect(before).toBeTruthy();

    expect(
      await deleteSession.call(mockBaseClient, currentSessionId),
    ).toBeUndefined();

    const after = sessions.fetch(currentSessionId);
    expect(after).toBeNull();
  });

  test("Id does not exist", async () => {
    expect(
      await deleteSession.call(mockBaseClient, "invalidId"),
    ).toBeUndefined();
  });
});
