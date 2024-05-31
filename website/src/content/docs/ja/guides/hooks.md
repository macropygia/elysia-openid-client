---
title: Hooks
# description:
---

`onBeforeHandle` フックでCookieを元にセッションが有効かどうかを判断し、 [`resolve` フック](https://elysiajs.com/life-cycle/before-handle.html#resolve)から `sessionStatus` と `sessionClaims` を返す。

```typescript
const rp = await OidcClient.factory({ ... });
const hookOptions: AuthHookOptions = { ... };
const hook = rp.getAuthHook(hookOptions);
```

- セッションが有効な場合
    - `sessionStatus` : セッションステータス
        - 参照: [OIDCClientSessionStatus](https://macropygia.github.io/elysia-openid-client/interfaces/types.OIDCClientSessionStatus.html)
    - `sessionClaims` : ID Token Claims
        - 参照: [`IdTokenClaims` type definition](https://github.com/panva/node-openid-client/blob/main/types/index.d.ts) of `openid-client`.
        - 参照: `OpenID Connect Core 1.0` の [Claims](https://openid.net/specs/openid-connect-core-1_0.html#Claims) 及び [IDToken](https://openid.net/specs/openid-connect-core-1_0.html#IDToken) の章
- セッションが無効な場合
    - `loginRedirectUrl` にリダイレクト
    - `disableRedirect` が `true` の場合は `sessionStatus` , `sessionClaims` 共に `null` になる
- ElysiaJSプラグインとしてのメタデータ
    - 名称: `elysia-openid-client-auth-hook`
    - [シード](https://elysiajs.com/essential/plugin#plugin-deduplication): `settings.pluginSeed` 、未指定なら `issuerUrl`
- 参照: [AuthHookOptions](https://macropygia.github.io/elysia-openid-client/interfaces/types.AuthHookOptions.html)
