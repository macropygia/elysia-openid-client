import { defaultCookieSettings, defaultSettings } from "@/const";
import { SQLiteAdapter } from "@/dataAdapters/SQLiteAdapter";
import { consoleLogger } from "@/loggers/consoleLogger";
import { initialize } from "@/methods/initialize";
import type {
  OIDCClientCookieSettings,
  OIDCClientDataAdapter,
  OIDCClientLogger,
  OIDCClientOptions,
  OIDCClientPaths,
  OIDCClientSettings,
} from "@/types";
import type {
  AuthorizationParameters,
  BaseClient,
  ClientMetadata,
  Issuer,
  IssuerMetadata,
} from "openid-client";

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
  logger: OIDCClientLogger | undefined;
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
      logger,
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

    this.logger =
      logger === null ? undefined : logger ? logger : consoleLogger("info");
  }

  /**
   * Create BaseOidcClient instance
   * @static
   * @param options
   * @returns BaseOidcClient instance
   */
  static async create(options: OIDCClientOptions) {
    const instance = new BaseOidcClient(options);
    await instance.initialize();
    return instance;
  }

  /**
   * Async part of constructor
   * @protected
   */
  protected initialize = async () => initialize.call(this);

  /**
   * Get list of endpoint paths
   * @public
   * @returns Record<string, string>
   */
  public getPaths = (): OIDCClientPaths => {
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
