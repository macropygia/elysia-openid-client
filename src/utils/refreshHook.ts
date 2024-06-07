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
export function refreshHook(this: OidcClient) {
  const {
    issuerUrl,
    settings: { pluginSeed },
    cookieSettings: { sessionIdName },
    authHookSettings: { autoRefresh },
    logger,
  } = this;

  logger?.trace("utils/refreshHook");

  let currentSession: OIDCClientActiveSession | null = null;

  /**
   * Delete Cookie and return response (401 or 500)
   */
  const abortSession = (
    cookie: Record<string, Cookie<string>>,
    status: number,
  ) => {
    deleteCookie(this, cookie);
    return new Response(null, { status });
  };

  return new Elysia({
    name: "elysia-openid-client-refresh-hook",
    seed: pluginSeed || issuerUrl,
  })
    .guard({
      cookie: this.cookieTypeBox,
    })
    .onBeforeHandle(
      {
        as: "scoped",
      },
      // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
      async ({ cookie }) => {
        logger?.trace("utils/refreshHook");

        const sessionId = cookie[sessionIdName].value as string | undefined;
        if (!sessionId) {
          logger?.debug("Session ID does not exist (refreshHook)");
          return abortSession(cookie, 401);
        }

        const staleSession = await this.fetchSession(sessionId);
        if (!staleSession) {
          logger?.debug("Session data does not exist (refreshHook)");
          return abortSession(cookie, 401);
        }

        const { idToken, accessToken, refreshToken } = staleSession;
        // biome-ignore lint/complexity/useSimplifiedLogicExpression: Short circuit
        if (!idToken || !accessToken) {
          logger?.warn("ID Token or Access Token does not exist (refreshHook)");
          await this.deleteSession(sessionId);
          return abortSession(cookie, 401);
        }

        const { iss, exp } = getClaimsFromIdToken(idToken);

        // Expired (auto refresh disabled or refresh token does not exist)
        // biome-ignore lint/complexity/useSimplifiedLogicExpression: Short circuit
        if (exp * 1000 < Date.now() && (!autoRefresh || !refreshToken)) {
          logger?.warn("Session expired (refreshHook)");
          await this.deleteSession(sessionId);
          return abortSession(cookie, 401);
        }

        // Expired (try to refresh)
        if (exp * 1000 < Date.now() && autoRefresh && refreshToken) {
          logger?.debug("Auto refresh triggered (refreshHook)");
          try {
            logger?.trace("openid-client(iss)/refresh");
            const tokenSet = await this.clients[iss].refresh(refreshToken);
            const newSession = await this.updateSession(sessionId, tokenSet);
            if (!newSession) {
              logger?.warn("Auto refresh failed (refreshHook)");
              return abortSession(cookie, 401);
            }
            logger?.debug("Auto refresh succeeded (refreshHook)");
            extendCookieExpiration(this, cookie);
            currentSession = newSession;
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
          currentSession = staleSession;
        }
      },
    )
    .resolve({ as: "scoped" }, () => ({
      sessionData: currentSession,
    }));
}
