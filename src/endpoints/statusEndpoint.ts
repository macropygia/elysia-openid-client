import { sessionDataTypeBox } from "@/const";
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

  return new Elysia()
    .decorate({
      sessionData: sessionDataTypeBox,
    })
    .all(
      statusPath,
      ({ set, sessionData }) => {
        logger?.trace("endpoints/status");

        const currentSession =
          sessionData as unknown as OIDCClientActiveSession;

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
