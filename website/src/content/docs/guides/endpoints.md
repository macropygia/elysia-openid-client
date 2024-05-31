---
title: Endpoints
# description:
---

- ElysiaJS plugin metadata
    - name: `elysia-openid-client-endpoints`
    - [seed](https://elysiajs.com/essential/plugin#plugin-deduplication): `settings.pluginSeed` or else `issuerUrl`
- Ref: [openid-client API Documentation - Client](https://github.com/panva/node-openid-client/blob/main/docs/README.md#client)

## Details

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
