import { beforeEach, describe, expect, test } from "bun:test";
import {
  mockClearRecursively,
  mockIdToken,
  mockIdTokenClaims,
  mockLogger,
} from "@/__mock__/const";
import { getClaimsFromIdToken } from "./getClaimsFromIdToken";

describe("Unit/utils/getClaimsFromIdToken", () => {
  beforeEach(() => {
    mockClearRecursively(mockLogger);
  });

  test("Default", () => {
    const result = getClaimsFromIdToken(mockIdToken, mockLogger);

    expect(result).toMatchObject(mockIdTokenClaims);
    expect(mockLogger.trace).toHaveBeenCalledTimes(1);
  });
});
