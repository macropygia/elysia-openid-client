import Elysia from "elysia";
import { OidcClient } from "../";
// import { OidcClient } from "elysia-openid-client";

// Callback URL: `https://app.example.com/auth/callback`
const rp = await OidcClient.create({
  baseUrl: "https://app.example.com",
  issuerUrl: "https://issuer.exmaple.com",
  clientMetadata: {
    client_id: "client-id",
    client_secret: "client-secret",
  },
});
const plugin = rp.getPlugin();
const hook = rp.getAuthHook();

console.log(rp.issuerMetadata);

new Elysia()
  .use(plugin)
  .guard((app) =>
    app
      .use(hook)
      .get("/", ({ sessionStatus }) =>
        sessionStatus ? "Logged in" : "Restricted",
      )
      .get("/status", ({ sessionStatus }) => sessionStatus)
      .get("/claims", ({ sessionClaims }) => sessionClaims),
  )
  .get("/free", () => "Not restricted")
  .get("/logout", () => "Logout completed")
  .listen(80);
