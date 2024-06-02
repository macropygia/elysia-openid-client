import type { OidcClient } from "@/core/OidcClient";
import { callback } from "@/endpoints/callback";
import { claims } from "@/endpoints/claims";
import { introspect } from "@/endpoints/introspect";
import { login } from "@/endpoints/login";
import { logout } from "@/endpoints/logout";
import { refresh } from "@/endpoints/refresh";
import { resource } from "@/endpoints/resource";
import { revoke } from "@/endpoints/revoke";
import { status } from "@/endpoints/status";
import { userinfo } from "@/endpoints/userinfo";
import { autoRefreshHook } from "@/utils/autoRefreshHook";
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
      .use(login.call(this))
      .use(callback.call(this))
      .use(logout.call(this))
      .use(refresh.call(this))
      .use(revoke.call(this))
      .guard((app) =>
        // Auto Refresh
        app
          .use(autoRefreshHook.call(this))
          // OIDC endpoints
          .use(userinfo.call(this))
          .use(introspect.call(this))
          .use(resource.call(this))
          // Other endpoints
          .use(status.call(this))
          .use(claims.call(this)),
      ),
  );

  return app;
}
