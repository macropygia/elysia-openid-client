import type { OidcClient } from "@/core/OidcClient";
import { handleErrorResponse } from "@/core/handleErrorResponse";
import { Elysia } from "elysia";

/**
 * OIDC Token Introspection Endpoint
 * @param this OidcClient Instance
 * @returns ElysiaJS Plugin
 */
export function introspect(this: OidcClient) {
  const {
    settings: { introspectPath },
    cookieSettings: { sessionIdName },
    logger,
  } = this;

  return new Elysia().all(
    introspectPath,
    async ({ set, cookie }) => {
      logger?.trace("endpoints/introspect");

      const currentSession = await this.fetchSession(
        cookie[sessionIdName].value,
      );

      try {
        if (!currentSession) {
          throw new Error("Session does not exist");
        }

        logger?.trace("openid-client/introspect");
        const introspect = await this.client.introspect(currentSession.idToken);
        set.headers["Content-Type"] = "application/json";
        return introspect;
      } catch (e: unknown) {
        logger?.warn("endpoints/introspect: Throw exception");
        logger?.debug(e);
        return handleErrorResponse(e, currentSession, this, cookie);
      }
    },
    {
      cookie: this.getCookieDefinition(),
    },
  );
}
