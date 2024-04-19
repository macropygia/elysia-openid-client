import type { OidcClient } from "@/core/OidcClient";
import { handleErrorResponse } from "@/core/handleErrorResponse";
import { Elysia } from "elysia";

/**
 * OIDC Userinfo Endpoint
 * @param this OidcClient Instance
 * @returns ElysiaJS Plugin
 */
export function userinfo(this: OidcClient) {
  const {
    settings: { userinfoPath },
    cookieSettings: { sessionIdName },
    logger,
  } = this;

  return new Elysia().all(
    userinfoPath,
    async ({ set, cookie }) => {
      logger?.trace("endpoints/userinfo");

      const currentSession = await this.fetchSession(
        cookie[sessionIdName].value,
      );

      try {
        if (!currentSession) {
          throw new Error("Session does not exist");
        }

        logger?.trace("openid-client/userinfo");
        const userinfo = await this.client.userinfo(currentSession.idToken);

        set.headers["Content-Type"] = "application/json";
        return userinfo;
      } catch (e: unknown) {
        logger?.warn("endpoints/userinfo: Throw exception");
        logger?.debug(e);
        return handleErrorResponse(e, currentSession, this, cookie);
      }
    },
    {
      cookie: this.getCookieDefinition(),
    },
  );
}
