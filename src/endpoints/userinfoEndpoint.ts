import { sessionTypeBox } from "@/const";
import type { OidcClient } from "@/core/OidcClient";
import type { OIDCClientActiveSession } from "@/types";
import { handleErrorResponse } from "@/utils/handleErrorResponse";
import { Elysia } from "elysia";

/**
 * OIDC Userinfo Endpoint
 * @param this OidcClient Instance
 * @returns ElysiaJS Plugin
 */
export function userinfoEndpoint(this: OidcClient) {
  const {
    settings: { userinfoPath },
    logger,
  } = this;

  if (!userinfoPath) {
    return new Elysia();
  }

  return new Elysia()
    .decorate({
      session: sessionTypeBox,
    })
    .all(
      userinfoPath,
      async ({ set, cookie, session }) => {
        logger?.trace("endpoints/userinfo");

        const currentSession = session as unknown as OIDCClientActiveSession;

        try {
          if (!currentSession) {
            throw new Error("Session data does not exist");
          }

          logger?.trace("openid-client/userinfo");
          const userinfo = await this.client.userinfo(
            currentSession.accessToken,
          );

          set.headers["Content-Type"] = "application/json";
          return userinfo;
        } catch (e: unknown) {
          logger?.warn("endpoints/userinfo: Throw exception");
          logger?.debug(e);
          return handleErrorResponse(e, currentSession, this, cookie);
        }
      },
      {
        cookie: this.cookieTypeBox,
      },
    );
}
