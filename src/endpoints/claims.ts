import { sessionDataTypeBox } from "@/const";
import type { OidcClient } from "@/core/OidcClient";
import { getClaimsFromIdToken } from "@/utils/getClaimsFromIdToken";
import { Elysia } from "elysia";
import type { OIDCClientActiveSession } from "..";

/**
 * Id Token Claims Endpoint
 * - No access to IdP
 * @param this OidcClient Instance
 * @returns ElysiaJS Plugin
 */
export function claims(this: OidcClient) {
  const {
    settings: { claimsPath },
    logger,
  } = this;

  return new Elysia()
    .decorate({
      sessionData: sessionDataTypeBox,
    })
    .all(
      claimsPath,
      ({ set, sessionData }) => {
        logger?.trace("endpoints/claims");

        const currentSession =
          sessionData as unknown as OIDCClientActiveSession;

        if (!currentSession) {
          logger?.warn("Session data does not exist");
          set.status = 401;
          return;
        }

        const { idToken } = currentSession;
        const claims = getClaimsFromIdToken(idToken, logger);

        set.headers["Content-Type"] = "application/json";
        return claims;
      },
      {
        cookie: this.cookieTypeBox,
      },
    );
}
