import type { OidcClient } from "@/core/OidcClient";
import { deleteCookie } from "@/utils/deleteCookie";
import { extendCookieExpiration } from "@/utils/extendCookieExpiration";
import { handleErrorResponse } from "@/utils/handleErrorResponse";
import { Elysia } from "elysia";

/**
 * Callback Endpoint (GET)
 * - Redirected from IdP, to access OIDC token endpoint
 * @param this OidcClient Instance
 * @returns ElysiaJS Plugin
 */
export function callback(this: OidcClient) {
  const {
    baseUrl,
    settings,
    settings: { callbackPath },
    cookieSettings: { sessionIdName },
    authParams: { redirect_uri },
    logger,
  } = this;
  const callbackCompletedPath = settings.callbackCompletedPath.startsWith("/")
    ? `${baseUrl}${settings.callbackCompletedPath}`
    : settings.callbackCompletedPath;

  return new Elysia().get(
    callbackPath,
    async ({ cookie, set, request }) => {
      logger?.trace("endpoints/callback");

      logger?.debug(`Session ID (Cookie): ${cookie[sessionIdName].value}`);
      const currentSession = await this.fetchSession(
        cookie[sessionIdName].value,
      );

      try {
        if (!currentSession) {
          throw new Error("Session does not exist");
        }

        const { sessionId, codeVerifier, state, nonce } = currentSession;
        logger?.silent(currentSession);

        // biome-ignore lint/complexity/useSimplifiedLogicExpression: Short circuit
        if (!codeVerifier || !state || !nonce) {
          throw new Error("Hash generation failure");
        }

        logger?.trace("openid-client/callbackParams");
        const params = this.client.callbackParams(request.url);
        logger?.debug(params);

        logger?.trace("openid-client/callback");
        const tokenSet = await this.client.callback(redirect_uri, params, {
          code_verifier: codeVerifier,
          state,
          nonce,
        });
        logger?.silent(tokenSet);
        const newSession = await this.updateSession(sessionId, tokenSet);
        if (!newSession) {
          deleteCookie(this, cookie);
          throw new Error("Session update failed");
        }

        extendCookieExpiration(this, cookie);
        logger?.debug(`Redirect to: ${callbackCompletedPath}`);
        set.redirect = callbackCompletedPath;
        return;
      } catch (e: unknown) {
        logger?.warn("endpoints/callback: Throw exception");
        logger?.debug(e);
        return handleErrorResponse(e, currentSession, this, cookie);
      }
    },
    {
      cookie: this.getCookieDefinition(),
    },
  );
}
