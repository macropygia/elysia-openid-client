import type { OidcClient } from "@/core";
import type { OIDCClientActiveSession, OIDCClientMethodArgs } from "@/types";
import {
  deleteCookie,
  extendCookieExpiration,
  getClaimsFromIdToken,
} from "@/utils";
import { addShortId } from "@/utils/addShortId";
import type { BaseClient } from "openid-client";

export async function revalidateSession(
  this: OidcClient,
  args: OIDCClientMethodArgs,
): Promise<{
  currentSession: OIDCClientActiveSession;
  resolvedClient: BaseClient;
} | null> {
  const {
    authHookSettings: { autoRefresh },
    logger,
  } = this;
  const { cookie, session, forceRefresh, isRevoke } = args;

  logger?.trace("revalidateSession");

  if (!session) {
    logger?.debug("Session does not exist (revalidateSession)");
    return null;
  }

  const { sessionId, idToken, refreshToken } = session;

  const { iss, exp } = getClaimsFromIdToken(idToken);

  if (!this.clients[iss]) {
    logger?.warn(
      `Client for the specified issuer does not exist (revalidateSession): ${iss}`,
    );
    await this.deleteSession(sessionId);
    deleteCookie(this, cookie);
    return null;
  }

  if (exp * 1000 < Date.now()) {
    if (!isRevoke && (forceRefresh || autoRefresh) && refreshToken) {
      logger?.debug(
        addShortId("Auto refresh triggered (revalidateSession)", sessionId),
      );

      try {
        logger?.debug(`openid-client/refresh: ${iss}`);
        const tokenSet = await this.clients[iss].refresh(refreshToken);

        const renewedSession = await this.updateSession(sessionId, tokenSet);

        if (!renewedSession) {
          logger?.warn(
            addShortId("Auto refresh failed (revalidateSession)", sessionId),
          );
          deleteCookie(this, cookie);
          return null;
        }

        logger?.debug(
          addShortId("Auto refresh succeeded (revalidateSession)", sessionId),
        );
        extendCookieExpiration(this, cookie);

        return {
          currentSession: renewedSession,
          resolvedClient: this.clients[iss],
        };
      } catch (e: unknown) {
        logger?.warn(
          addShortId("Throw exception (revalidateSession)", sessionId),
        );
        logger?.debug(e);
        await this.deleteSession(sessionId);
        deleteCookie(this, cookie);
        return null;
      }
    }

    logger?.info(addShortId("Session expired (revalidateSession)", sessionId));
    await this.deleteSession(sessionId);
    deleteCookie(this, cookie);

    return null;
  }

  logger?.debug(addShortId("Session alive (revalidateSession)", sessionId));
  return {
    currentSession: session,
    resolvedClient: this.clients[iss],
  };
}
