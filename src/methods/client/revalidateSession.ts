import type { OidcClient } from "@/core";
import type { OIDCClientActiveSession, OIDCClientMethodArgs } from "@/types";
import {
  deleteCookie,
  extendCookieExpiration,
  getClaimsFromIdToken,
} from "@/utils";
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
  const { cookie, staleSession, forceRefresh, isRevoke } = args;

  logger?.trace("revalidateSession");

  const { iss, exp } = getClaimsFromIdToken(staleSession.idToken);

  if (!this.clients[iss]) {
    logger?.warn(
      `Client for the specified issuer does not exist (revalidateSession): ${iss}`,
    );
    await this.deleteSession(staleSession.sessionId);
    deleteCookie(this, cookie);
    return null;
  }

  if (exp * 1000 < Date.now()) {
    if (
      !isRevoke &&
      (forceRefresh || autoRefresh) &&
      staleSession.refreshToken
    ) {
      logger?.debug("Auto refresh triggered (revalidateSession)");

      logger?.trace("openid-client(iss)/refresh");
      const tokenSet = await this.clients[iss].refresh(
        staleSession.refreshToken,
      );

      const renewedSession = await this.updateSession(
        staleSession.sessionId,
        tokenSet,
      );

      if (!renewedSession) {
        logger?.warn("Auto refresh failed (revalidateSession)");
        deleteCookie(this, cookie);
        return null;
      }

      logger?.debug("Auto refresh succeeded (revalidateSession)");
      extendCookieExpiration(this, cookie);

      return {
        currentSession: renewedSession,
        resolvedClient: this.clients[iss],
      };
    }

    logger?.debug("Expired (revalidateSession)");
    await this.deleteSession(staleSession.sessionId);
    deleteCookie(this, cookie);

    return null;
  }

  logger?.debug("Alive (revalidateSession)");
  return {
    currentSession: staleSession,
    resolvedClient: this.clients[iss],
  };
}
