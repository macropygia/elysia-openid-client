import type { OidcClient } from "@/core/OidcClient";
import { handleErrorResponse } from "@/utils/handleErrorResponse";
import { Elysia } from "elysia";

/**
 * Login Endpoint (GET)
 * - Redirect to OIDC authorization endpoint
 * @param this OidcClient Instance
 * @returns ElysiaJS Plugin
 */
export function login(this: OidcClient) {
  const {
    settings: { loginPath, loginExpiration },
    cookieSettings: {
      sessionIdName,
      httpOnly,
      secure,
      sameSite,
      path,
      expires,
    },
    logger,
  } = this;

  return new Elysia().get(
    loginPath,
    async ({ cookie, set }) => {
      logger?.trace("endpoints/login");

      try {
        const [sessionId, authorizationUrl] = await this.createSession();
        logger?.debug(`Session ID: ${sessionId}`);
        logger?.debug(`Authorization URL: ${authorizationUrl}`);

        cookie[sessionIdName].set({
          value: sessionId,
          httpOnly,
          secure,
          sameSite,
          path,
          expires:
            expires === 0 ? undefined : new Date(Date.now() + loginExpiration),
        });

        set.status = 303;
        set.redirect = authorizationUrl;
        return;
      } catch (e: unknown) {
        logger?.warn("endpoints/revoke: Throw exception");
        logger?.debug(e);
        return handleErrorResponse(e, null, this, cookie);
      }
    },
    {
      cookie: this.getCookieDefinition(),
    },
  );
}
