import type { OidcClient } from "@/core/OidcClient";
import type { OIDCClientActiveSession } from "@/types";
import { addShortId } from "@/utils/addShortId";
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

  logger?.trace("methods/updateSession");

  try {
    if (tokenSet.expired()) {
      logger?.info(addShortId("Session expired (tokenSet)", sessionId));
      await this.deleteSession(sessionId);
      return null;
    }
    const now = Date.now();
    const { id_token, access_token, refresh_token } = tokenSet;
    // biome-ignore lint/complexity/useSimplifiedLogicExpression: Short circuit
    if (!id_token || !access_token) {
      logger?.warn(addShortId("Token missing (tokenSet)", sessionId));
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
  } catch (e: unknown) {
    if (e instanceof Error) {
      logger?.warn(addShortId(e.message, sessionId));
    } else {
      logger?.warn(addShortId("Unknown error (update)", sessionId));
    }
  }
  return null;
}
