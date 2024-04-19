import type { OidcClient } from "@/core/OidcClient";
import { handleErrorResponse } from "@/core/handleErrorResponse";
import { Elysia, t } from "elysia";

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
    cookieSettings: { sessionIdName },
    logger,
  } = this;

  return new Elysia().get(
    resourcePath,
    async ({ query, cookie }) => {
      logger?.trace("endpoints/resource");

      if (!query.url) {
        logger?.warn("Resource URL not specified");
        return;
      }

      const currentSession = await this.fetchSession(
        cookie[sessionIdName].value,
      );

      try {
        if (!currentSession) {
          throw new Error("Session does not exist");
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
      cookie: this.getCookieDefinition(),
    },
  );
}
