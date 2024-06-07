import type { OidcClient } from "@/core/OidcClient";
import type { OIDCClientActiveSession } from "@/types";
import { extendCookieExpiration } from "@/utils";
import { deleteCookie } from "@/utils/deleteCookie";
import type { Cookie } from "elysia";
import { TokenSet } from "openid-client";

/**
 * @experimental
 */
export async function refreshSession(
  this: OidcClient,
  sessionId: string,
  cookie: Record<string, Cookie<string>>,
): Promise<OIDCClientActiveSession | null> {
  const { logger } = this;

  logger?.trace("methods/refreshSession");

  const staleSession = await this.fetchSession(sessionId);

  if (!staleSession) {
    return null;
  }

  const { idToken, refreshToken } = staleSession;
  const tokenSet = new TokenSet({ id_token: idToken });
  if (tokenSet.expired()) {
    if (refreshToken) {
      logger?.trace("openid-client/refresh");
      const tokenSet = await this.client.refresh(refreshToken);
      const renewedSession = await this.updateSession(sessionId, tokenSet);
      if (renewedSession) {
        extendCookieExpiration(this, cookie);
        return renewedSession;
      }
    }
    await this.deleteSession(sessionId);
    deleteCookie(this, cookie);
    return null;
  }

  return staleSession;
}
