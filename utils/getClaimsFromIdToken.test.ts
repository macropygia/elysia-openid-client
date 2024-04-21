import { describe, expect, test } from "bun:test";
import { logger, mockIdToken, mockIdTokenClaims } from "@/__mock__/const";
import type { OidcClient } from "@/core/OidcClient";
import { getClaimsFromIdToken } from "./getClaimsFromIdToken";

describe("Unit/utils/getClaimsFromIdToken", () => {
  test("Default", () => {
    expect(
      getClaimsFromIdToken.bind({
        logger,
      } as unknown as OidcClient)(mockIdToken),
    ).toMatchObject(mockIdTokenClaims);
  });
});
