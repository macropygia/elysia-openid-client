import { describe, expect, test } from "bun:test";
import { mockActiveSessionWithRealIdToken, mockLogger } from "@/mock/const";
import { sessionToStatus } from "./sessionToStatus.ts";

describe("Unit/utils/sessionToStatus", () => {
  test("Default", () => {
    const result = sessionToStatus(
      mockActiveSessionWithRealIdToken,
      mockLogger,
    );
    expect(result).toMatchObject({
      expiresAt: 5000000000000,
      hasRefreshToken: true,
      isExpired: false,
      iss: "https://op.example.com",
      sessionExpiresAt: 5000000000000,
      sub: "mock-sub",
    });
  });
});
