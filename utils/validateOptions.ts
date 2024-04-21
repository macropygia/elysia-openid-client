import type { BaseOidcClient } from "@/core/BaseOidcClient";

export function validateOptions(rp: BaseOidcClient) {
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
  } = rp;

  logger?.trace("functions/validateOptions");

  if (!rp.clientMetadata.client_secret) {
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

  if (rp.authParams.response_mode && rp.authParams.response_mode !== "query") {
    throw new Error("response_mode must be query or undefined");
  }

  // Fixed params
  rp.clientMetadata.response_types = ["code"];
  rp.authParams.code_challenge_method = "S256";
  rp.authParams.response_type = "code";

  // Scope check
  if (!rp.authParams.scope) {
    rp.authParams.scope = "openid";
  } else if (!rp.authParams.scope.toLowerCase().split(" ").includes("openid")) {
    rp.authParams.scope = `openid ${rp.authParams.scope}`;
  }

  // Redirect URLs
  if (!rp.authParams.redirect_uri) {
    rp.authParams.redirect_uri = `${baseUrl}${pathPrefix}${callbackPath}`;
  }
  if (!rp.clientMetadata.redirect_uris) {
    rp.clientMetadata.redirect_uris = [rp.authParams.redirect_uri];
  } else if (
    Array.isArray(rp.clientMetadata.redirect_uris) &&
    !rp.clientMetadata.redirect_uris.includes(rp.authParams.redirect_uri)
  ) {
    rp.clientMetadata.redirect_uris.push(rp.authParams.redirect_uri);
  }
}
