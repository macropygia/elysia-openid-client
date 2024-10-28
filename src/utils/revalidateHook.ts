import type { OidcClient } from "@/core/OidcClient";
import type { OIDCClientActiveSession } from "@/types";
import { deleteCookie } from "@/utils/deleteCookie";
import { extendCookieExpiration } from "@/utils/extendCookieExpiration";
import { getClaimsFromIdToken } from "@/utils/getClaimsFromIdToken";
import { type Cookie, Elysia } from "elysia";
import { addShortId } from "./addShortId.ts";

/**
 * Before handle for auto refresh
 * @param this OidcClient Instance
 * @returns ElysiaJS Plugin
 */
export function revalidateHook(this: OidcClient) {
  const {
    issuerUrl,
    settings: { pluginSeed },
    cookieSettings: { sessionIdName },
    authHookSettings: { autoRefresh },
    logger,
  } = this;

  logger?.trace("utils/revalidateHook");

  let currentSession: OIDCClientActiveSession | null = null;

  /**
   * Delete Cookie and return response (401 or 500)
   */
  const abortSession = (
    cookie: Record<string, Cookie<string | undefined>>,
    status: 401 | 500,
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
        logger?.trace("utils/revalidateHook");

        const sessionId = cookie[sessionIdName].value;
        if (!sessionId) {
          logger?.debug("Session ID does not exist (revalidateHook)");
          return abortSession(cookie, 401);
        }

        const staleSession = await this.fetchSession(sessionId);
        if (!staleSession) {
          logger?.debug(
            addShortId(
              "Session data does not exist (revalidateHook)",
              sessionId,
            ),
          );
          return abortSession(cookie, 401);
        }

        const { idToken, accessToken, refreshToken } = staleSession;

        // biome-ignore lint/complexity/useSimplifiedLogicExpression: Short circuit
        if (!idToken || !accessToken) {
          logger?.warn(
            addShortId(
              "ID Token or Access Token does not exist (revalidateHook)",
              sessionId,
            ),
          );
          await this.deleteSession(sessionId);
          return abortSession(cookie, 401);
        }

        const { iss, exp } = getClaimsFromIdToken(idToken);

        if (exp * 1000 < Date.now()) {
          if (autoRefresh && refreshToken) {
            logger?.debug(
              addShortId("Auto refresh triggered (revalidateHook)", sessionId),
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
                  addShortId("Auto refresh failed (revalidateHook)", sessionId),
                );
                return abortSession(cookie, 401);
              }

              logger?.debug(
                addShortId(
                  "Auto refresh succeeded (revalidateHook)",
                  sessionId,
                ),
              );
              extendCookieExpiration(this, cookie);

              currentSession = renewedSession;
            } catch (e: unknown) {
              logger?.warn(
                addShortId("Throw exception (revalidateHook)", sessionId),
              );
              logger?.debug(e);
              await this.deleteSession(sessionId);
              if (e instanceof Error) {
                return abortSession(cookie, 401);
              }
              return abortSession(cookie, 500);
            }
          } else {
            logger?.info(
              addShortId("Session expired (revalidateHook)", sessionId),
            );
            await this.deleteSession(sessionId);

            return abortSession(cookie, 401);
          }
        } else {
          logger?.debug(
            addShortId("Session alive (revalidateHook)", sessionId),
          );
          currentSession = staleSession;
        }
      },
    )
    .resolve({ as: "scoped" }, () => ({
      session: currentSession,
    }));
}
