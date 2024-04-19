import { afterAll, describe, expect, test } from "bun:test";
import { type DeepPartial, logger, mockActiveSession } from "@/__test__/const";
import type { OidcClient } from "@/core/OidcClient";
import { LokiInMemoryAdapter } from "@/dataAdapters/LokiInMemoryAdapter";
import { deleteSession } from "./deleteSession";

describe("Unit/functions/deleteSession", () => {
  const sessions = new LokiInMemoryAdapter();
  const mockClient = {
    sessions,
    logger,
  } as DeepPartial<OidcClient> as OidcClient;

  afterAll(() => {
    sessions.close();
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
      await deleteSession.bind(mockClient)(currentSessionId),
    ).toBeUndefined();

    const after = sessions.fetch(currentSessionId);
    expect(after).toBeNull();
  });

  test("Id does not exists", async () => {
    expect(await deleteSession.bind(mockClient)("invalidId")).toBeUndefined();
  });
});
