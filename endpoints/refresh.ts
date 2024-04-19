import type { OidcClient } from "@/core/OidcClient";
import { deleteCookie } from "@/core/deleteCookie";
import { extendCookieExpiration } from "@/core/extendCookieExpiration";
import { handleErrorResponse } from "@/core/handleErrorResponse";
import { Elysia } from "elysia";

/**
 * OIDC Token Refresh Endpoint
 * @param this OidcClient Instance
 * @returns ElysiaJS Plugin
 */
export function refresh(this: OidcClient) {
  const {
    settings: { refreshPath },
    cookieSettings: { sessionIdName },
    logger,
  } = this;

  return new Elysia().all(
    refreshPath,
    async ({ set, cookie }) => {
      logger?.trace("endpoints/refresh");

      const currentSession = await this.fetchSession(
        cookie[sessionIdName].value,
      );

      try {
        if (!currentSession) {
          throw new Error("Session does not exist");
        }

        const { sessionId, refreshToken } = currentSession;
        if (!refreshToken) {
          throw new Error("Refresh token does not exist");
        }

        logger?.trace("openid-client/refresh");
        const tokenSet = await this.client.refresh(refreshToken);
        const newSession = await this.updateSession(sessionId, tokenSet);
        if (!newSession) {
          deleteCookie(this, cookie);
          set.status = 401;
          return;
        }

        extendCookieExpiration(this, cookie);

        set.headers["Content-Type"] = "application/json";
        return tokenSet.claims();
      } catch (e: unknown) {
        logger?.warn("endpoints/refresh: Throw exception");
        logger?.debug(e);
        return handleErrorResponse(e, currentSession, this, cookie);
      }
    },
    {
      cookie: this.getCookieDefinition(),
    },
  );
}
