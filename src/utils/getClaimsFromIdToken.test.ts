import { describe, expect, test } from "bun:test";
import { mockIdToken, mockIdTokenClaims } from "@/mock/const";
import { getClaimsFromIdToken } from "./getClaimsFromIdToken.ts";

describe("Unit/utils/getClaimsFromIdToken", () => {
  test("Default", () => {
    const result = getClaimsFromIdToken(mockIdToken);

    expect(result).toMatchObject(mockIdTokenClaims);
  });
});
