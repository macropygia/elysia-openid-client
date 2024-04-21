import type { OidcClient } from "@/core/OidcClient";
import type { OIDCClientActiveSession } from "@/types";

export async function fetchSession(
  this: OidcClient,
  sessionId: string | undefined,
): Promise<OIDCClientActiveSession | null> {
  const { sessions, logger } = this;

  logger?.trace("functions/fetchSession");

  // Existence of Cookie
  if (!sessionId) {
    logger?.debug("Session ID does not exist (fetch)");
    return null;
  }

  // Existence of Session in DB
  const currentSession = await sessions.fetch(sessionId);
  if (!currentSession) {
    logger?.debug("Session data does not exist (fetch)");
    return null;
  }

  const { sessionExpiresAt, codeVerifier, state, nonce, idToken, accessToken } =
    currentSession;

  // Check internal expiration
  if (sessionExpiresAt < Date.now()) {
    logger?.debug("Session expired internally (fetch)");
    await this.deleteSession(sessionId);
    return null;
  }

  const hasHash = Boolean(codeVerifier && state && nonce);
  const hasToken = Boolean(idToken && accessToken);

  if (hasHash === hasToken) {
    logger?.debug(
      "Either tokens and hashes do not exist, or both do exist (fetch)",
    );
    await this.deleteSession(sessionId);
    return null;
  }

  return currentSession as OIDCClientActiveSession;
}
