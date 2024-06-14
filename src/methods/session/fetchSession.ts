import type { OidcClient } from "@/core/OidcClient";
import type { OIDCClientActiveSession } from "@/types";
import { addShortId } from "@/utils/addShortId";

export async function fetchSession(
  this: OidcClient,
  sessionId: string | undefined,
): Promise<OIDCClientActiveSession | null> {
  const { sessions, logger } = this;

  logger?.trace("methods/fetchSession");

  // Existence of Cookie
  if (!sessionId) {
    logger?.debug("Session ID does not exist (fetch)");
    return null;
  }

  // Existence of Session in DB
  const currentSession = await sessions.fetch(sessionId);
  if (!currentSession) {
    logger?.debug(addShortId("Session data does not exist (fetch)", sessionId));
    return null;
  }

  const { sessionExpiresAt, codeVerifier, state, nonce, idToken, accessToken } =
    currentSession;

  // Check internal expiration
  if (sessionExpiresAt < Date.now()) {
    logger?.debug(addShortId("Session expired internally (fetch)", sessionId));
    await this.deleteSession(sessionId);
    return null;
  }

  const hasHash = Boolean(codeVerifier && state && nonce);
  const hasToken = Boolean(idToken && accessToken);

  if (hasHash === hasToken) {
    logger?.debug(
      addShortId(
        "Either tokens and hashes do not exist, or both do exist (fetch)",
        sessionId,
      ),
    );
    await this.deleteSession(sessionId);
    return null;
  }

  return currentSession as OIDCClientActiveSession;
}
