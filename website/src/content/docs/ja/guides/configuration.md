---
title: Configuration
# description:
---

```typescript
import { defineConfig } from "elysia-openid-client/config";

const options: OIDCClientOptions = defineConfig({
  // ...
});

const rp = await OidcClient.factory(options);
```

## 最小構成

```typescript
{
  issuerUrl: "https://issuer.example.com",
  baseUrl: "https://your-service.example.com",
  clientMetadata: {
    client_id: "client-id",
    client_secret: "client-secret",
  },
}
```

## Reference

```typescript
interface OIDCClientOptions {
  issuerUrl: string;
  baseUrl: string;
  settings?: Partial<OIDCClientSettings>;
  authHookSettings?: Partial<OIDCClientAuthHookSettings>;
  cookieSettings?: Partial<OIDCClientCookieSettings>;
  dataAdapter?: OIDCClientDataAdapter;
  logger?: OIDCClientLogger | null;
  clientMetadata: ClientMetadata & {
      client_secret: string;
  };
  authParams?: AuthorizationParameters;
}
```

- [OIDCClientOptions](/elysia-openid-client/api/types/interfaces/oidcclientoptions/)
    - `issuerUrl`
        - OpenID ProviderのURL
        - 例: `https://github.com`
    - `baseUrl`
        - このプラグインを使用するWebサイト/WebサービスのURL（OpenID Relying Partyとして機能する）
        - 例: `https://your-service.example.com`
- [OIDCClientSettings](/elysia-openid-client/api/types/interfaces/oidcclientsettings/)
    - 全般設定（パスや有効期限など）
- [OIDCClientAuthHookSettings](/elysia-openid-client/api/types/interfaces/oidcclientauthhooksettings/)
    - 認証用フックの設定
- [OIDCClientCookieSettings](/elysia-openid-client/api/types/interfaces/oidcclientcookiesettings/)
    - セッションIDを保管するCookieの設定
- [OIDCClientDataAdapter](/elysia-openid-client/api/types/interfaces/oidcclientdataadapter/)
    - [`データアダプター`](/elysia-openid-client/ja/guide/data-adapter/) のページを参照
- [OIDCClientLogger](/elysia-openid-client/api/types/interfaces/oidcclientlogger/)
    - [`ロガー`](/elysia-openid-client/ja/guide/logger/) のページを参照
- `ClientMetadata`
    - `openid-client` の [`ClientMetadata` の型定義](https://github.com/panva/node-openid-client/blob/main/types/index.d.ts)
    - および `OpenID Connect Dynamic Client Registration 1.0` の [Client Metadata](https://openid.net/specs/openid-connect-registration-1_0.html#ClientMetadata) の章を参照
- `AuthorizationParameters`
    - `openid-client` の [`AuthorizationParameters` の型定義](https://github.com/panva/node-openid-client/blob/main/types/index.d.ts)
    - および `OpenID Connect Core 1.0` の [Authentication Request](https://openid.net/specs/openid-connect-core-1_0.html#AuthRequest) の章を参照
