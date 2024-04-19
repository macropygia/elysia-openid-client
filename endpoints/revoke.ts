import type { OidcClient } from "@/core/OidcClient";
import { handleErrorResponse } from "@/core/handleErrorResponse";
import { Elysia } from "elysia";

/**
 * OIDC Token Revocation Endpoint
 * @param this OidcClient Instance
 * @returns ElysiaJS Plugin
 */
export function revoke(this: OidcClient) {
  const {
    settings: { revokePath },
    cookieSettings: { sessionIdName },
    logger,
  } = this;

  return new Elysia().all(
    revokePath,
    async ({ set, cookie }) => {
      logger?.trace("endpoints/revoke");

      const currentSession = await this.fetchSession(
        cookie[sessionIdName].value,
      );

      try {
        if (!currentSession) {
          throw new Error("Session does not exist");
        }

        logger?.trace("openid-client/revoke");
        await this.client.revoke(currentSession.idToken);

        const { sessionId } = currentSession;
        logger?.debug(`Revoke complete: ${sessionId}`);
        this.deleteSession(sessionId);
        // deleteCookie(this, cookie);

        set.status = 204;
        return;
      } catch (e: unknown) {
        logger?.warn("endpoints/revoke: Throw exception");
        logger?.debug(e);
        return handleErrorResponse(e, currentSession, this, cookie);
      }
    },
    {
      cookie: this.getCookieDefinition(),
    },
  );
}
