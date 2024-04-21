import { logger, opPort } from "@/__mock__/const";
import Elysia from "elysia";
// biome-ignore lint/style/noNamespaceImport: <explanation>
import * as jose from "jose";
import loki from "lokijs";
import {
  type AuthorizationParameters,
  type IdTokenClaims,
  type TokenSetParameters,
  generators,
} from "openid-client";
import { mockIssuerMetadata } from "./issuerMetadata";

export const mockProvider = async (port: number) => {
  // JWT
  const keys = [];
  const { privateKey } = await jose.generateKeyPair("RS256", {
    extractable: true,
  });
  const { n, e, kty } = await jose.exportJWK(privateKey);
  const alg = "RS256";
  const kid = generators.random();
  const use = "sig";
  keys.push({ kty, alg, kid, use, e, n });
  const jwks = { keys };

  // DB
  const db = new loki("in-memory.db");
  interface Connection extends AuthorizationParameters {
    code?: string;
  }
  const connections = db.addCollection<Connection>("connections", {
    indices: [],
  });

  return new Elysia()
    .get("/oauth2/authorize", ({ request, set }) => {
      logger?.trace("/oauth2/authorize");
      const url = new URL(request.url);
      const state = url.searchParams.get("state") as string;
      const redirect_uri = url.searchParams.get("redirect_uri") as string;
      const code = generators.random();
      const connection: Connection = { code };
      for (const [key, value] of url.searchParams) {
        connection[key] = value;
      }
      connections.insert(connection);

      const params = new URLSearchParams({
        code,
        state,
      });
      set.status = 302;
      set.redirect = `${redirect_uri}?${params}`;
    })
    .post("/oauth2/token", async ({ body, set }) => {
      logger?.trace("/oauth2/token");
      const {
        // grant_type,
        code,
        // redirect_uri,
        code_verifier,
        client_id,
        // client_secret,
      } = body as unknown as Record<string, string>;
      const connection = connections.findOne({
        code: { $eq: code },
      }) as Connection;
      const { nonce, scope, code_challenge } = connection;

      if (code_challenge === generators.codeChallenge(code_verifier)) {
        logger?.trace("PKCE Code Verified");
      }

      const claims: IdTokenClaims = {
        iss: `http://localhost:${opPort}`,
        sub: "elysia-openid-client",
        aud: client_id,
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
        nonce,
      };
      const id_token = await new jose.SignJWT(claims)
        .setProtectedHeader({ alg })
        .sign(privateKey);
      const tokenSet: TokenSetParameters = {
        access_token: "mock-access-token",
        token_type: "Bearer",
        id_token,
        refresh_token: "mock-refresh-token",
        scope,
        expires_at: Math.floor(Date.now() / 1000) + 60 * 60, // 1h
        session_state: "string",
        sub: "elysia-openid-client",
      };

      set.headers["Content-type"] = "application/json";
      return tokenSet;
    })
    .all("/oauth2/userinfo", () => {
      logger?.trace("/oauth2/userinfo");
      return { endpoint: "userinfo" };
    })
    .get("/oauth2/clients", () => {
      logger?.trace("/oauth2/clients");
      return "clients";
    })
    .get("/oauth2/keys", ({ set }) => {
      set.headers["Content-Type"] = "application/json";
      return jwks;
    })
    .post("/oauth2/introspect", () => {
      logger?.trace("/oauth2/introspect");
      return { endpoint: "introspect" };
    })
    .post("/oauth2/revoke", () => {
      logger?.trace("/oauth2/revoke");
      return "revoke";
    })
    .all("/oauth2/logout", ({ request }) => {
      logger?.trace(request.url);
      return "logout";
    })
    .get("/oauth2/device/authorize", ({ request }) => {
      logger?.trace(request.url);
      return "/device/authorize";
    })
    .get("/.well-known/openid-configuration", ({ set }) => {
      set.headers["Content-Type"] = "application/json";
      return mockIssuerMetadata;
    })
    .listen(port);
};
