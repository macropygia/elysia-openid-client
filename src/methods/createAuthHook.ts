import type { OidcClient } from "@/core/OidcClient";
import type { OIDCClientActiveSession, OIDCClientSessionStatus } from "@/types";
import { deleteCookie } from "@/utils/deleteCookie";
import { extendCookieExpiration } from "@/utils/extendCookieExpiration";
import { getClaimsFromIdToken } from "@/utils/getClaimsFromIdToken";
import { sessionToStatus } from "@/utils/sessionToStatus";
import { type Cookie, Elysia } from "elysia";
import type { Context } from "elysia/context";
import type { IdTokenClaims } from "openid-client";

/**
 * Before handle for restricted area
 * @param this OidcClient Instance
 * @returns ElysiaJS Plugin
 */
export function createAuthHook(this: OidcClient) {
  const {
    issuerUrl,
    settings: { pluginSeed },
    cookieSettings: { sessionIdName },
    authHookSettings: { loginRedirectUrl, disableRedirect, autoRefresh },
    logger,
  } = this;

  logger?.trace("methods/createAuthHook");

  let currentStatus: OIDCClientSessionStatus | null = null;
  let currentSession: OIDCClientActiveSession | null = null;
  let currentClaims: IdTokenClaims | null = null;

  /**
   * Delete Cookie and set redirect to loginRedirectUrl
   */
  const abortSession = (
    set: Context["set"],
    cookie: Record<string, Cookie<string>>,
  ) => {
    deleteCookie(this, cookie);
    if (!disableRedirect) {
      set.status = 303;
      set.redirect = loginRedirectUrl;
    }
  };

  return new Elysia({
    name: "elysia-openid-client-auth-hook",
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
      async ({ cookie, set, request: { method } }) => {
        // Ignore non-GET methods
        if (method.toLowerCase() !== "get") {
          logger?.debug("Method is not GET (authHook)");
          return;
        }

        const sessionId = cookie[sessionIdName].value as string | undefined;
        if (!sessionId) {
          logger?.debug("Session ID does not exist (authHook)");
          abortSession(set, cookie);
          return;
        }

        const staleSession = await this.fetchSession(sessionId);
        if (!staleSession) {
          logger?.debug("Session data does not exist (authHook)");
          abortSession(set, cookie);
          return;
        }

        const { idToken, accessToken, refreshToken } = staleSession;
        // biome-ignore lint/complexity/useSimplifiedLogicExpression: Short circuit
        if (!idToken || !accessToken) {
          logger?.warn("ID Token or Access Token does not exist (authHook)");
          await this.deleteSession(sessionId);
          abortSession(set, cookie);
          return;
        }

        currentClaims = getClaimsFromIdToken(idToken);
        const { exp } = currentClaims;

        // Expired (auto refresh disabled or refresh token does not exist)
        // biome-ignore lint/complexity/useSimplifiedLogicExpression: Short circuit
        if (exp * 1000 < Date.now() && (!autoRefresh || !refreshToken)) {
          logger?.warn("Session expired (authHook)");
          await this.deleteSession(sessionId);
          abortSession(set, cookie);
          return;
        }

        // Expired (try to refresh)
        if (exp * 1000 < Date.now() && autoRefresh && refreshToken) {
          logger?.debug("Auto refresh triggered (authHook)");
          try {
            logger?.trace("openid-client/refresh");
            const tokenSet = await this.client.refresh(refreshToken);
            const newSession = await this.updateSession(sessionId, tokenSet);
            if (!newSession) {
              logger?.warn("Auto refresh failed (authHook)");
              currentClaims = null;
              abortSession(set, cookie);
              return;
            }
            logger?.debug("Auto refresh succeeded (authHook)");
            extendCookieExpiration(this, cookie);
            currentSession = newSession;
            currentClaims = getClaimsFromIdToken(newSession.idToken);
          } catch (e: unknown) {
            logger?.warn("Throw exception (authHook)");
            logger?.debug(e);
            await this.deleteSession(sessionId);
            deleteCookie(this, cookie);
            if (e instanceof Error) {
              return new Response(null, { status: 401 });
            }
            return new Response(null, { status: 500 });
          }
        } else {
          currentSession = staleSession;
        }

        currentStatus = sessionToStatus(currentSession, logger);
      },
    )
    .resolve({ as: "scoped" }, () => ({
      session: currentSession,
      sessionStatus: currentStatus,
      sessionClaims: currentClaims,
    }));
}
