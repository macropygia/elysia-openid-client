import { sessionTypeBox } from "@/const";
import type { OidcClient } from "@/core/OidcClient";
import type { OIDCClientActiveSession } from "@/types";
import { sessionToStatus } from "@/utils/sessionToStatus";
import { Elysia } from "elysia";

/**
 * Session Status Endpoint
 * - No access to IdP
 * @param this OidcClient Instance
 * @returns ElysiaJS Plugin
 */
export function statusEndpoint(this: OidcClient) {
  const {
    settings: { statusPath },
    logger,
  } = this;

  if (!statusPath) {
    return new Elysia();
  }

  return new Elysia()
    .decorate({
      session: sessionTypeBox,
    })
    .all(
      statusPath,
      ({ set, session }) => {
        logger?.trace("endpoints/status");

        const currentSession = session as unknown as OIDCClientActiveSession;

        if (!currentSession) {
          logger?.warn("Session data does not exist");
          set.status = 401;
          return;
        }

        const status = sessionToStatus(currentSession, logger);

        set.headers["Content-Type"] = "application/json";
        return status;
      },
      {
        cookie: this.cookieTypeBox,
      },
    );
}
