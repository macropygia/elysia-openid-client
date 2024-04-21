import { describe, expect, test } from "bun:test";
import { logger } from "@/__test__/const";
import type { OIDCClientActiveSession } from "@/types";
import { sessionToStatus } from "./sessionToStatus";

describe("Unit/functions/sessionToStatus", () => {
  test("Default", () => {
    const result = sessionToStatus(
      {
        idToken: "mock-id-token",
        sessionExpiresAt: 2000,
        refreshToken: "mock-refresh-token",
      } as OIDCClientActiveSession,
      logger,
    );
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
