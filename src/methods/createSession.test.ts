import { afterAll, beforeEach, describe, expect, test } from "bun:test";
import { SQLiteAdapter } from "@/dataAdapters/SQLiteAdapter";
import { mockBaseClient, mockResetRecursively } from "@mock/const";
import { createSession } from "./createSession";

describe("Unit/methods/createSession", () => {
  const sessions = new SQLiteAdapter();

  beforeEach(() => {
    mockResetRecursively(mockBaseClient);
    mockBaseClient.client.authorizationUrl = () => "authorizationUrl";
    mockBaseClient.settings.loginExpiration = 60 * 10 * 1000;
    mockBaseClient.sessions = sessions;
  });

  afterAll(() => {
    sessions.close();
  });

  test("Default", async () => {
    const [sessionId, authorizationUrl] =
      await createSession.call(mockBaseClient);
    expect(sessionId).toBeTypeOf("string");
    expect(sessionId.length).toBe(43);
    expect(authorizationUrl).toBe("authorizationUrl");

    const record = sessions.fetch(sessionId);
    expect(record?.sessionId === sessionId);
    expect(record?.sessionExpiresAt).toBeTypeOf("number");
    expect(record?.codeVerifier).toBeTypeOf("string");
    expect(record?.state).toBeTypeOf("string");
    expect(record?.nonce).toBeTypeOf("string");

    console.debug("Inserted record", record);
  });
});
