---
title: Hooks
# description:
---

Determine the validity of the session in `onBeforeHandle`, and return `sessionStatus` and `sessionClaims` from the [`resolve` hook](https://elysiajs.com/life-cycle/before-handle.html#resolve).

```typescript
const rp = await OidcClient.factory({ ... });
const hookOptions: OIDCClientAuthHookSettings = { ... };
const hook = rp.createAuthHook(hookOptions);
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
- Ref: [OIDCClientAuthHookSettings](https://macropygia.github.io/elysia-openid-client/interfaces/types.OIDCClientAuthHookSettings.html)
