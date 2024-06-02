---
title: Multiple Issuer
---

```typescript
import Elysia from "elysia";
import { OidcClient } from "../src";
import { SQLiteAdapter } from "../src/dataAdapters/SQLiteAdapter";
// import { OidcClient } from "elysia-openid-client";
// import { SQLiteAdapter } from "elysia-openid-client/dataAdapters/SQLiteAdapter";

const baseUrl = "https://app.example.com";

// Use the same data adapter for all issuers
const dataAdapter = new SQLiteAdapter();

// Callback URL: `https://app.example.com/auth/callback`
const rp1 = await OidcClient.factory({
  baseUrl,
  issuerUrl: "https://issuer.exmaple.com",
  clientMetadata: {
    client_id: "client-id",
    client_secret: "client-secret",
  },
  dataAdapter,
  authHookSettings: {
    loginRedirectUrl: "/select",
  },
});
const endpoints1 = rp1.endpoints;

console.log(rp1.issuerMetadata);

// Callback URL: `https://app.example.com/another/callback`
const rp2 = await OidcClient.factory({
  baseUrl,
  issuerUrl: "https://another-issuer.exmaple.com",
  clientMetadata: {
    client_id: "another-client-id",
    client_secret: "another-client-secret",
  },
  dataAdapter,
  settings: {
    pathPrefix: "/another",
  },
});
const endpoints2 = rp2.endpoints;

console.log(rp2.issuerMetadata);

// No matter which RP hook is used
const authHook = rp1.authHook;

new Elysia()
  .use(endpoints1)
  .use(endpoints2)
  .guard((app) =>
    app
      .use(authHook)
      .get("/", ({ sessionStatus }) =>
        sessionStatus ? "Logged in" : "Restricted",
      )
      .get("/status", ({ sessionStatus }) => sessionStatus)
      // Issuer can be identified from `sessionClaims.iss`
      .get("/claims", ({ sessionClaims }) => sessionClaims),
  )
  .get("/select", ({ set }) => {
    set.headers["Content-Type"] = "text/html";
    return `
<html>
<body>
<p><a href="/auth/login">Issuer</a></p>
<p><a href="/another/login">Another</a></p>
</body>
</html>
    `;
  })
  .get("/free", () => "Not restricted")
  .get("/logout", () => "Logout completed")
  .listen(80);
```
