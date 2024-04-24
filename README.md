# Elysia OpenID Client

**English** | [日本語](README.ja.md)

[OpenID Connect](https://openid.net/) client (RP, Relying Party) plugin for [ElysiaJS](https://elysiajs.com/), wrapping [openid-client](https://github.com/panva/node-openid-client).

- **This package is currently unstable.**
  - Breaking changes may occur without any notice, even if in patch releases.
- Links: [GitHub](https://github.com/macropygia/elysia-openid-client) / [npm](https://www.npmjs.com/package/elysia-openid-client) / [TypeDoc](https://macropygia.github.io/elysia-openid-client/)

## Specifications/limitations

- Perform all operations server-side using an identifier stored in Cookie.
  - Authentication/authorization status is passed using [resolve](https://elysiajs.com/life-cycle/before-handle.html#resolve).
- Depends on [Bun](https://bun.sh/).
- Only TypeScript files included.
- [Only works as ESM](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c).
- Only `Authorization Code Flow` is supported.
- Only `Confidential Client` is supported.
- Client metadata:
  - `client_secret` is required
  - `response_types` is fixed to `["code"]`
- Authorization parameters:
  - `response_type` is fixed to `code`
  - `response_mode` must set to `query` or not set
  - `code_challenge` , `state` and `nonce` are generated automatically
  - `code_challenge_method` is fixed to `S256`
  - `openid` is automatically added to `scope`

## Usage

```bash
bun add elysia-openid-client
```

```typescript
import Elysia from "elysia";
import { OidcClient } from "elysia-openid-client";

const rp = await OidcClient.create({
  baseUrl: "https://app.example.com", // RP URL
  issuerUrl: "https://issuer.example.com", // OP URL
  clientMetadata: {
    client_id: "client-id",
    client_secret: "client-secret",
  },
});
const endpoints = rp.getEndpoints(); // Endpoints plugin
const hook = rp.getAuthHook(); // Auth hook plugin

console.log(rp.issuerMetadata); // Show OP metadata

new Elysia()
  .use(endpoints) // Add endpoints
  .guard((app) => // Define restricted area
    app
      .use(hook) // Add onBeforeHandle hook for authentication/authorization
      .onBeforeHandle(({ sessionStatus, sessionClaims }) => {
        // Authorization by name, mail, group, etc.
      })
      .get("/", ({ sessionStatus }) => sessionStatus ? "Logged in" : "Restricted")
      .get("/status", ({ sessionStatus }) => sessionStatus)
      .get("/claims", ({ sessionClaims }) => sessionClaims),
  )
  .get("/free", () => "Not restricted")
  .get("/logout", () => "Logout completed")
  .listen(80);
```

- See [examples here](https://github.com/macropygia/elysia-openid-client/tree/main/__examples__).

## Configuration

```typescript
interface OIDCClientOptions {
  issuerUrl: string;
  baseUrl: string;
  settings?: Partial<OIDCClientSettings>;
  cookieSettings?: Partial<OIDCClientCookieSettings>;
  dataAdapter?: OIDCClientDataAdapter;
  logger?: OIDCClientLogger | null;
  clientMetadata: ClientMetadata & {
      client_secret: string;
  };
  authParams?: AuthorizationParameters;
}

const options: OIDCClientOptions = {
  // ...
}

const rp = await OidcClient.create(options);
```

- [OIDCClientOptions](https://macropygia.github.io/elysia-openid-client/interfaces/types.OIDCClientOptions.html)
  - `issuerUrl`
    - URL of the OpenID Provider
    - e.g. `https://github.com`
  - `baseUrl`
    - URL of your apps as OpenID Relying Party
    - e.g. `https:/your-service.example.com`
- [OIDCClientSettings](https://macropygia.github.io/elysia-openid-client/interfaces/types.OIDCClientSettings.html)
  - Settings about the client. Paths, durations, etc.
- [OIDCClientCookieSettings](https://macropygia.github.io/elysia-openid-client/interfaces/types.OIDCClientCookieSettings.html)
  - Settings about Cookie for session.
- [OIDCClientDataAdapter](https://macropygia.github.io/elysia-openid-client/interfaces/types.OIDCClientDataAdapter.html)
  - See `Data Adapter` section in this document.
- [OIDCClientLogger](https://macropygia.github.io/elysia-openid-client/interfaces/types.OIDCClientLogger.html)
  - See `Logger` section in this document.
- `ClientMetadata`
  - See [`ClientMetadata` type definition](https://github.com/panva/node-openid-client/blob/main/types/index.d.ts) of `openid-client`.
  - See [Client Metadata](https://openid.net/specs/openid-connect-registration-1_0.html#ClientMetadata) section in the `OpenID Connect Dynamic Client Registration 1.0`.
- `AuthorizationParameters`
  - See [`AuthorizationParameters` type definition](https://github.com/panva/node-openid-client/blob/main/types/index.d.ts) of `openid-client`.
  - See [Authentication Request](https://openid.net/specs/openid-connect-core-1_0.html#AuthRequest) section in the `OpenID Connect Core 1.0`.

## Endpoints

- ElysiaJS plugin metadata
  - name: `elysia-openid-client-endpoints`
  - [seed](https://elysiajs.com/essential/plugin#plugin-deduplication): `settings.pluginSeed` or else `issuerUrl`
- Ref: [openid-client API Documentation - Client](https://github.com/panva/node-openid-client/blob/main/docs/README.md#client)

### Details

- Login (GET: `/auth/login` )
  - Calls `client.authorizationUrl` of openid-client.
  - Redirect to authorization endpoint of the OP.
- Callback (GET: `/auth/callback` )
  - Calls `client.callbackParams` and `client.callback` of openid-client.
  - Redirect from the OP and redirect to the login completed page.
- Logout (GET: `/auth/logout` )
  - Calls `client.endSessionUrl` of openid-client.
  - Redirect to logout (end session) endpoint of the OP.
- UserInfo (ALL: `/auth/userinfo` )
  - Calls `client.userinfo` of openid-client.
  - Returns response (UserInfo) directly.
- Introspect  (ALL: `/auth/introspect` )
  - Calls `client.introspect` of openid-client.
  - Returns response directly.
- Refresh (ALL: `/auth/refresh` )
  - Calls `client.refresh` of openid-client.
  - Returns ID Token Claims.
- Resource (GET: `/auth/resource?url=<resource-url>`)
  - Calls `client.requestResource` of openid-client.
  - Through the response from the resource provider.
- Revoke (ALL: `/auth/revoke` )
  - Calls `client.revoke` of openid-client.
  - Return `204`
- Status (ALL: `/auth/status` )
  - Fetches session status from internal database.
  - Does not call any endpoint of the OP.
- Claims (ALL: `/auth/claims` )
  - Fetches ID Token Claims from internal database.
  - Does not call any endpoint of the OP.

## Hook

Determine the validity of the session in `onBeforeHandle`, and return `sessionStatus` and `sessionClaims` from the [`resolve` hook](https://elysiajs.com/life-cycle/before-handle.html#resolve).

```typescript
const rp = await OidcClient.create({ ... });
const hookOptions: AuthHookOptions = { ... };
const hook = rp.getAuthHook(hookOptions);
```

- If the session is valid:
  - `sessionStatus`: Session status
    - Ref: [OIDCClientSessionStatus](https://macropygia.github.io/elysia-openid-client/interfaces/types.OIDCClientSessionStatus.html)
  - `sessionClaims`: ID Token Claims
    - Ref: [`IdTokenClaims` type definition](https://github.com/panva/node-openid-client/blob/main/types/index.d.ts) of `openid-client`.
    - Ref: [Claims](https://openid.net/specs/openid-connect-core-1_0.html#IDToken) and [IDToken](https://openid.net/specs/openid-connect-core-1_0.html#IDToken) section in the `OpenID Connect Core 1.0`.
- If the session is invalid:
  - Redirect to `loginRedirectUrl`.
  - If `disableRedirect` is `true`, both `sessionStatus` and `sessionClaims` will be `null`.
- ElysiaJS plugin metadata
  - name: `elysia-openid-client-auth-hook`
  - [seed](https://elysiajs.com/essential/plugin#plugin-deduplication): `settings.pluginSeed` or else `issuerUrl`
- Ref: [AuthHookOptions](https://macropygia.github.io/elysia-openid-client/interfaces/types.AuthHookOptions.html)

## Data Adapter

Defines how session data is stored.

```typescript
const rp = await OidcClient.create({
  //...
  dataAdapter: OIDCClientDataAdapter,
  //...
})
```

- The package includes data adapters using SQLite/LokiJS/Lowdb/Redis.
- You can make your own adapters.
- SQLite with in-memory option is used by default.
- When using multiple OP, share a single data adapter.
- Ref: [OIDCClientDataAdapter](https://macropygia.github.io/elysia-openid-client/interfaces/types.OIDCClientDataAdapter.html)

### SQLite

Use [Bun built-in SQLite driver](https://bun.sh/docs/api/sqlite).

```typescript
import { SQLiteAdapter } from 'elysia-openid-client/dataAdapters/SQLiteAdapter';

// In-memory
const memoryAdapter = new SQLiteAdapter();
// Same as `new SQLiteAdapter({ filename: ":memory:" })`

// Persistence to file
const fileAdapter = new SQLiteAdapter({
  filename: "path/to/sessions.sqlite"
});

```

### LokiJS

Use [LokiJS](https://techfort.github.io/LokiJS/).

```bash
bun add lokijs
bun add -D @types/lokijs
```

```typescript
// In-memory
import { LokiInMemoryAdapter } from 'elysia-openid-client/dataAdapters/LokiInMemoryAdapter';
const memoryAdapter = new LokiInMemoryAdapter();

// Persistence to file
import { LokiFileAdapter } from 'elysia-openid-client/dataAdapters/LokiFileAdapter';
const fileAdapter = await LokiFileAdapter.create({
  filename: "path/to/sessions.db"
});
```

### Lowdb

Use [Lowdb](https://github.com/typicode/lowdb).

```bash
bun add lowdb
```

```typescript
import { LowdbAdapter } from 'elysia-openid-client/dataAdapters/LowdbAdapter';

// In-memory
const memoryAdapter = await LowdbAdapter.create();

// Persistence to file
const fileAdapter = await LowdbAdapter.create({
  filename: "sessions.json",
})
```

### Redis

Use [Redis](https://redis.io/) with [ioredis](https://github.com/redis/ioredis).

```bash
bun add ioredis
```

```typescript
import { RedisAdapter } from 'elysia-openid-client/dataAdapters/RedisAdapter';
const redisAdapter = new RedisAdapter({
  port: 6379,
  host: "localhost",
});
```

### Creating your own adapters

```typescript
// MyDataAdapter.ts
import type { OIDCClientDataAdapter } from 'elysia-openid-client';
export class MyDataAdapter implements OIDCClientDataAdapter {
  // ...
}

// app.ts
import { MyDataAdapter } from 'path/to/MyDataAdapter';
const rp = await OidcClient.create({
  //...
  dataAdapter: new MyDataAdapter(),
  //...
})
```

## Logger

Defines logger.

```typescript
const rp = await OidcClient.create({
  //...
  logger: OIDCClientLogger | null,
  //...
})
```

- Optimized for [pino](https://getpino.io/).
  - Other loggers can be used if converted.
- If omitted, use `consoleLogger("info")`.
- If set to `null`, disable logging.
- Ref: [OIDCClientLogger](https://macropygia.github.io/elysia-openid-client/interfaces/types.OIDCClientLogger.html)

### Log level policy

- `silent`:
  - Used to output tokens and other sensitive data. Only display explicitly if needed.
- `trace`:
  - Functions and methods executed.
- `debug`:
  - Debug info.
- `info`:
  - (TBA)
- `warn`:
  - Outputs for unexpected calls, tampering, and possible attacks.
- `error`:
  - Caught exceptions, etc.
- `fatal`:
  - Currently unused.

### Using pino

Assign [pino](https://getpino.io/) directly.

```bash
bun add pino
```

```typescript
import pino from "pino";
const rp = await OidcClient.create({
  //...
  logger: pino(),
  //...
})
```

### Console logger

Using [Console](https://bun.sh/docs/api/console).

```typescript
import { consoleLogger } from "elysia-openid-client/loggers/consoleLogger";
const minimumLogLevel = "debug"; // same as pino
const rp = await OidcClient.create({
  //...
  logger: consoleLogger(minimumLogLevel),
  //...
})
```

### Custom logger

See [OIDCClientLogger](https://macropygia.github.io/elysia-openid-client/interfaces/types.OIDCClientLogger.html) and `consoleLogger` implementation.

## Contributing

If you are using GitHub Copilot to generate suggested code, you must set the `Suggestions matching public code` option to `Block`. If you are using a similar service with a similar option, you must do the same.
