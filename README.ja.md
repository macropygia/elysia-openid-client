# Elysia OpenID Client

[English](README.md) | **日本語**

[ElysiaJS](https://elysiajs.com/)用[OpenID Connect](https://openid.net/)クライアントプラグイン（[openid-client](https://github.com/panva/node-openid-client)ラッパー）

- **このパッケージは不安定版です**
  - パッチリリースを含め予告なく破壊的変更が行われる場合があります
- [TypeDoc](https://macropygia.github.io/elysia-openid-client/)

## 仕様・制限事項

- Cookieに保存した一意識別子を使用して全ての処理をサーバーサイドで行う
  - 認証・認可の情報は[resolve](https://elysiajs.com/life-cycle/before-handle.html#resolve)を利用して受け渡す
- [Bun](https://bun.sh/)専用
- TypeScriptのみ同梱
- [ESM専用](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c)
- `Authorization Code Flow` （認証コードフロー）専用
- `Confidential Client` 専用
- Client metadata:
  - `client_secret` 必須
  - `response_types` は `["code"]` に固定される
- Authorization parameters:
  - `response_type` は `code`に固定される
  - `response_mode` は `query` に設定するか、既定値（設定なし）である必要がある
  - `code_challenge` , `state` , `nonce` は自動で生成される
  - `code_challenge_method` は `S256` に固定される
  - `scope` には自動で `openid` が追加される

## 使用方法

```bash
bun add elysia-openid-client
```

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

- [その他のサンプル](https://github.com/macropygia/elysia-openid-client/tree/main/__examples__)

## 設定

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
    - OpenID ProviderのURL
    - 例: `https://github.com`
  - `baseUrl`
    - このプラグインを使用するWebサイト/WebサービスのURL（OpenID Relying Partyとして機能する）
    - 例: `https:/your-service.example.com`
- [OIDCClientSettings](https://macropygia.github.io/elysia-openid-client/interfaces/types.OIDCClientSettings.html)
  - 全般設定（パスや有効期限など）
- [OIDCClientCookieSettings](https://macropygia.github.io/elysia-openid-client/interfaces/types.OIDCClientCookieSettings.html)
  - セッションIDを保管するCookieの設定
- [OIDCClientDataAdapter](https://macropygia.github.io/elysia-openid-client/interfaces/types.OIDCClientDataAdapter.html)
  - 本文書の `データアダプター` の項を参照
- [OIDCClientLogger](https://macropygia.github.io/elysia-openid-client/interfaces/types.OIDCClientLogger.html)
  - 本文書の `ロガー` の項を参照
- `ClientMetadata`
  - `openid-client` の [型定義](https://github.com/panva/node-openid-client/blob/main/types/index.d.ts)
  - および `OpenID Connect Dynamic Client Registration 1.0` の [Client Metadata](https://openid.net/specs/openid-connect-registration-1_0.html#ClientMetadata) の章を参照
- `AuthorizationParameters`
  - `openid-client` の [型定義](https://github.com/panva/node-openid-client/blob/main/types/index.d.ts)
  - および `OpenID Connect Core 1.0` の [Authentication Request](https://openid.net/specs/openid-connect-core-1_0.html#AuthRequest) の章を参照

## データアダプター

セッション情報の保存方法を定義したもの。

```typescript
const client = await OidcClient.create({
  //...
  dataAdapter: <data-adapter>,
  //...
})
```

- 本パッケージにはSQLite/LokiJS/Lowdb/Redisを使用したデータアダプターが含まれる
- カスタムデータアダプターを作成可能
  - 参照: [OIDCClientDataAdapter](https://macropygia.github.io/elysia-openid-client/interfaces/types.OIDCClientDataAdapter.html)
- 既定ではSQLiteのインメモリーモードが使用される
- 複数のOPを使用する場合は一つのデータアダプターを共有する

### SQLite

[Bun内蔵のSQLiteドライバー](https://bun.sh/docs/api/sqlite)を使用する。

```typescript
import { SQLiteAdapter } from 'elysia-openid-client/dataAdapters/SQLiteAdapter';

// インメモリーモード
const memoryAdapter = new SQLiteAdapter();
// new SQLiteAdapter({ filename: ":memory:" }) と同義

// 永続化モード
const fileAdapter = new SQLiteAdapter({
  filename: "path/to/sessions.sqlite"
});

```

### LokiJS

[LokiJS](https://www.npmjs.com/package/lokijs)を使用する。

```bash
bun add lokijs
bun add -D @types/lokijs
```

```typescript
// インメモリーモード
import { LokiInMemoryAdapter } from 'elysia-openid-client/dataAdapters/LokiInMemoryAdapter';
const memoryAdapter = new LokiInMemoryAdapter();

// 永続化モード
import { LokiFileAdapter } from 'elysia-openid-client/dataAdapters/LokiFileAdapter';
const fileAdapter = await LokiFileAdapter.create({
  filename: "path/to/sessions.db"
});
```

### Lowdb

[Lowdb](https://github.com/typicode/lowdb)を使用する。

```bash
bun add lowdb
```

```typescript
import { LowdbAdapter } from 'elysia-openid-client/dataAdapters/LowdbAdapter';

// インメモリーモード
const memoryAdapter = new LowdbAdapter();

// 永続化モード
const fileAdapter = new LowdbAdapter({
  filename: "sessions.json",
})
```

### Redis

[Redis](https://redis.io/)を[ioredis](https://github.com/redis/ioredis)で使用する。

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

### カスタムデータアダプター

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

## ロガー

ロガーを定義する。

```typescript
const client = await OidcClient.create({
  //...
  logger: <logger>,
  //...
})
```

- [pino](https://getpino.io/)に最適化されている
  - 変換すれば任意のロガーを使用可能
- 省略すると `consoleLogger("info")` を使用する
- `null` に設定するとログを出力しない

### ログレベルポリシー

- `silent`:
  - トークン等のセンシティブ情報のデバッグ用出力
  - 使用時は明示的に表示させる必要がある
- `trace`:
  - 関数やメソッドの呼び出し時に名称を表示
- `debug`:
  - デバッグ情報
- `warn`:
  - 予期しない呼び出し・不正な操作・攻撃などの可能性がある操作の情報
- `error`:
  - キャッチした例外などの情報
- `fatal`:
  - 現状では不使用

### pinoの使用

```bash
bun add pino
```

```typescript
import pino from "pino";
const logger = pino();
const client = await OidcClient.create({
  //...
  logger,
  //...
})
```

### Console logger

[Console](https://bun.sh/docs/api/console)を使用するロガー。

```typescript
import { consoleLogger } from "elysia-openid-client/loggers/consoleLogger";
const minimumLogLevel = "debug";
const client = await OidcClient.create({
  //...
  logger: consoleLogger(minimumLogLevel),
  //...
})
```

### カスタムロガー

`consoleLogger` の実装を参照のこと。

## エンドポイント

- Login (GET: `/auth/login` )
  - `openid-client` の `client.authorizationUrl` を呼び出す
  - OPの認証エンドポイントにリダイレクトする
- Callback (GET: `/auth/callback` )
  - `openid-client` の `client.callbackParams` と `client.callback` を呼び出す
  - OPからリダイレクトされた後、ログイン完了ページにリダイレクトする
- Logout (GET: `/auth/logout` )
  - `openid-client` の `client.endSessionUrl` を呼び出す
  - OPのログアウトエンドポイントにリダイレクトする
- UserInfo (ALL: `/auth/userinfo` )
  - `openid-client` の `client.userinfo` を呼び出す
  - レスポンス（ユーザー情報）をそのまま返す
- Introspect  (ALL: `/auth/introspect` )
  - `openid-client` の `client.introspect` を呼び出す
  - レスポンスをそのまま返す
- Refresh (ALL: `/auth/refresh` )
  - `openid-client` の `client.refresh` を呼び出す
  - ID Tokenに含まれるクレームを返す
- Resouce (GET: `/auth/resource?url=<resource-url>`)
  - `openid-client` の `client.requestResource` を呼び出す
  - リソースプロバイダーからのレスポンスを返す
- Revoke (ALL: `/auth/revoke` )
  - `openid-client` の `client.revoke` を呼び出す
  - `204` を返す
- Status (ALL: `/auth/status` )
  - 内部データベースからセッションステータスを取得する
  - OPにはアクセスしない
- Claims (ALL: `/auth/claims` )
  - ID Tokenに含まれるクレームを取得する
  - OPにはアクセスしない

## フック

`onBeforeHook` フックでCookieを元にセッションが有効かどうかを判断し、 [`resolve` フック](https://elysiajs.com/life-cycle/before-handle.html#resolve)から `sessionStatus` と `sessionClaims` を返す。

- セッションが有効な場合
  - `sessionStatus` : セッションステータス
  - `sessionClaims` : ID Token Claims
- セッションが無効な場合
  - `loginRedirectUrl` にリダイレクト
  - `disableRedirect` が `false` の場合は `sessionStatus` , `sessionClaims` 共に `null`
- 設定
  - [AuthHookOptions](https://macropygia.github.io/elysia-openid-client/interfaces/types.AuthHookOptions.html).

```typescript
const rp = await OidcClient.create(clientOptions);

const hookOptions: AuthHookOptions = {
  scope: "scoped",
  loginRedirectUrl: "/auth/login",
  disableRedirect: false,
  autoRefresh: true,
}

const hook = rp.getAuthHook(hookOptions);
```

## Contributing

本リポジトリに提供するコードを `GitHub Copilot` で生成する場合、必ず `Suggestions matching public code` オプションを `Block` に設定すること。
同様のオプションが存在する類似のサービスを使用する場合も同様。
