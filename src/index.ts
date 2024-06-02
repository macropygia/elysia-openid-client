import { OidcClient } from "@/core/OidcClient";
import type {
  OIDCClientActiveSession,
  OIDCClientAuthHookSettings,
  OIDCClientCookieSettings,
  OIDCClientDataAdapter,
  OIDCClientOptions,
  OIDCClientSession,
  OIDCClientSessionStatus,
  OIDCClientSettings,
} from "@/types";

export { OidcClient };

// biome-ignore lint/style/noDefaultExport: <explanation>
export default OidcClient;

export type {
  OIDCClientSession,
  OIDCClientActiveSession,
  OIDCClientSessionStatus,
  OIDCClientOptions,
  OIDCClientSettings,
  OIDCClientCookieSettings,
  OIDCClientAuthHookSettings,
  OIDCClientDataAdapter,
};
