export const mockIssuerMetadata = (opPort: number) => ({
  issuer: `http://localhost:${opPort}`,
  authorization_endpoint: `http://localhost:${opPort}/oauth2/authorize`,
  token_endpoint: `http://localhost:${opPort}/oauth2/token`,
  userinfo_endpoint: `http://localhost:${opPort}/oauth2/userinfo`,
  registration_endpoint: `http://localhost:${opPort}/oauth2/clients`,
  jwks_uri: `http://localhost:${opPort}/oauth2/keys`,
  response_types_supported: ["code"],
  response_modes_supported: ["query"],
  grant_types_supported: ["authorization_code", "refresh_token"],
  subject_types_supported: ["public"],
  id_token_signing_alg_values_supported: ["RS256"],
  scopes_supported: [
    "openid",
    "email",
    "profile",
    "address",
    "phone",
    "offline_access",
    "groups",
  ],
  token_endpoint_auth_methods_supported: [
    // "client_secret_basic",
    "client_secret_post",
    // "client_secret_jwt",
    // "private_key_jwt",
    "none",
  ],
  claims_supported: [
    "iss",
    "ver",
    "sub",
    "aud",
    "iat",
    "exp",
    "jti",
    "auth_time",
    "amr",
    "idp",
    "nonce",
    "name",
    "nickname",
    "preferred_username",
    "given_name",
    "middle_name",
    "family_name",
    "email",
    "email_verified",
    "profile",
    "zoneinfo",
    "locale",
    "address",
    "phone_number",
    "picture",
    "website",
    "gender",
    "birthdate",
    "updated_at",
    "at_hash",
    "c_hash",
  ],
  code_challenge_methods_supported: ["S256"],
  introspection_endpoint: `http://localhost:${opPort}/oauth2/introspect`,
  introspection_endpoint_auth_methods_supported: [
    "client_secret_basic",
    "client_secret_post",
    "client_secret_jwt",
    "private_key_jwt",
    "none",
  ],
  revocation_endpoint: `http://localhost:${opPort}/oauth2/revoke`,
  revocation_endpoint_auth_methods_supported: [
    "client_secret_basic",
    "client_secret_post",
    "client_secret_jwt",
    "private_key_jwt",
    "none",
  ],
  end_session_endpoint: `http://localhost:${opPort}/oauth2/logout`,
  request_parameter_supported: true,
  request_object_signing_alg_values_supported: [
    "HS256",
    "HS384",
    "HS512",
    "RS256",
    "RS384",
    "RS512",
    "ES256",
    "ES384",
    "ES512",
  ],
  device_authorization_endpoint: `http://localhost:${opPort}/oauth2/device/authorize`,
  dpop_signing_alg_values_supported: [
    "RS256",
    "RS384",
    "RS512",
    "ES256",
    "ES384",
    "ES512",
  ],
});
