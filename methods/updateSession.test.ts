import { afterAll, beforeEach, describe, expect, mock, test } from "bun:test";
import {
  type DeepPartial,
  mockActiveSession,
  mockBaseClient,
  mockResetRecursively,
} from "@/__mock__/const";
import type { OidcClient } from "@/core/OidcClient";
import { SQLiteAdapter } from "@/dataAdapters/SQLiteAdapter";
import type { OIDCClientOptions } from "@/types";
import type { TokenSet } from "openid-client";
import { updateSession } from "./updateSession";

describe("Unit/methods/updateSession", () => {
  const sessions = new SQLiteAdapter();
  sessions.insert({
    ...mockActiveSession,
  });

  const refreshExpiration = 1000;
  const mockClient = {
    ...mockBaseClient,
    sessions,
    settings: { refreshExpiration },
  } as DeepPartial<OIDCClientOptions> as OidcClient;

  const { logger } = mockClient;

  beforeEach(() => {
    mockResetRecursively(mockClient);
  });

  afterAll(() => {
    sessions.close();
    mockResetRecursively(mockBaseClient);
  });

  test("Expired", async () => {
    const result = await updateSession.call(
      mockClient,
      mockActiveSession.sessionId,
      {
        expired: () => true,
      } as unknown as TokenSet,
    );

    expect(result).toBeNull();
    expect(mockClient.deleteSession).toHaveBeenCalledTimes(1);
    expect(logger?.info).toHaveBeenCalledWith("Session expired (tokenSet)");
  });

  test.each([
    {
      id_token: "mock-id-token",
    },
    {
      access_token: "mock-access-token",
    },
  ])("Token does not exist", async (tokenParts) => {
    const result = await updateSession.call(
      mockClient,
      mockActiveSession.sessionId,
      {
        expired: () => false,
        ...tokenParts,
      } as unknown as TokenSet,
    );

    expect(result).toBeNull();
    expect(mockClient.deleteSession).toHaveBeenCalledTimes(1);
    expect(logger?.warn).toHaveBeenCalledWith("Token missing (tokenSet)");
  });

  test("Error", async () => {
    mockClient.sessions.update = mock().mockImplementation(() => {
      throw new Error("Error");
    });

    const result = await updateSession.call(
      mockClient,
      mockActiveSession.sessionId,
      {
        expired: () => false,
        id_token: "mock-id-token",
        access_token: "mock-access-token",
      } as unknown as TokenSet,
    );

    expect(result).toBeNull();
    expect(logger?.warn).toHaveBeenCalledWith("Error");
  });

  test("Unknown error", async () => {
    mockClient.sessions.update = mock().mockImplementation(() => {
      throw "Unknown error";
    });

    const result = await updateSession.call(
      mockClient,
      mockActiveSession.sessionId,
      {
        expired: () => false,
        id_token: "mock-id-token",
        access_token: "mock-access-token",
      } as unknown as TokenSet,
    );

    expect(result).toBeNull();
    expect(logger?.warn).toHaveBeenCalledWith("Unknown error (update)");
  });

  test("Succeeded", async () => {
    const result = await updateSession.call(
      mockClient,
      mockActiveSession.sessionId,
      {
        expired: () => false,
        id_token: "mock-id-token",
        access_token: "mock-access-token",
      } as unknown as TokenSet,
    );

    expect(result).toMatchObject({
      accessToken: "mock-access-token",
      codeVerifier: undefined,
      idToken: "mock-id-token",
      nonce: undefined,
      refreshToken: undefined,
      sessionExpiresAt: expect.any(Number),
      sessionId: "mock-session-id",
      state: undefined,
    });
  });
});
