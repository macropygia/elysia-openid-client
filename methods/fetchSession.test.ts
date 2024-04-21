import { describe, expect, mock, test } from "bun:test";
import { type DeepPartial, logger } from "@/__test__/const";
import type { OidcClient } from "@/core/OidcClient";
import type { OIDCClientActiveSession } from "@/types";
import { fetchSession } from "./fetchSession";

describe("Unit/methods/fetchSession", () => {
  const mockClient = mock(
    (session: Partial<OIDCClientActiveSession> | null) =>
      ({
        sessions: {
          fetch: mock().mockReturnValue(session),
        },
        deleteSession: mock(),
        logger,
      }) as DeepPartial<OidcClient> as OidcClient,
  );

  test("`sessionId` missing", async () => {
    const result = await fetchSession.call(mockClient(null), undefined);
    expect(result).toBeNull();
  });

  test("Invalid session", async () => {
    const result = await fetchSession.call(mockClient(null), "mock-session");
    expect(result).toBeNull();
  });

  test("Expired", async () => {
    const result = await fetchSession.call(
      mockClient({
        sessionExpiresAt: Date.now() - 1000,
      }),
      "mock-session",
    );
    expect(result).toBeNull();
  });

  test("Before verify", async () => {
    const sessionExpiresAt = Date.now() + 1000;
    const session = {
      sessionExpiresAt,
      codeVerifier: "mock-code-verifier",
      state: "mock-state",
      nonce: "mock-nonce",
    };
    const result = await fetchSession.call(mockClient(session), "mock-session");
    expect(result).toMatchObject(session);
  });

  test("After verify", async () => {
    const sessionExpiresAt = Date.now() + 1000;
    const session = {
      sessionExpiresAt,
      idToken: "mock-idToken",
      accessToken: "mock-accessToken",
      refreshToken: "mock-refreshToken",
    };
    const result = await fetchSession.call(mockClient(session), "mock-session");
    expect(result).toMatchObject(session);
  });

  test.each([
    {
      sessionExpiresAt: Date.now() + 1000,
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
    },
    {
      sessionExpiresAt: Date.now() + 1000,
      idToken: "mock-id-token",
      refreshToken: "mock-refresh-token",
    },
  ])("Required tokenSet property missing", async (session) => {
    const result = await fetchSession.call(mockClient(session), "mock-session");
    expect(result).toBeNull();
  });
});
