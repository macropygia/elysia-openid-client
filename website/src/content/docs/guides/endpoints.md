---
title: Endpoints
# description:
---

```typescript
const rp = await OidcClient.factory({ ... });
const endpoints = rp.endpoints;
```

- Must be placed outside of `authHook`.
- If path is set to `null`, the endpoint is disabled.
- Ref: [openid-client API Documentation - Client](https://github.com/panva/node-openid-client/blob/main/docs/README.md#client)
- ElysiaJS plugin metadata
    - name: `elysia-openid-client-endpoints`
    - [seed](https://elysiajs.com/essential/plugin#plugin-deduplication): `settings.pluginSeed` or else `issuerUrl`

### Login

- Default path: `/auth/login`
- Method: `GET`
- Calls `client.authorizationUrl` of openid-client.
- Redirect to authorization endpoint of the OP.

### Callback

- Default path: `/auth/callback`
- Method: `GET`
- Calls `client.callbackParams` and `client.callback` of openid-client.
- Redirect from the OP and redirect to the login completed page.

### Logout

- Default path: `/auth/logout`
- Method: `GET`
- Calls `client.endSessionUrl` of openid-client.
- Redirect to logout (end session) endpoint of the OP.

### UserInfo

- Default path: `/auth/userinfo`
- Method: `ALL`
- Calls `client.userinfo` of openid-client.
- Returns response (UserInfo) directly.

### Introspect

- Default path: `/auth/introspect`
- Method: `ALL`
- Calls `client.introspect` of openid-client.
- Returns response directly.

### Refresh

- Default path: `/auth/refresh`
- Method: `ALL`
- Calls `client.refresh` of openid-client.
- Returns ID Token Claims.

### Resource

- Default path: `/auth/resource?url=<resource-url>`
- Method: `GET`
- Calls `client.requestResource` of openid-client.
- Through the response from the resource provider.

### Revoke

- Default path: `/auth/revoke`
- Method: `ALL`
- Calls `client.revoke` of openid-client.
- Return `204`

### Status

- Default path: `/auth/status`
- Method: `ALL`
- Fetches session status from internal database.
- Does not call any endpoint of the OP.

### Claims

- Default path: `/auth/claims`
- Method: `ALL`
- Fetches ID Token Claims from internal database.
- Does not call any endpoint of the OP.
