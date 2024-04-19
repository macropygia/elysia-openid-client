import type { OidcClient } from "@/core/OidcClient";
import type { OIDCClientActiveSession } from "@/types";
import type { TokenSet } from "openid-client";

export async function updateSession(
  this: OidcClient,
  sessionId: string,
  tokenSet: TokenSet,
): Promise<OIDCClientActiveSession | null> {
  const {
    settings: { refreshExpiration },
    sessions,
    logger,
  } = this;

  logger?.trace("functions/updateSession");

  if (tokenSet.expired()) {
    logger?.info("Session expired (tokenSet)");
    await this.deleteSession(sessionId);
    return null;
  }
  const now = Date.now();
  const { id_token, access_token, refresh_token } = tokenSet;
  // biome-ignore lint/complexity/useSimplifiedLogicExpression: <explanation>
  if (!id_token || !access_token) {
    logger?.warn("Token missing (tokenSet)");
    await this.deleteSession(sessionId);
    return null;
  }
  const newSession: OIDCClientActiveSession = {
    sessionId,
    sessionExpiresAt: now + refreshExpiration,
    idToken: id_token,
    accessToken: access_token,
    refreshToken: refresh_token,
    codeVerifier: undefined,
    state: undefined,
    nonce: undefined,
  };
  await sessions.update(newSession);
  return newSession;
}
