import type { Cookie } from "elysia";
import type { AuthorizationParameters, ClientMetadata } from "openid-client";

// ===============================
// Session
// ===============================

/** Session data */
export interface OIDCClientSession {
  /** Session ID */
  sessionId: string;
  /** Session Expires At (Unixtime, ms) */
  sessionExpiresAt: number;

  /** OIDC Code Verifier for PKCE */
  codeVerifier?: string;
  /** OIDC State */
  state?: string;
  /** OIDC Nonce */
  nonce?: string;

  /** OIDC ID Token */
  idToken?: string;
  /** OIDC Access Token */
  accessToken?: string;
  /** OIDC Refresh Token */
  refreshToken?: string;
}

/** Active session data */
export interface OIDCClientActiveSession extends OIDCClientSession {
  idToken: string;
  accessToken: string;
}

/** Session status */
export interface OIDCClientSessionStatus {
  /** Session expires at (unixtime, ms) */
  sessionExpiresAt: number;
  /** Refresh token existence flag */
  hasRefreshToken: boolean;
  /** Access token expiration flag */
  isExpired: boolean;
  /** Access token expires at (unixtime, ms) */
  expiresAt: number;
  /** `iss` claim */
  iss: string;
  /** `sub` claim */
  sub: string;
}

// ===============================
// Configuration
// ===============================

/** Options */
export interface OIDCClientOptions {
  /**
   * Application base url
   * - No trailing slash
   * @example "https://app.example.com"
   */
  baseUrl: string;

  /**
   * OpenID Provider URL
   * - No trailing slash
   * @example "https://issuer.example.com"
   */
  issuerUrl: string;

  /**
   * Client Options
   * @see
   * - [Client Metadata Specifications](https://openid.net/specs/openid-connect-registration-1_0.html#ClientMetadata)
   * - [openid-client document](https://github.com/panva/node-openid-client/blob/main/docs/README.md#new-clientmetadata-jwks-options)
   * - [`ClientMetadata` type definition](https://github.com/panva/node-openid-client/blob/main/types/index.d.ts)
   */
  clientMetadata: ClientMetadata & {
    client_secret: string;
  };

  /**
   * Authorization Parameters
   * @see
   * - [Authentication Request Specifications](https://openid.net/specs/openid-connect-core-1_0.html#AuthRequest)
   * - [openid-client document](https://github.com/panva/node-openid-client/blob/main/docs/README.md#clientauthorizationurlparameters)
   * - [`AuthorizationParameters` type definition](https://github.com/panva/node-openid-client/blob/main/types/index.d.ts)
   */
  authParams?: AuthorizationParameters;

  /**
   * Plugin Settings
   * @see Type definition
   */
  settings?: Partial<OIDCClientSettings>;

  /**
   * Cookie Settings
   * @see Type definition
   */
  cookieSettings?: Partial<OIDCClientCookieSettings>;

  /**
   * Auth Hook Settings
   */
  authHookSettings?: Partial<OIDCClientAuthHookSettings>;

  /**
   * Session Database
   * @default SQLiteAdapter
   */
  dataAdapter?: OIDCClientDataAdapter;

  /**
   * Logger
   * - pino can be assigned directly.
   * @example
   * ```
   * import pino from "pino";
   * const rp = new OidcClient.factory({ ..., logger: pino() });
   * ```
   */
  logger?: OIDCClientLogger | null;
}

/** Plugin settings */
export interface OIDCClientSettings {
  /**
   * Path or URL to redirect after callback is complete
   * @default "/"
   * @example "/path/to/app"
   */
  callbackCompletedPath: string;
  /**
   * Path or URL to redirect after logout is complete
   * - If it starts with `/` , merge it with `baseUrl` automatically.
   * @default "/logout" (`${baseUrl}/logout`)
   * @example "/path/to/app/logout"
   * @example "https://example.com/logout"
   */
  logoutCompletedPath: string;
  /** Path prefix @default "/auth" */
  pathPrefix: string;
  /**
   * Path of login endpoint
   * - Method: GET
   * - If set to `null`, the endpoint is disabled.
   * @default "/login"
   */
  loginPath: string | null;
  /**
   * Path of callback endpoint
   * - Method: GET
   * - If set to `null`, the endpoint is disabled.
   * @default "/callback"
   */
  callbackPath: string | null;
  /**
   * Path of logout endpoint
   * - Method: GET
   * - If set to `null`, the endpoint is disabled.
   * @default "/logout"
   */
  logoutPath: string | null;
  /**
   * Path of userinfo endpoint
   * - Method: ALL
   * - If set to `null`, the endpoint is disabled.
   * @default "/userinfo"
   */
  userinfoPath: string | null;
  /**
   * Path of refresh endpoint
   * - Method: ALL
   * - If set to `null`, the endpoint is disabled.
   * @default "/refresh"
   */
  refreshPath: string | null;
  /**
   * Path of intropect endpoint
   * - Method: ALL
   * - If set to `null`, the endpoint is disabled.
   * @default "/introspect"
   */
  introspectPath: string | null;
  /**
   * Path of revoke endpoint
   * - Method: ALL
   * - If set to `null`, the endpoint is disabled.
   * @default "/revoke"
   */
  revokePath: string | null;
  /**
   * Path of resource endpoint
   * - Method: GET
   * - Usage: `/resource?url=<resource-url>`
   * @default "/resource"
   */
  resourcePath: string;
  /**
   * Path of status endpoint
   * - Method: ALL
   * - If set to `null`, the endpoint is disabled.
   * @default "/status"
   */
  statusPath: string | null;
  /**
   * Path of claims endpoint
   * - Method: ALL
   * - If set to `null`, the endpoint is disabled.
   * @default "/claims"
   */
  claimsPath: string | null;

  /**
   * Login expiration (ms)
   * @default 600000 (10 minutes)
   */
  loginExpiration: number;
  /**
   * Refresh expiration (ms)
   * @default 2592000000 (30 days)
   */
  refreshExpiration: number;

  /**
   * Plugin seed
   * @default `${issuerUrl}`
   */
  pluginSeed?: string;
}

/** Cookie settings */
export interface OIDCClientCookieSettings {
  /**
   * Neme for session id
   * - Add type definition manually
   *   - e.g. `t.Cookie({ "__Host-sid": t.Optional(t.String()) })`
   * @default "__Host-sid"
   * @see Search for `Cookie Name Prefixes` in [RFX6265bis](https://datatracker.ietf.org/doc/draft-ietf-httpbis-rfc6265bis/)
   */
  sessionIdName: string;
  /** httpOnly flag @default true */
  httpOnly: boolean;
  /** secure flag @default true */
  secure: boolean;
  /** sameSite flag
   * - If `baseUrl` and `issueUrl` are from the same domain, it can be set to `strict`
   * @default "lax"
   */
  sameSite: boolean | "strict" | "none" | "lax";
  /** path @default "/" */
  path: string;
  /**
   * Session expiration (ms)
   * - If not set, same as data expiration.
   * - If set to `0` , it becomes session cookie.
   */
  expires?: number;
}

/** Before handle settings */
export interface OIDCClientAuthHookSettings {
  /**
   * URL to redirect when not logged in
   * @default `${pathPrefix}${loginPath}`
   */
  loginRedirectUrl: string;
  /**
   * Don't redirect when not logged in.
   * - `sessionClaims` and `sessionStatus` are set to `null`.
   * @default false
   */
  disableRedirect: boolean;
  /**
   * Enable automatic refresh
   * - If set to `true`, try to refresh session using refresh token when access token is expired.
   * - Applied to all endpoints covered by `authHook`, and to the `userinfo`, `introspect`, `resource`, `status` and `claims` endpoints.
   * @default true
   */
  autoRefresh: boolean;
}

// ===============================
// Extras
// ===============================

/**
 * Data adapter
 */
export interface OIDCClientDataAdapter {
  /**
   * Find the session
   * @param sessionId Session ID
   * @returns Session data or null
   */
  fetch: (
    sessionId: string,
  ) => OIDCClientSession | null | Promise<OIDCClientSession | null>;
  /**
   * Insert the session
   * @param session Session data
   */
  insert: (session: OIDCClientSession) => void | Promise<void>;
  /**
   * Update the session
   * @param session Session data
   */
  update: (session: OIDCClientSession) => void | Promise<void>;
  /**
   * Delete the session
   * @param sessionId Session ID
   */
  delete: (sessionId: string) => void | Promise<void>;
  /**
   * Prune expired session
   */
  prune?: () => void | Promise<void>;
  /**
   * Close the database
   */
  close?: () => void | Promise<void>;
}

/**
 * Logger
 * - Suitable for pino
 * - Requies `silent` , `trace` , `debug` , `info` , `warn` , `error` and `fatal` method.
 * @remarks
 * - `silent`: Used to output tokens and other sensitive data. Only display explicitly if needed.
 * - `trace`: Functions and methods executed.
 * - `debug`: Debug info.
 * - `warn`: Outputs for unexpected calls, tampering, and possible attacks.
 * - `error`: Caught exceptions, etc.
 * - `fatal`: Currently unused.
 * @see
 * - [Logger Instance](https://getpino.io/#/docs/api?id=logger)
 */
export interface OIDCClientLogger {
  fatal: OIDCClientLoggerFn;
  error: OIDCClientLoggerFn;
  warn: OIDCClientLoggerFn;
  info: OIDCClientLoggerFn;
  debug: OIDCClientLoggerFn;
  trace: OIDCClientLoggerFn;
  silent: OIDCClientLoggerFn;
  [key: string]: unknown;
}

/**
 * Logger function inherit from `LogFn` in Pino
 */
interface OIDCClientLoggerFn {
  <T extends object>(obj: T, msg?: string, ...args: unknown[]): void;
  (obj: unknown, msg?: string, ...args: unknown[]): void;
  (msg: string, ...args: unknown[]): void;
}

// ===============================
// Client methods
// ===============================

export interface OIDCClientMethodArgs {
  /**
   * Cookie object of ElysiaJS
   */
  cookie: Record<string, Cookie<string>>;
  /**
   * Session object received from auth hook
   */
  session: OIDCClientActiveSession | null;
  /**
   * For internal use
   */
  forceRefresh?: boolean;
  /**
   * For internal use
   */
  isRevoke?: boolean;
}

// ===============================
// Const
// ===============================

export interface OIDCClientPaths {
  callback: string;
  claims: string;
  introspect: string;
  login: string;
  logout: string;
  refresh: string;
  resource: string;
  revoke: string;
  status: string;
  userinfo: string;
}
