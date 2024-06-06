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

## Minumum requirements

```typescript
{
  issuerUrl: "https://issuer.example.com/",
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
        - URL of the OpenID Provider
        - e.g. `https://github.com`
    - `baseUrl`
        - URL of your apps as OpenID Relying Party
        - e.g. `https://your-service.example.com`
- [OIDCClientSettings](/elysia-openid-client/api/types/interfaces/oidcclientsettings/)
    - Settings about the client. Paths, durations, etc.
- [OIDCClientAuthHookSettings](/elysia-openid-client/api/types/interfaces/oidcclientauthhooksettings/)
    - Settings about before handle hook for auth.
- [OIDCClientCookieSettings](/elysia-openid-client/api/types/interfaces/oidcclientcookiesettings/)
    - Settings about Cookie for session.
- [OIDCClientDataAdapter](/elysia-openid-client/api/types/interfaces/oidcclientdataadapter/)
    - See [`Data Adapter`](/elysia-openid-client/guide/data-adapter/) page.
- [OIDCClientLogger](/elysia-openid-client/api/types/interfaces/oidcclientlogger/)
    - See [`Logger`](/elysia-openid-client/guide/logger/) page.
- `ClientMetadata`
    - See [`ClientMetadata` type definition](https://github.com/panva/node-openid-client/blob/main/types/index.d.ts) of `openid-client`.
    - See [Client Metadata](https://openid.net/specs/openid-connect-registration-1_0.html#ClientMetadata) section in the `OpenID Connect Dynamic Client Registration 1.0`.
- `AuthorizationParameters`
    - See [`AuthorizationParameters` type definition](https://github.com/panva/node-openid-client/blob/main/types/index.d.ts) of `openid-client`.
    - See [Authentication Request](https://openid.net/specs/openid-connect-core-1_0.html#AuthRequest) section in the `OpenID Connect Core 1.0`.
