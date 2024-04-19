import type { OidcClient } from "@/core/OidcClient";
import { deleteCookie } from "@/core/deleteCookie";
import { extendCookieExpiration } from "@/core/extendCookieExpiration";
import type {
  AuthHookOptions,
  OIDCClientActiveSession,
  OIDCClientSessionStatus,
} from "@/types";
import { type Cookie, Elysia } from "elysia";
import type { IdTokenClaims } from "openid-client";

/**
 * Before handle for restricted area
 * @param this OidcClient Instance
 * @returns ElysiaJS Plugin
 */
export function getAuthHook(
  this: OidcClient,
  options?: Partial<AuthHookOptions>,
) {
  const {
    issuerUrl,
    settings: { pathPrefix, loginPath, pluginSeed },
    cookieSettings: { sessionIdName },
    logger,
  } = this;

  logger?.trace("functions/getAuthHook");

  const defaultOptions: AuthHookOptions = {
    scope: "scoped",
    loginRedirectUrl: `${pathPrefix}${loginPath}`,
    disableRedirect: false,
    autoRefresh: true,
  };

  const { scope, loginRedirectUrl, disableRedirect, autoRefresh } = {
    ...defaultOptions,
    ...options,
  };

  let resolvedStatus: OIDCClientSessionStatus | null = null;
  let resolvedSession: OIDCClientActiveSession | null = null;
  let resolvedClaims: IdTokenClaims | null = null;

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const abort = (set: any, cookie: Record<string, Cookie<string>>) => {
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
      cookie: this.getCookieDefinition(),
    })
    .onBeforeHandle(
      {
        as: scope,
      },
      // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
      async ({ cookie, set, request: { method } }) => {
        // Ignore non-GET methods
        if (method.toLowerCase() !== "get") {
          logger?.debug("Method is not GET (authHook)");
          return;
        }

        const sessionId = cookie[sessionIdName].value;
        const currentSession = await this.fetchSession(sessionId);

        if (!currentSession) {
          logger?.debug("Session does not exist (authHook)");
          abort(set, cookie);
          return;
        }

        const { idToken, accessToken, refreshToken } = currentSession;

        // biome-ignore lint/complexity/useSimplifiedLogicExpression: <explanation>
        if (!idToken || !accessToken) {
          logger?.warn("Token does not exist (authHook)");
          await this.deleteSession(sessionId);
          abort(set, cookie);
          return;
        }

        resolvedClaims = this.getClaims(idToken);
        const { exp } = resolvedClaims;

        // Expired (auto refresh disabled or refresh token does not exist)
        // biome-ignore lint/complexity/useSimplifiedLogicExpression: <explanation>
        if (exp * 1000 < Date.now() && (!autoRefresh || !refreshToken)) {
          logger?.warn("Session expired (authHook)");
          await this.deleteSession(sessionId);
          abort(set, cookie);
          return;
        }

        // Auto refresh
        if (exp * 1000 < Date.now() && autoRefresh && refreshToken) {
          logger?.debug("Auto refresh triggered (authHook)");
          try {
            logger?.trace("openid-client/refresh");
            const tokenSet = await this.client.refresh(refreshToken);
            const newSession = await this.updateSession(sessionId, tokenSet);
            if (!newSession) {
              logger?.warn("Session renew failed (authHook)");
              resolvedClaims = null;
              abort(set, cookie);
              return;
            }

            extendCookieExpiration(this, cookie);

            resolvedSession = newSession;
            resolvedClaims = this.getClaims(newSession.idToken);
          } catch (e: unknown) {
            logger?.warn("Throw exception (authHook");
            logger?.debug(e);
            await this.deleteSession(sessionId);
            deleteCookie(this, cookie);
            if (e instanceof Error) {
              return new Response(null, { status: 401 });
            }
            return new Response(null, { status: 500 });
          }
        } else {
          resolvedSession = currentSession;
        }
        resolvedStatus = this.sessionToStatus(resolvedSession);
      },
    )
    .resolve({ as: "global" }, () => ({
      // sessionData: resolvedSession,
      sessionStatus: resolvedStatus,
      sessionClaims: resolvedClaims,
    }));
}
