---
title: Endpoints
# description:
---

- ElysiaJSプラグインとしてのメタデータ
    - 名称: `elysia-openid-client-endpoints`
    - [シード](https://elysiajs.com/essential/plugin#plugin-deduplication): `settings.pluginSeed` 、未指定なら `issuerUrl`
- 参照: [openid-client API Documentation - Client](https://github.com/panva/node-openid-client/blob/main/docs/README.md#client)

### 内訳

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
- Resource (GET: `/auth/resource?url=<resource-url>`)
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
