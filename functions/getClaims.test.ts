import { describe, expect, test } from "bun:test";
import { logger, mockIdToken, mockIdTokenClaims } from "@/__test__/const";
import type { OidcClient } from "@/core/OidcClient";
import { getClaims } from "./getClaims";

describe("Unit/functions/getClaims", () => {
  test("Default", () => {
    expect(
      getClaims.bind({
        logger,
      } as unknown as OidcClient)(mockIdToken),
    ).toMatchObject(mockIdTokenClaims);
  });
});
