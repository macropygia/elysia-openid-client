import type { OidcClient } from "@/core/OidcClient";
import { sessionToStatus } from "@/utils/sessionToStatus";
import { Elysia } from "elysia";

/**
 * Session Status Endpoint
 * - No access to IdP
 * @param this OidcClient Instance
 * @returns ElysiaJS Plugin
 */
export function status(this: OidcClient) {
  const {
    settings: { statusPath },
    cookieSettings: { sessionIdName },
    logger,
  } = this;

  return new Elysia().all(
    statusPath,
    async ({ set, cookie }) => {
      logger?.trace("endpoints/status");

      const currentSession = await this.fetchSession(
        cookie[sessionIdName].value,
      );
      if (!currentSession) {
        logger?.warn("Session does not exist");
        set.status = 401;
        return;
      }

      const status = sessionToStatus(currentSession, logger);

      set.headers["Content-Type"] = "application/json";
      return status;
    },
    {
      cookie: this.getCookieDefinition(),
    },
  );
}
