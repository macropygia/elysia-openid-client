import { OidcClient } from "@/core/OidcClient";
import type {
  AuthHookOptions,
  OIDCClientActiveSession,
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
  AuthHookOptions,
  OIDCClientDataAdapter,
};
