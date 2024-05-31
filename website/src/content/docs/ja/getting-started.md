---
title: Getting Started
# description:
---

```bash
bun add elysia-openid-client
```

```typescript
import Elysia from "elysia";
import { OidcClient } from "elysia-openid-client";

const rp = await OidcClient.create({
  baseUrl: "https://app.example.com", // RP URL
  issuerUrl: "https://issuer.example.com", // OP URL
  clientMetadata: {
    client_id: "client-id",
    client_secret: "client-secret",
  },
});
const endpoints = rp.getEndpoints(); // Endpoints plugin
const hook = rp.getAuthHook(); // Auth hook plugin

console.log(rp.issuerMetadata); // Show OP metadata

new Elysia()
  .use(endpoints) // Add endpoints
  .guard((app) => // Define restricted area
    app
      .use(hook) // Add onBeforeHandle hook for authentication/authorization
      .onBeforeHandle(({ sessionStatus, sessionClaims }) => {
        // Authorization by name, mail, group, etc.
      })
      .get("/", ({ sessionStatus }) => sessionStatus ? "Logged in" : "Restricted")
      .get("/status", ({ sessionStatus }) => sessionStatus)
      .get("/claims", ({ sessionClaims }) => sessionClaims),
  )
  .get("/free", () => "Not restricted")
  .get("/logout", () => "Logout completed")
  .listen(80);
```
