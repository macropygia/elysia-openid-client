import type { OidcClient } from "@/core/OidcClient";
import { deleteCookie } from "@/utils/deleteCookie";
import { extendCookieExpiration } from "@/utils/extendCookieExpiration";
import { handleErrorResponse } from "@/utils/handleErrorResponse";
import { Elysia } from "elysia";

/**
 * OIDC Token Refresh Endpoint
 * @param this OidcClient Instance
 * @returns ElysiaJS Plugin
 */
export function refreshEndpoint(this: OidcClient) {
  const {
    settings: { refreshPath },
    cookieSettings: { sessionIdName },
    logger,
  } = this;

  if (!refreshPath) {
    return new Elysia();
  }

  return new Elysia().all(
    refreshPath,
    async ({ set, cookie }) => {
      logger?.trace("endpoints/refresh");

      const staleSession = await this.fetchSession(cookie[sessionIdName].value);

      try {
        if (!staleSession) {
          throw new Error("Session data does not exist");
        }

        const { sessionId, refreshToken } = staleSession;
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
        return handleErrorResponse(e, staleSession, this, cookie);
      }
    },
    {
      cookie: this.cookieTypeBox,
    },
  );
}
