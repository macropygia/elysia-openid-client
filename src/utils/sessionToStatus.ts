import type {
  OIDCClientActiveSession,
  OIDCClientLogger,
  OIDCClientSessionStatus,
} from "@/types";
import { getClaimsFromIdToken } from "./getClaimsFromIdToken";

/**
 * Convert session data to session status
 * @param session Session data
 * @param logger Logger
 * @returns Session status
 */
export function sessionToStatus(
  session: OIDCClientActiveSession,
  logger?: OIDCClientLogger,
): OIDCClientSessionStatus {
  const { idToken, sessionExpiresAt, refreshToken } = session;

  logger?.trace("utils/sessionToStatus");

  const { iss, exp, sub } = getClaimsFromIdToken(idToken, logger);
  return {
    sessionExpiresAt,
    hasRefreshToken: !!refreshToken,
    isExpired: exp * 1000 < Date.now(),
    expiresAt: exp * 1000,
    issuerUrl: iss,
    sub,
  };
}
