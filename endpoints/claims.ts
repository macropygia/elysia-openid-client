import type { OidcClient } from "@/core/OidcClient";
import { getClaimsFromIdToken } from "@/utils/getClaimsFromIdToken";
import { Elysia } from "elysia";

/**
 * Id Token Claims Endpoint
 * - No access to IdP
 * @param this OidcClient Instance
 * @returns ElysiaJS Plugin
 */
export function claims(this: OidcClient) {
  const {
    settings: { claimsPath },
    cookieSettings: { sessionIdName },
    logger,
  } = this;

  return new Elysia().all(
    claimsPath,
    async ({ set, cookie }) => {
      logger?.trace("endpoints/claims");

      const currentSession = await this.fetchSession(
        cookie[sessionIdName].value,
      );
      if (!currentSession) {
        logger?.warn("Session does not exist");
        set.status = 401;
        return;
      }

      const { idToken } = currentSession;
      const claims = getClaimsFromIdToken(idToken, logger);

      set.headers["Content-Type"] = "application/json";
      return claims;
    },
    {
      cookie: this.getCookieDefinition(),
    },
  );
}
