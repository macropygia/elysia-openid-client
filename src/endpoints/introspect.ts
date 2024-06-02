import { sessionDataTypeBox } from "@/const";
import type { OidcClient } from "@/core/OidcClient";
import type { OIDCClientActiveSession } from "@/types";
import { handleErrorResponse } from "@/utils/handleErrorResponse";
import { Elysia } from "elysia";

/**
 * OIDC Token Introspection Endpoint
 * @param this OidcClient Instance
 * @returns ElysiaJS Plugin
 */
export function introspect(this: OidcClient) {
  const {
    settings: { introspectPath },
    logger,
  } = this;

  return new Elysia()
    .decorate({
      sessionData: sessionDataTypeBox,
    })
    .all(
      introspectPath,
      async ({ set, cookie, sessionData }) => {
        logger?.trace("endpoints/introspect");

        const currentSession =
          sessionData as unknown as OIDCClientActiveSession;

        try {
          if (!currentSession) {
            throw new Error("Session data does not exist");
          }

          logger?.trace("openid-client/introspect");
          const introspect = await this.client.introspect(
            currentSession.idToken,
          );
          set.headers["Content-Type"] = "application/json";
          return introspect;
        } catch (e: unknown) {
          logger?.warn("endpoints/introspect: Throw exception");
          logger?.debug(e);
          return handleErrorResponse(e, currentSession, this, cookie);
        }
      },
      {
        cookie: this.cookieTypeBox,
      },
    );
}
