import { sessionTypeBox } from "@/const";
import type { OidcClient } from "@/core/OidcClient";
import type { OIDCClientActiveSession } from "@/types";
import { handleErrorResponse } from "@/utils/handleErrorResponse";
import { Elysia, t } from "elysia";

/**
 * Resource Endpoint (GET)
 * - Returns resource
 * @param this OidcClient Instance
 * @returns ElysiaJS Plugin
 * @experimental
 */
export function resourceEndpoint(this: OidcClient) {
  const {
    settings: { resourcePath },
    logger,
  } = this;

  if (!resourcePath) {
    return new Elysia();
  }

  return new Elysia()
    .decorate({
      session: sessionTypeBox,
    })
    .get(
      resourcePath,
      ({ query, cookie, set, session }) => {
        logger?.trace("endpoints/resource");

        if (!query.url) {
          logger?.warn("Resource URL not specified");
          set.status = 400;
          return;
        }

        const currentSession = session as unknown as OIDCClientActiveSession;

        try {
          if (!currentSession) {
            throw new Error("Session data does not exist");
          }

          logger?.debug(`Resource URL: ${query.url}`);
          const { accessToken } = currentSession;
          logger?.trace("openid-client/requestResource");
          const response = this.client.requestResource(
            decodeURIComponent(query.url),
            accessToken,
            {
              method: "GET",
            },
          );
          return response;
        } catch (e: unknown) {
          logger?.warn("endpoints/request: Throw exception");
          logger?.debug(e);
          return handleErrorResponse(e, currentSession, this, cookie);
        }
      },
      {
        query: t.Object({
          /** Encoded Resource URL */
          url: t.Optional(t.String()),
        }),
        cookie: this.cookieTypeBox,
      },
    );
}
