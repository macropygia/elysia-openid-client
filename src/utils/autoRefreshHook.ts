import type { OidcClient } from "@/core/OidcClient";
import type { OIDCClientActiveSession } from "@/types";
import { deleteCookie } from "@/utils/deleteCookie";
import { extendCookieExpiration } from "@/utils/extendCookieExpiration";
import { getClaimsFromIdToken } from "@/utils/getClaimsFromIdToken";
import { type Cookie, Elysia } from "elysia";

/**
 * Before handle for auto refresh
 * @param this OidcClient Instance
 * @returns ElysiaJS Plugin
 */
export function autoRefreshHook(this: OidcClient) {
  const {
    issuerUrl,
    settings: { pluginSeed },
    cookieSettings: { sessionIdName },
    authHookSettings: { scope, autoRefresh },
    logger,
  } = this;

  logger?.trace("methods/createrefreshHook");

  let resolvedSession: OIDCClientActiveSession | null = null;

  /**
   * Delete Cookie and set redirect to loginRedirectUrl
   */
  const abortSession = (
    cookie: Record<string, Cookie<string>>,
    status: number,
  ) => {
    deleteCookie(this, cookie);
    return new Response(null, { status });
  };

  return new Elysia({
    name: "elysia-openid-client-auto-refresh-hook",
    seed: pluginSeed || issuerUrl,
  })
    .guard({
      cookie: this.cookieTypeBox,
    })
    .onBeforeHandle(
      {
        as: scope,
      },
      // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
      async ({ cookie }) => {
        logger?.trace("utils/autoRefreshHook");

        const sessionId = cookie[sessionIdName].value as string | undefined;
        if (!sessionId) {
          logger?.debug("Session ID does not exist (refreshHook)");
          return abortSession(cookie, 401);
        }

        const currentSession = await this.fetchSession(sessionId);
        if (!currentSession) {
          logger?.debug("Session data does not exist (refreshHook)");
          return abortSession(cookie, 401);
        }

        const { idToken, accessToken, refreshToken } = currentSession;
        // biome-ignore lint/complexity/useSimplifiedLogicExpression: Short circuit
        if (!idToken || !accessToken) {
          logger?.warn("ID Token or Access Token does not exist (refreshHook)");
          await this.deleteSession(sessionId);
          return abortSession(cookie, 401);
        }

        const claims = getClaimsFromIdToken(idToken, logger);
        const { exp } = claims;

        // Expired (auto refresh disabled or refresh token does not exist)
        // biome-ignore lint/complexity/useSimplifiedLogicExpression: Short circuit
        if (exp * 1000 < Date.now() && (!autoRefresh || !refreshToken)) {
          logger?.warn("Session expired (refreshHook)");
          await this.deleteSession(sessionId);
          return abortSession(cookie, 401);
        }

        // Auto refresh
        if (exp * 1000 < Date.now() && autoRefresh && refreshToken) {
          logger?.debug("Auto refresh triggered (refreshHook)");
          try {
            logger?.trace("openid-client/refresh");
            const tokenSet = await this.client.refresh(refreshToken);
            const newSession = await this.updateSession(sessionId, tokenSet);
            if (!newSession) {
              logger?.warn("Session renew failed (refreshHook)");
              return abortSession(cookie, 401);
            }
            extendCookieExpiration(this, cookie);
            resolvedSession = newSession;
          } catch (e: unknown) {
            logger?.warn("Throw exception (refreshHook)");
            logger?.debug(e);
            await this.deleteSession(sessionId);
            if (e instanceof Error) {
              return abortSession(cookie, 401);
            }
            return abortSession(cookie, 500);
          }
        } else {
          resolvedSession = currentSession;
        }
      },
    )
    .resolve({ as: "scoped" }, () => ({
      sessionData: resolvedSession,
    }));
}
