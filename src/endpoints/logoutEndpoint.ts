import type { OidcClient } from "@/core/OidcClient";
import { deleteCookie } from "@/utils/deleteCookie";
import { handleErrorResponse } from "@/utils/handleErrorResponse";
import { Elysia } from "elysia";

/**
 * Logout Endpoint (GET)
 * - Redirect to OIDC End Session Endpoint
 * @param this OidcClient Instance
 * @returns ElysiaJS Plugin
 */
export function logoutEndpoint(this: OidcClient) {
  const {
    baseUrl,
    settings: { logoutPath, logoutCompletedPath },
    cookieSettings: { sessionIdName },
    logger,
  } = this;

  if (!logoutPath) {
    return new Elysia();
  }

  const logoutCompletedUrl = logoutCompletedPath.startsWith("/")
    ? `${baseUrl}${logoutCompletedPath}`
    : logoutCompletedPath;

  return new Elysia().get(
    logoutPath,
    async ({ set, cookie }) => {
      logger?.trace("endpoints/logout");

      const staleSession = await this.fetchSession(cookie[sessionIdName].value);

      try {
        if (!staleSession) {
          throw new Error("Session data does not exist");
        }

        const { sessionId } = staleSession;
        await this.deleteSession(sessionId);
        deleteCookie(this, cookie);

        logger?.trace("openid-client/endSessionUrl");
        const endSessionUrl = this.client.endSessionUrl({
          id_token_hint: staleSession.idToken,
          post_logout_redirect_uri: logoutCompletedUrl,
        });

        set.status = 303;
        set.redirect = endSessionUrl;
        return;
      } catch (e: unknown) {
        logger?.warn("endpoints/logout: Throw exception");
        logger?.debug(e);
        return handleErrorResponse(e, staleSession, this, cookie);
      }
    },
    {
      cookie: this.cookieTypeBox,
    },
  );
}
