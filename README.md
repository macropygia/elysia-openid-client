# Elysia OpenID Client

**English** | [日本語](README.ja.md)

[OpenID Connect](https://openid.net/) client (RP, Reyling Party) plugin for [ElysiaJS](https://elysiajs.com/), wrapping [openid-client](https://github.com/panva/node-openid-client).

- **This package is currently unstable.**
  - Breaking changes may occur without any notice, even if in patch releases.

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

```typescript
import Elysia from "elysia";
import { OidcClient } from "elysia-openid-client";

const rp = await OidcClient.create({
  baseUrl: "https://app.example.com",
  issuerUrl: "https://issuer.example.com",
  clientMetadata: {
    client_id: "client-id",
    client_secret: "client-secret",
  },
});
const endpoints = rp.getEndpoints();
const hook = rp.getAuthHook();

console.log(rp.issuerMetadata);

new Elysia()
  .use(endpoints)
  .guard((app) =>
    app
      .use(hook)
      .get("/", ({ sessionStatus }) => sessionStatus ? "Logged in" : "Restricted")
      .get("/status", ({ sessionStatus }) => sessionStatus)
      .get("/claims", ({ sessionClaims }) => sessionClaims),
  )
  .get("/free", () => "Not restricted")
  .get("/logout", () => "Logout completed")
  .listen(80);
```

- See [examples here](https://github.com/macropygia/elysia-openid-client/tree/main/examples).

## Data Adapter

Defines how session data is stored.

```typescript
const client = await OidcClient.create({
  //...
  dataAdapter: <data-adapter>,
  //...
})
```

- The package includes data adapters using SQLite/LokiJS/Lowdb/Redis.
- SQLite with in-memory option is used by default.
- When using multiple OP, share a single data adapter.

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

Currently experimental. No information provided.

### Redis

Use [Redis](https://redis.io/) with [ioredis](https://github.com/redis/ioredis).

```bash
bun add ioredis
```

Currently experimental. No information provided.

### Creating your own adapters

```typescript
// MyDataAdapter.ts
import type { OIDCClientDataAdapter } from 'elysia-openid-client';
export class MyDataAdapter implements OIDCClientDataAdapter {
  // ...
}

// app.ts
import { MyDataAdapter } from 'path/to/MyDataAdapter';
const client = await OidcClient.create({
  //...
  dataAdapter: new MyDataAdapter(),
  //...
})
```

## Endpoints

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
- Resouce (GET: `/auth/resource?url=<resource-url>`)
  - Calls `client.requestResource` of openid-client.
  - Through the response from the resource provider.
- Revoke (ALL: `/auth/revoke` )
  - Calls `client.revoke` of openid-client.
  - Returne `204`
- Status (ALL: `/auth/status` )
  - Fetches session status from internal database.
  - Does not call any endpoint of the OP.
- Claims (ALL: `/auth/claims` )
  - Fetches ID Token Claims from internal database.
  - Does not call any endpoint of the OP.

## Hook

Determine the validity of the session in `onBeforeHook`, and return `sessionStatus` and `sessionClaims` from the [`resolve` hook](https://elysiajs.com/life-cycle/before-handle.html#resolve).

- If the session is valid:
  - `sessionStatus`: Session status
  - `sessionClaims`: ID Token Claims
- If the session is invalid:
  - Redirect to `loginRedirectUrl`.
  - If `disableRedirect` is `false`, both `sessionStatus` and `sessionClaims` will be `null`.

```typescript
const rp = await OidcClient.create({ ... });
const endpoints = rp.getEndpoints();
const hook = rp.getAuthHook({
  scope: "scoped",
  loginRedirectUrl: "/auth/login",
  disableRedirect: false,
  autoRefresh: true,
});

new Elysia()
  .use(endpoints)
  .guard((app) =>
    app
      .use(hook)
      .get("/", ({
        sessionStatus,
        sessionClaims,
      }) => sessionStatus ? "Logged in" : "Not logged in")
  )
  .listen(80);
```

## Contributing

If you are using GitHub Copilot to generate suggested code, you must set the `Suggestions matching public code` option to `Block`. If you are using a similar service with a similar option, you must do the same.
