import type { OidcClient } from "@/core/OidcClient";
import type { OIDCClientActiveSession, OIDCClientSessionStatus } from "@/types";
import { addShortId } from "@/utils/addShortId";
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
    cookie: Record<string, Cookie<string | undefined>>,
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

        const sessionId = cookie[sessionIdName].value;
        if (!sessionId) {
          logger?.debug("Session ID does not exist (authHook)");
          abortSession(set, cookie);
          return;
        }

        const staleSession = await this.fetchSession(sessionId);
        if (!staleSession) {
          logger?.debug(
            addShortId("Session data does not exist (authHook)", sessionId),
          );
          abortSession(set, cookie);
          return;
        }

        const { idToken, accessToken, refreshToken } = staleSession;
        // biome-ignore lint/complexity/useSimplifiedLogicExpression: Short circuit
        if (!idToken || !accessToken) {
          logger?.warn(
            addShortId(
              "ID Token or Access Token does not exist (authHook)",
              sessionId,
            ),
          );
          await this.deleteSession(sessionId);
          abortSession(set, cookie);
          return;
        }

        currentClaims = getClaimsFromIdToken(idToken);
        const { exp, iss } = currentClaims;

        if (exp * 1000 < Date.now()) {
          if (autoRefresh && refreshToken) {
            logger?.debug(
              addShortId("Auto refresh triggered (authHook)", sessionId),
            );

            try {
              logger?.debug(`openid-client/refresh: ${iss}`);

              const tokenSet = await this.clients[iss].refresh(refreshToken);

              const renewedSession = await this.updateSession(
                sessionId,
                tokenSet,
              );

              if (!renewedSession) {
                logger?.warn(
                  addShortId("Auto refresh failed (authHook)", sessionId),
                );
                currentClaims = null;
                abortSession(set, cookie);
                return;
              }

              logger?.debug(
                addShortId("Auto refresh succeeded (authHook)", sessionId),
              );
              extendCookieExpiration(this, cookie);

              currentSession = renewedSession;
              currentClaims = getClaimsFromIdToken(renewedSession.idToken);
            } catch (e: unknown) {
              logger?.warn(addShortId("Throw exception (authHook)", sessionId));
              logger?.debug(e);
              await this.deleteSession(sessionId);
              deleteCookie(this, cookie);
              if (e instanceof Error) {
                return new Response(null, { status: 401 });
              }
              return new Response(null, { status: 500 });
            }
          } else {
            logger?.info(addShortId("Session expired (authHook)", sessionId));
            await this.deleteSession(sessionId);
            abortSession(set, cookie);

            return;
          }
        } else {
          logger?.debug(addShortId("Session alive (authHook)", sessionId));
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
