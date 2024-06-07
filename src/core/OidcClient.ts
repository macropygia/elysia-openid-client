import type * as http from "node:http";
import { introspect } from "@/methods/client/introspect";
import { refresh } from "@/methods/client/refresh";
import { resource } from "@/methods/client/resource";
import { revoke } from "@/methods/client/revoke";
import { userinfo } from "@/methods/client/userinfo";
import { createAuthHook } from "@/methods/createAuthHook";
import { createEndpoints } from "@/methods/createEndpoints";
import { createSession } from "@/methods/session/createSession";
import { deleteSession } from "@/methods/session/deleteSession";
import { fetchSession } from "@/methods/session/fetchSession";
import { updateSession } from "@/methods/session/updateSession";
import type {
  OIDCClientActiveSession,
  OIDCClientMethodArgs,
  OIDCClientOptions,
} from "@/types";
import { t } from "elysia";
import type {
  IdTokenClaims,
  IntrospectionResponse,
  TokenSet,
  UnknownObject,
  UserinfoResponse,
} from "openid-client";
import { BaseOidcClient } from "./BaseOidcClient";

/**
 * OpenID Connect client plugin for ElysiaJS
 * - Usage:
 *   - `const client = await BaseOidcClient.factory(options);`
 *   - `const endpoints = client.createEndpoints();`
 *   - `const hook = client.createAuthHook();`
 */
export class OidcClient extends BaseOidcClient {
  protected constructor(options: OIDCClientOptions) {
    super(options);

    this.refresh = refresh.bind(this);
    this.revoke = revoke.bind(this);
    this.userinfo = userinfo.bind(this);
    this.introspect = introspect.bind(this);
    this.resource = resource.bind(this);

    this.createSession = createSession.bind(this);
    this.updateSession = updateSession.bind(this);
    this.fetchSession = fetchSession.bind(this);
    this.deleteSession = deleteSession.bind(this);
  }

  /**
   * Create OidcClient instance
   * @param options
   * @static
   * @returns OidcClient instance
   */
  static async factory(options: OIDCClientOptions) {
    const instance = new OidcClient(options);
    await instance.initialize();
    return instance;
  }

  /** Use refresh endpoint directly */
  public refresh: (args: OIDCClientMethodArgs) => Promise<IdTokenClaims | null>;

  /** Use revoke endpoint directly */
  public revoke: (args: OIDCClientMethodArgs) => Promise<undefined | null>;

  /** Use userinfo endpoint directly */
  public userinfo: (
    args: OIDCClientMethodArgs,
  ) => Promise<UserinfoResponse<UnknownObject, UnknownObject> | null>;

  /** Use introspect endpoint directly */
  public introspect: (
    args: OIDCClientMethodArgs,
  ) => Promise<IntrospectionResponse | null>;

  /** Use resource endpoint directly */
  public resource: (
    args: OIDCClientMethodArgs & { resourceUrl: string },
  ) => Promise<({ body?: Buffer } & http.IncomingMessage) | null>;

  /**
   * Create session and insert to DB
   * @public
   * @returns [sessionId, authorizationUrl]
   */
  public createSession: () => Promise<[string, string]>;

  /**
   * Update session in DB
   * @public
   * @param sessionId Session ID
   * @param tokenSet TokenSet
   */
  public updateSession: (
    sessionId: string,
    tokenSet: TokenSet,
  ) => Promise<OIDCClientActiveSession | null>;

  /**
   * Find and validate session from cookie and DB
   * @public
   * @param sessionId Sessison ID
   * @returns Session data or false
   */
  public fetchSession: (
    sessionId: string | undefined,
  ) => Promise<OIDCClientActiveSession | null>;

  /**
   * Delete session from DB
   * @protected
   * @param sessionId Session ID
   */
  public deleteSession: (sessionId: string) => Promise<void>;

  /**
   * Cookie definition for ElysiaJS
   * @public
   */
  public get cookieTypeBox() {
    return t.Cookie({
      [this.cookieSettings.sessionIdName]: t.Optional(t.String()),
    });
  }

  /**
   * Get onBeforeHandle for restricted endpoints
   * @public
   * @returns ElysiaJS Plugin
   */
  public get authHook() {
    return createAuthHook.call(this);
  }

  /**
   * OpenID Connect client plugin for ElysiaJS
   * @public
   * @returns ElysiaJS Plugin
   */
  public get endpoints() {
    return createEndpoints.call(this);
  }
}
