import { afterAll, beforeEach, describe, expect, test } from "bun:test";
import {
  mockActiveSession,
  mockBaseClient,
  mockResetRecursively,
  mockSessionId,
} from "@/mock/const";
import type { OIDCClientDataAdapter, OIDCClientSession } from "@/types";
import { addShortId } from "@/utils/addShortId";
import { fetchSession } from "./fetchSession.ts";

describe("Unit/methods/fetchSession", () => {
  const mockSession = (session: OIDCClientSession | null) =>
    ({
      fetch: () => session,
    }) as unknown as OIDCClientDataAdapter;
  const { logger } = mockBaseClient;

  beforeEach(() => {
    mockResetRecursively(mockBaseClient);
  });

  afterAll(() => {
    mockResetRecursively(mockBaseClient);
  });

  test("Session ID does not exist", async () => {
    mockBaseClient.sessions = mockSession(null);

    const result = await fetchSession.call(mockBaseClient, undefined);

    expect(result).toBeNull();
    expect(logger?.debug).toHaveBeenCalledWith(
      "Session ID does not exist (fetch)",
    );
  });

  test("Session data does not exist", async () => {
    mockBaseClient.sessions = mockSession(null);

    const result = await fetchSession.call(mockBaseClient, "mock-session");

    expect(result).toBeNull();
    expect(logger?.debug).toHaveBeenCalledWith(
      addShortId("Session data does not exist (fetch)", mockSessionId),
    );
  });

  test("Expired", async () => {
    mockBaseClient.sessions = mockSession({
      ...mockActiveSession,
      sessionExpiresAt: Date.now() - 1000,
    });

    const result = await fetchSession.call(mockBaseClient, "mock-session");

    expect(result).toBeNull();
    expect(logger?.debug).toHaveBeenCalledWith(
      addShortId("Session expired internally (fetch)", mockSessionId),
    );
    expect(mockBaseClient.deleteSession).toHaveBeenCalledTimes(1);
  });

  test.each([
    {
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
    },
    {
      idToken: "mock-id-token",
      refreshToken: "mock-refresh-token",
    },
    {
      codeVerifier: "mock-code-verifier",
      state: "mock-state",
    },
    {
      codeVerifier: "mock-code-verifier",
      nonce: "mock-nonce",
    },
    {
      state: "mock-state",
      nonce: "mock-nonce",
    },
  ])("Invalid sessions", async (invalidSession) => {
    mockBaseClient.sessions = mockSession({
      sessionId: "mock-session-id",
      sessionExpiresAt: Date.now() + 1000,
      ...invalidSession,
    } as unknown as OIDCClientSession);

    const result = await fetchSession.call(mockBaseClient, "mock-session");

    expect(result).toBeNull();
    expect(mockBaseClient.deleteSession).toHaveBeenCalledTimes(1);
    expect(logger?.debug).toHaveBeenCalledWith(
      addShortId(
        "Either tokens and hashes do not exist, or both do exist (fetch)",
        mockSessionId,
      ),
    );
  });

  test.each([
    {
      idToken: "mock-id-token",
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
    },
    {
      idToken: "mock-id-token",
      accessToken: "mock-access-token",
    },
    {
      codeVerifier: "mock-code-verifier",
      state: "mock-state",
      nonce: "mock-nonce",
    },
  ])("Valid sessions", async (validSession) => {
    const sessionExpiresAt = Date.now() + 1000;
    mockBaseClient.sessions = mockSession({
      sessionId: "mock-session-id",
      sessionExpiresAt,
      ...validSession,
    } as unknown as OIDCClientSession);

    const result = await fetchSession.call(mockBaseClient, "mock-session");

    expect(result).toMatchObject({
      sessionId: "mock-session-id",
      sessionExpiresAt,
      ...validSession,
    });
  });
});
