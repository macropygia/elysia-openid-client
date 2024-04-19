import type { OidcClient } from "@/core/OidcClient";
import type { OIDCClientActiveSession, OIDCClientSessionStatus } from "@/types";

/**
 * Convert session data to session status
 * @param this OidcClient Instance
 * @returns Session status
 */
export function sessionToStatus(
  this: OidcClient,
  session: OIDCClientActiveSession,
): OIDCClientSessionStatus {
  const { logger } = this;
  const { idToken, sessionExpiresAt, refreshToken } = session;

  logger?.trace("functions/sessionToStatus");

  const { iss, exp, sub } = this.getClaims(idToken);
  return {
    sessionExpiresAt,
    hasRefreshToken: !!refreshToken,
    isExpired: exp * 1000 < Date.now(),
    expiresAt: exp * 1000,
    issuerUrl: iss,
    sub,
  };
}
