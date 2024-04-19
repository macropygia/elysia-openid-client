import { describe, expect, mock, test } from "bun:test";
import {
  type DeepPartial,
  baseMockClient,
  logger,
  mockActiveSession,
} from "@/__test__/const";
import type { OidcClient } from "@/core/OidcClient";
import { LokiInMemoryAdapter } from "@/dataAdapters/LokiInMemoryAdapter";
import type { OIDCClientOptions } from "@/types";
import type { TokenSet } from "openid-client";
import { updateSession } from "./updateSession";

describe("Unit/functions/updateSession", () => {
  const sessions = new LokiInMemoryAdapter();
  const currentSessionId = "updateSession";
  sessions.insert({
    ...mockActiveSession,
    sessionId: currentSessionId,
  });

  const refreshExpiration = 1000;
  const mockClient = {
    ...baseMockClient,
    sessions,
    settings: { refreshExpiration },
    logger,
  } as DeepPartial<OIDCClientOptions> as OidcClient;

  const exp = Math.floor(Date.now() / 1000);
  test.each([
    {
      id_token: "new-id-token",
      access_token: "new-access-token",
      refresh_token: "new-refresh-token",
      expired: mock().mockReturnValue(false),
      claims: mock().mockReturnValue({ sub: "new-sub", exp }),
    } as unknown as TokenSet,
    {
      id_token: "new-id-token",
      access_token: "new-access-token",
      refresh_token: "new-refresh-token",
      expired: mock().mockReturnValue(true),
      claims: mock().mockReturnValue({ sub: "new-sub" }),
    } as unknown as TokenSet,
    {
      access_token: "new-access-token",
      refresh_token: "new-refresh-token",
      expired: mock().mockReturnValue(false),
      claims: mock().mockReturnValue({ sub: "new-sub" }),
    } as unknown as TokenSet,
    {
      id_token: "new-id-token",
      refresh_token: "new-refresh-token",
      expired: mock().mockReturnValue(false),
      claims: mock().mockReturnValue({ sub: "new-sub" }),
    } as unknown as TokenSet,
  ])("Default", async (tokenSet) => {
    const updateResult = await updateSession.bind(mockClient)(
      currentSessionId,
      tokenSet,
    );
    const now = Date.now();

    if (updateResult) {
      const result = sessions.fetch(currentSessionId);

      if (result) {
        expect(result.idToken).toBe("new-id-token");
        expect(result.accessToken).toBe("new-access-token");
        expect(result.refreshToken).toBe("new-refresh-token");
        expect(result.codeVerifier).toBeUndefined();
        expect(result.state).toBeUndefined();
        expect(result.nonce).toBeUndefined();
        expect(result.sessionExpiresAt).toBeGreaterThan(now);
      }
    } else {
      expect(updateResult).toBeNull();
    }

    // sessions.close();
  });
});
