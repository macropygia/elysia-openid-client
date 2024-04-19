import type { BaseOidcClient } from "@/core/BaseOidcClient";

export function validateOptions(this: BaseOidcClient) {
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
  } = this;

  logger?.trace("functions/validateOptions");

  if (!this.clientMetadata.client_secret) {
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
    this.authParams.response_mode &&
    this.authParams.response_mode !== "query"
  ) {
    throw new Error("response_mode must be query or undefined");
  }

  // Fixed params
  this.clientMetadata.response_types = ["code"];
  this.authParams.code_challenge_method = "S256";
  this.authParams.response_type = "code";

  // Scope check
  if (!this.authParams.scope) {
    this.authParams.scope = "openid";
  } else if (
    !this.authParams.scope.toLowerCase().split(" ").includes("openid")
  ) {
    this.authParams.scope = `openid ${this.authParams.scope}`;
  }

  // Redirect URLs
  if (!this.authParams.redirect_uri) {
    this.authParams.redirect_uri = `${baseUrl}${pathPrefix}${callbackPath}`;
  }
  if (!this.clientMetadata.redirect_uris) {
    this.clientMetadata.redirect_uris = [this.authParams.redirect_uri];
  } else if (
    Array.isArray(this.clientMetadata.redirect_uris) &&
    !this.clientMetadata.redirect_uris.includes(this.authParams.redirect_uri)
  ) {
    this.clientMetadata.redirect_uris.push(this.authParams.redirect_uri);
  }
}
