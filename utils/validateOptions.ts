import type { BaseOidcClient } from "@/core/BaseOidcClient";

/**
 * Validate options
 * @param ctx OIDCClient Instance
 */
export function validateOptions(ctx: BaseOidcClient) {
  const {
    baseUrl,
    settings: {
      pathPrefix,
      loginPath,
      callbackPath,
      logoutPath,
      userinfoPath,
      refreshPath,
      introspectPath,
      revokePath,
      statusPath,
    },
    logger,
  } = ctx;

  logger?.trace("functions/validateOptions");

  if (!ctx.clientMetadata.client_secret) {
    throw new Error("client_secret is required");
  }

  // Check path duplication
  const paths = [
    loginPath,
    callbackPath,
    logoutPath,
    userinfoPath,
    refreshPath,
    introspectPath,
    revokePath,
    statusPath,
  ];
  if (paths.length !== new Set(paths).size) {
    throw new Error("Duplicate path");
  }

  if (
    ctx.authParams.response_mode &&
    ctx.authParams.response_mode !== "query"
  ) {
    throw new Error("response_mode must be query or undefined");
  }

  // Fixed params
  ctx.clientMetadata.response_types = ["code"];
  ctx.authParams.code_challenge_method = "S256";
  ctx.authParams.response_type = "code";

  // Scope check
  if (!ctx.authParams.scope) {
    ctx.authParams.scope = "openid";
  } else if (
    !ctx.authParams.scope.toLowerCase().split(" ").includes("openid")
  ) {
    ctx.authParams.scope = `openid ${ctx.authParams.scope}`;
  }

  // Redirect URLs
  if (!ctx.authParams.redirect_uri) {
    ctx.authParams.redirect_uri = `${baseUrl}${pathPrefix}${callbackPath}`;
  }
  if (!ctx.clientMetadata.redirect_uris) {
    ctx.clientMetadata.redirect_uris = [ctx.authParams.redirect_uri];
  } else if (
    Array.isArray(ctx.clientMetadata.redirect_uris) &&
    !ctx.clientMetadata.redirect_uris.includes(ctx.authParams.redirect_uri)
  ) {
    ctx.clientMetadata.redirect_uris.push(ctx.authParams.redirect_uri);
  }
}
