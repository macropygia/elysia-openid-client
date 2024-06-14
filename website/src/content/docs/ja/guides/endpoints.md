---
title: Endpoints
# description:
---

```typescript
const rp = await OidcClient.factory({ ... });
const endpoints = rp.endpoints;
```

- `authHook` の外側に配置する必要がある
- パスが `null` に設定されたエンドポイントは無効化される
- 参照: [openid-client API Documentation - Client](https://github.com/panva/node-openid-client/blob/main/docs/README.md#client)
- ElysiaJSプラグインとしてのメタデータ
    - 名称: `elysia-openid-client-endpoints`
    - [シード](https://elysiajs.com/essential/plugin#plugin-deduplication): `settings.pluginSeed` 、未指定なら `issuerUrl`

### Login

- 既定のパス:  `/auth/login`
- メソッド: `GET`
- `openid-client` の `client.authorizationUrl` を呼び出す
- OPの認証エンドポイントにリダイレクトする

### Callback

- 既定のパス:  `/auth/callback`
- メソッド: `GET`
- `openid-client` の `client.callbackParams` と `client.callback` を呼び出す
- OPからリダイレクトされた後、ログイン完了ページにリダイレクトする

### Logout

- 既定のパス:  `/auth/logout`
- メソッド: `GET`
- `openid-client` の `client.endSessionUrl` を呼び出す
- OPのログアウトエンドポイントにリダイレクトする

### UserInfo

- 既定のパス:  `/auth/userinfo`
- メソッド: `ALL`
- `openid-client` の `client.userinfo` を呼び出す
- レスポンス（ユーザー情報）をそのまま返す

### Introspect

- 既定のパス:  `/auth/introspect`
- メソッド: `ALL`
- `openid-client` の `client.introspect` を呼び出す
- レスポンスをそのまま返す

### Refresh

- 既定のパス:  `/auth/refresh`
- メソッド: `ALL`
- `openid-client` の `client.refresh` を呼び出す
- ID Tokenに含まれるクレームを返す

### Resource

- 既定のパス:  `/auth/resource?url=<resource-url>`
- メソッド: `GET`
- `openid-client` の `client.requestResource` を呼び出す
- リソースプロバイダーからのレスポンスを返す

### Revoke

- 既定のパス:  `/auth/revoke`
- メソッド: `ALL`
- `openid-client` の `client.revoke` を呼び出す
- `204` を返す

### Status

- 既定のパス:  `/auth/status`
- メソッド: `ALL`
- 内部データベースからセッションステータスを取得する
- OPにはアクセスしない

### Claims

- 既定のパス:  `/auth/claims`
- メソッド: `ALL`
- ID Tokenに含まれるクレームを取得する
- OPにはアクセスしない
