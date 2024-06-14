import type { OidcClient } from "@/core/OidcClient";
import { handleErrorResponse } from "@/utils/handleErrorResponse";
import { Elysia } from "elysia";

/**
 * OIDC Token Revocation Endpoint
 * @param this OidcClient Instance
 * @returns ElysiaJS Plugin
 */
export function revokeEndpoint(this: OidcClient) {
  const {
    settings: { revokePath },
    cookieSettings: { sessionIdName },
    logger,
  } = this;

  if (!revokePath) {
    return new Elysia();
  }

  return new Elysia().all(
    revokePath,
    async ({ set, cookie }) => {
      logger?.trace("endpoints/revoke");

      const staleSession = await this.fetchSession(cookie[sessionIdName].value);

      try {
        if (!staleSession) {
          throw new Error("Session data does not exist");
        }

        logger?.trace("openid-client/revoke");
        await this.client.revoke(staleSession.idToken);

        const { sessionId } = staleSession;
        logger?.debug(`Revoke completed: ${sessionId.slice(0, 8)}`);
        this.deleteSession(sessionId);
        // deleteCookie(this, cookie);

        set.status = 204;
        return;
      } catch (e: unknown) {
        logger?.warn("endpoints/revoke: Throw exception");
        logger?.debug(e);
        return handleErrorResponse(e, staleSession, this, cookie);
      }
    },
    {
      cookie: this.cookieTypeBox,
    },
  );
}
