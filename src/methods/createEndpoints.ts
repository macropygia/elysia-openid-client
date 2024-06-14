import type { OidcClient } from "@/core/OidcClient";
import { callbackEndpoint } from "@/endpoints/callbackEndpoint";
import { claimsEndpoint } from "@/endpoints/claimsEndpoint";
import { introspectEndpoint } from "@/endpoints/introspectEndpoint";
import { loginEndpoint } from "@/endpoints/loginEndpoint";
import { logoutEndpoint } from "@/endpoints/logoutEndpoint";
import { refreshEndpoint } from "@/endpoints/refreshEndpoint";
import { resourceEndpoint } from "@/endpoints/resourceEndpoint";
import { revokeEndpoint } from "@/endpoints/revokeEndpoint";
import { statusEndpoint } from "@/endpoints/statusEndpoint";
import { userinfoEndpoint } from "@/endpoints/userinfoEndpoint";
import { revalidateHook } from "@/utils/revalidateHook";
import Elysia from "elysia";

export function createEndpoints(this: OidcClient) {
  const {
    issuerUrl,
    settings: { pathPrefix, pluginSeed },
    logger,
  } = this;

  logger?.trace("methods/createEndpoints");

  const app = new Elysia({
    name: "elysia-openid-client-endpoints",
    seed: pluginSeed || issuerUrl,
  }).group(pathPrefix, (app) =>
    app
      // OIDC endpoints
      .use(loginEndpoint.call(this))
      .use(callbackEndpoint.call(this))
      .use(logoutEndpoint.call(this))
      .use(refreshEndpoint.call(this))
      .use(revokeEndpoint.call(this))
      .guard((app) =>
        app
          // Refresh hook (try to refresh if needed)
          .use(revalidateHook.call(this))
          // OIDC endpoints
          .use(userinfoEndpoint.call(this))
          .use(introspectEndpoint.call(this))
          .use(resourceEndpoint.call(this))
          // Other endpoints
          .use(statusEndpoint.call(this))
          .use(claimsEndpoint.call(this)),
      ),
  );

  return app;
}
