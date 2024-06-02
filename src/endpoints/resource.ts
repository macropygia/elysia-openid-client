import { sessionDataTypeBox } from "@/const";
import type { OidcClient } from "@/core/OidcClient";
import { handleErrorResponse } from "@/utils/handleErrorResponse";
import { Elysia, t } from "elysia";
import type { OIDCClientActiveSession } from "..";

/**
 * Resource Endpoint (GET)
 * - Returns resource
 * @param this OidcClient Instance
 * @returns ElysiaJS Plugin
 * @experimental
 */
export function resource(this: OidcClient) {
  const {
    settings: { resourcePath },
    logger,
  } = this;

  return new Elysia()
    .decorate({
      sessionData: sessionDataTypeBox,
    })
    .get(
      resourcePath,
      ({ query, cookie, set, sessionData }) => {
        logger?.trace("endpoints/resource");

        if (!query.url) {
          logger?.warn("Resource URL not specified");
          set.status = 400;
          return;
        }

        const currentSession =
          sessionData as unknown as OIDCClientActiveSession;

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
