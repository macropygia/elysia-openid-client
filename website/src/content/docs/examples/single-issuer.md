---
title: Single Issuer
---

```typescript
import Elysia from "elysia";
import { OidcClient } from "elysia-openid-client";

// Callback URL: `https://app.example.com/auth/callback`
const rp = await OidcClient.factory({
  baseUrl: "https://app.example.com",
  issuerUrl: "https://issuer.exmaple.com",
  clientMetadata: {
    client_id: "client-id",
    client_secret: "client-secret",
  },
});
const endpoints = rp.endpoints;
const authHook = rp.authHook;

console.log(rp.issuer.metadata);

new Elysia()
  .use(endpoints)
  .guard((app) =>
    app
      .use(authHook)
      .get("/", ({ sessionStatus }) =>
        sessionStatus ? "Logged in" : "Restricted",
      )
      .get("/status", ({ sessionStatus }) => sessionStatus)
      .get("/claims", ({ sessionClaims }) => sessionClaims)
      // Get UserInfo internally
      .get(
        "/userinfo",
        async ({ cookie, session }) =>
          await rp.userinfo({ cookie, session }),
      ),
  )
  .get("/free", () => "Not restricted")
  .get("/logout", () => "Logout completed")
  .listen(80);
```
