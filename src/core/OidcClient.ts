import { createSession } from "@/methods/createSession";
import { deleteSession } from "@/methods/deleteSession";
import { fetchSession } from "@/methods/fetchSession";
import { getAuthHook } from "@/methods/getAuthHook";
import { getEndpoints } from "@/methods/getEndpoints";
import { updateSession } from "@/methods/updateSession";
import type {
  AuthHookOptions,
  OIDCClientActiveSession,
  OIDCClientOptions,
} from "@/types";
import { t } from "elysia";
import type { TokenSet } from "openid-client";
import { BaseOidcClient } from "./BaseOidcClient";

/**
 * OpenID Connect client plugin for ElysiaJS
 * - Usage:
 *   - `const client = await BaseOidcClient.create(options);`
 *   - `const endpoints = client.getEndpoints();`
 *   - `const hook = client.getAuthHook();`
 */
export class OidcClient extends BaseOidcClient {
  /**
   * Create OidcClient instance
   * @param options
   * @static
   * @returns OidcClient instance
   */
  static async create(options: OIDCClientOptions) {
    const instance = new OidcClient(options);
    await instance.initialize();
    return instance;
  }

  /**
   * Create session and insert to DB
   * @public
   * @returns [sessionId, authorizationUrl]
   */
  public createSession = () => createSession.call(this);

  /**
   * Update session in DB
   * @public
   * @param sessionId Session ID
   * @param tokenSet TokenSet
   */
  public updateSession = async (
    sessionId: string,
    tokenSet: TokenSet,
  ): Promise<OIDCClientActiveSession | null> =>
    updateSession.call(this, sessionId, tokenSet);

  /**
   * Find and validate session from cookie and DB
   * @public
   * @param sessionId Sessison ID
   * @returns Session data or false
   */
  public fetchSession = async (
    sessionId: string | undefined,
  ): Promise<OIDCClientActiveSession | null> =>
    fetchSession.call(this, sessionId);

  /**
   * Delete session from DB
   * @protected
   * @param sessionId Session ID
   */
  public deleteSession = async (sessionId: string) =>
    deleteSession.call(this, sessionId);

  /**
   * Get session id cookie type definition for schema
   * @returns Type definition
   */
  public getSessionIdCookieType = () => ({
    [this.cookieSettings.sessionIdName]: t.Optional(t.String()),
  });

  /**
   * Cookie definition for ElysiaJS
   * @public
   */
  public getCookieDefinition = () => t.Cookie(this.getSessionIdCookieType());

  /**
   * Get onBeforeHandle for restricted endpoints
   * @public
   * @param options Options
   * @returns ElysiaJS Plugin
   */
  public getAuthHook = (options?: Partial<AuthHookOptions>) =>
    getAuthHook.call(this, options);

  /**
   * OpenID Connect client plugin for ElysiaJS
   * @public
   * @returns ElysiaJS Plugin
   */
  public getEndpoints = () => getEndpoints.call(this);
}