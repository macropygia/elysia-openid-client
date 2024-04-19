import { describe, expect, mock, test } from "bun:test";
import { type DeepPartial, baseMockClient } from "@/__test__/const";
import type { OidcClient } from "@/core/OidcClient";
import type { OIDCClientActiveSession } from "@/types";
import { sessionToStatus } from "./sessionToStatus";

describe("Unit/functions/sessionToStatus", () => {
  test("Default", () => {
    const mockClient = {
      ...baseMockClient,
      getClaims: mock().mockReturnValue({
        iss: "mock-issuer",
        exp: 1000,
        sub: "mock-sub",
      }),
    } as DeepPartial<OidcClient> as OidcClient;
    const result = sessionToStatus.bind(mockClient)({
      idToken: "mock-id-token",
      sessionExpiresAt: 2000,
      refreshToken: "mock-refresh-token",
    } as OIDCClientActiveSession);
    expect(result).toMatchObject({
      expiresAt: 1000000,
      hasRefreshToken: true,
      isExpired: true,
      issuerUrl: "mock-issuer",
      sessionExpiresAt: 2000,
      sub: "mock-sub",
    });
  });
});
