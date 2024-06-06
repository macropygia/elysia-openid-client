---
title: Auth Hook
# description:
---

`onBeforeHandle` フックでCookieを元にセッションが有効かどうかを判別し、 [`resolve` フック](https://elysiajs.com/life-cycle/before-handle.html#resolve)から `sessionStatus` と `sessionClaims` を返す。

```typescript
const rp = await OidcClient.factory({
  authHookSettings: {
    loginRedirectUrl: "/path/to/login",
    disableRedirect: false,
    //...
  },
  //...
});
const authHook = rp.authHook;
```

- セッションが有効な場合
    - `sessionStatus` : セッションステータス
        - 参照: [OIDCClientSessionStatus](/elysia-openid-client/ja/api/types/interfaces/oidcclientsessionstatus/)
    - `sessionClaims` : ID Token Claims
        - 参照: [`IdTokenClaims` type definition](https://github.com/panva/node-openid-client/blob/main/types/index.d.ts) of `openid-client`.
        - 参照: `OpenID Connect Core 1.0` の [Claims](https://openid.net/specs/openid-connect-core-1_0.html#Claims) 及び [IDToken](https://openid.net/specs/openid-connect-core-1_0.html#IDToken) の章
- セッションが無効な場合
    - `loginRedirectUrl` にリダイレクト
    - `disableRedirect` が `true` の場合は `sessionStatus` , `sessionClaims` 共に `null` になる
- ElysiaJSプラグインとしてのメタデータ
    - 名称: `elysia-openid-client-auth-hook`
    - [シード](https://elysiajs.com/essential/plugin#plugin-deduplication): `settings.pluginSeed` 、未指定なら `issuerUrl`
- 参照: [OIDCClientAuthHookSettings](/elysia-openid-client/ja/api/types/interfaces/oidcclientauthhooksettings/)
