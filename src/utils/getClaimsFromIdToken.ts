import type { OIDCClientLogger } from "@/types";
import { type IdTokenClaims, TokenSet } from "openid-client";

/**
 * Decode ID Token and output claims
 * @param idToken ID Token
 * @param logger Logger
 * @returns Session claims
 */
export function getClaimsFromIdToken(
  idToken: string,
  logger?: OIDCClientLogger,
): IdTokenClaims {
  logger?.trace("functions/getClaimsFromIdToken");

  const tokenSet = new TokenSet({
    id_token: idToken,
  });

  return tokenSet.claims();
}
