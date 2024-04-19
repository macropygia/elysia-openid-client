import {
  defaultCookieSettings,
  defaultLoggerOptions,
  defaultSettings,
} from "@/core/const";
import { SQLiteAdapter } from "@/dataAdapters/SQLiteAdapter";
import { initialize } from "@/functions/initialize";
import { validateOptions } from "@/functions/validateOptions";
import type {
  OIDCClientCookieSettings,
  OIDCClientDataAdapter,
  OIDCClientLogger,
  OIDCClientOptions,
  OIDCClientSettings,
} from "@/types";
import type {
  AuthorizationParameters,
  BaseClient,
  ClientMetadata,
  Issuer,
  IssuerMetadata,
} from "openid-client";
import pino from "pino";

/**
 * OidcClient without methods for testing
 */
export class BaseOidcClient {
  /** Client Base URL */
  baseUrl: string;
  /** OIDC IdP URL */
  issuerUrl: string;
  /** OIDC Client metadata */
  clientMetadata: ClientMetadata;
  /** OIDC Authorization parameters */
  authParams: AuthorizationParameters;
  /** Plugin settings */
  settings: OIDCClientSettings;
  /** Cookie settings */
  cookieSettings: OIDCClientCookieSettings;
  /** OIDC Issuer (Initialize at create()) */
  issuer!: Issuer<BaseClient>;
  /** OIDC Issuer metadata (Initialize at create()) */
  issuerMetadata!: IssuerMetadata;
  /** OIDC Client (Initialize at create()) */
  client!: BaseClient;
  /** Plugin database */
  sessions: OIDCClientDataAdapter;
  /** Logger */
  logger?: OIDCClientLogger;
  /** Initialized */
  initialized = false;

  /**
   * Constructor
   * @protected
   * @param options Options
   */
  protected constructor(options: OIDCClientOptions) {
    const {
      baseUrl,
      issuerUrl,
      clientMetadata,
      authParams,
      dataAdapter,
      settings,
      cookieSettings,
      loggerOptions,
    } = options;

    if (!issuerUrl) {
      throw new Error("issuerUrl is required");
    }

    this.baseUrl = baseUrl;
    this.issuerUrl = issuerUrl;
    this.clientMetadata = clientMetadata;
    this.authParams = authParams || {};
    this.settings = {
      ...defaultSettings,
      ...settings,
    };
    this.cookieSettings = {
      ...defaultCookieSettings,
      ...cookieSettings,
    };

    this.sessions = dataAdapter || new SQLiteAdapter();

    this.logger = pino(
      loggerOptions ||
        defaultLoggerOptions[process.env.NODE_ENV || "never"] ||
        defaultLoggerOptions.default,
    );
  }

  /**
   * Create BaseOidcClient instance
   * @param options
   * @static
   * @returns BaseOidcClient instance
   */
  static async create(options: OIDCClientOptions) {
    const instance = new BaseOidcClient(options);
    await instance.initialize();
    return instance;
  }

  /** Flag for wait for sessions */
  protected sessionsPromise: Promise<void> | null = null;

  /**
   * Async part of constructor
   * @protected
   */
  protected initialize = async () => initialize.call(this);

  /**
   * Validate options, params and metadata
   * @protected
   */
  protected validateOptions = () => validateOptions.call(this);

  /**
   * Get list of endpoint paths
   * @returns Record<string, string>
   */
  public getPaths = () => {
    const {
      settings,
      settings: { pathPrefix },
    } = this;
    return {
      callback: `${pathPrefix}${settings.callbackPath}`,
      claims: `${pathPrefix}${settings.claimsPath}`,
      introspect: `${pathPrefix}${settings.introspectPath}`,
      login: `${pathPrefix}${settings.loginPath}`,
      logout: `${pathPrefix}${settings.logoutPath}`,
      refresh: `${pathPrefix}${settings.refreshPath}`,
      resource: `${pathPrefix}${settings.resourcePath}`,
      revoke: `${pathPrefix}${settings.revokePath}`,
      status: `${pathPrefix}${settings.statusPath}`,
      userinfo: `${pathPrefix}${settings.userinfoPath}`,
    };
  };
}
