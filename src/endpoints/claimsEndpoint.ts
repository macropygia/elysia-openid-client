import { sessionTypeBox } from "@/const";
import type { OidcClient } from "@/core/OidcClient";
import type { OIDCClientActiveSession } from "@/types";
import { getClaimsFromIdToken } from "@/utils/getClaimsFromIdToken";
import { Elysia } from "elysia";

/**
 * Id Token Claims Endpoint
 * - No access to IdP
 * @param this OidcClient Instance
 * @returns ElysiaJS Plugin
 */
export function claimsEndpoint(this: OidcClient) {
  const {
    settings: { claimsPath },
    logger,
  } = this;

  if (!claimsPath) {
    return new Elysia();
  }

  return new Elysia()
    .decorate({
      session: sessionTypeBox,
    })
    .all(
      claimsPath,
      ({ set, session }) => {
        logger?.trace("endpoints/claims");

        const currentSession = session as unknown as OIDCClientActiveSession;

        if (!currentSession) {
          logger?.warn("Session data does not exist");
          set.status = 401;
          return;
        }

        const { idToken } = currentSession;
        const claims = getClaimsFromIdToken(idToken);

        set.headers["Content-Type"] = "application/json";
        return claims;
      },
      {
        cookie: this.cookieTypeBox,
      },
    );
}
