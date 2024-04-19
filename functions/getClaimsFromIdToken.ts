import type { OidcClient } from "@/core/OidcClient";
import { type IdTokenClaims, TokenSet } from "openid-client";

export function getClaimsFromIdToken(
  this: OidcClient,
  idToken: string,
): IdTokenClaims {
  const { logger } = this;

  logger?.trace("functions/getClaimsFromIdToken");

  const tokenSet = new TokenSet({
    id_token: idToken,
  });

  return tokenSet.claims();
}
