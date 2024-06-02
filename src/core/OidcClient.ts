import { createAuthHook } from "@/methods/createAuthHook";
import { createEndpoints } from "@/methods/createEndpoints";
import { createSession } from "@/methods/createSession";
import { deleteSession } from "@/methods/deleteSession";
import { fetchSession } from "@/methods/fetchSession";
import { updateSession } from "@/methods/updateSession";
import type { OIDCClientActiveSession, OIDCClientOptions } from "@/types";
import { t } from "elysia";
import type { TokenSet } from "openid-client";
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
