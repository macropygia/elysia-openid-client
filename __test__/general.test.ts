import { afterAll, describe, expect, test } from "bun:test";
import { mockPostInit } from "@/__mock__/const";
import { getRandomPort } from "@/__mock__/getRandomPort";
import { mockProvider } from "@/__mock__/mockProvider";
import OidcClient from "@/index";
import Elysia from "elysia";
import setCookie from "set-cookie-parser";

describe("Integration/general", async () => {
  const opPort = getRandomPort();
  const rpPort = getRandomPort();

  const baseUrl = `http://localhost:${rpPort}`;
  const issuerUrl = `http://localhost:${opPort}`;

  const op = await mockProvider(opPort);

  const client_id = "mock-client-id";
  const client_secret = "mock-client-secret";
  const oidcClient = await OidcClient.create({
    baseUrl,
    issuerUrl,
    clientMetadata: {
      client_id,
      client_secret,
    },
    authParams: {},
  });
  const endpoints = oidcClient.getEndpoints();
  const app = new Elysia()
    .get("/", () => "home")
    .use(endpoints)
    .listen(rpPort);
  const {
    // clientMetadata,
    //  authParams,
    settings,
    cookieSettings,
  } = oidcClient;

  // Context
  const ctx: {
    sessionId?: string;
    authorizationUrl?: string;
  } = {};

  afterAll(async () => {
    await op.stop();
    await app.stop();
  });

  test("login", async () => {
    const res = await app.handle(
      new Request(`${baseUrl}${settings.pathPrefix}${settings.loginPath}`),
    );
    const cookie = setCookie.parse(res.headers.get("set-cookie") as string)[0];
    ctx.sessionId = cookie.value;
    ctx.authorizationUrl = res.headers.get("location") as string;
    expect(res.status).toBe(303);
  });

  test("callback", async () => {
    const session = oidcClient.sessions.fetch(ctx.sessionId as string);
    if (!session) {
      expect(session).toBeTruthy();
      return;
    }
    const res = await fetch(ctx.authorizationUrl as string, {
      headers: {
        Cookie: `${cookieSettings.sessionIdName}=${ctx.sessionId}`,
      },
    }).then((res) => res);
    expect(res.text()).resolves.toBe("home");
  });

  test("userinfo", async () => {
    const res = await app.handle(
      new Request(
        `${baseUrl}${settings.pathPrefix}${settings.userinfoPath}`,
        mockPostInit(ctx.sessionId as string),
      ),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ endpoint: "userinfo" });
  });

  test("introspect", async () => {
    const res = await app.handle(
      new Request(
        `${baseUrl}${settings.pathPrefix}${settings.introspectPath}`,
        mockPostInit(ctx.sessionId as string),
      ),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ endpoint: "introspect" });
  });

  test("logout", async () => {
    const res = await app.handle(
      new Request(`${baseUrl}${settings.pathPrefix}${settings.logoutPath}`, {
        headers: {
          Cookie: `${cookieSettings.sessionIdName}=${ctx.sessionId}`,
        },
      }),
    );
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toBeTypeOf("string");
  });

  test("revoke", async () => {
    // Re-login
    const loginRes = await app.handle(
      new Request(`${baseUrl}${settings.pathPrefix}${settings.loginPath}`),
    );
    const cookie = setCookie.parse(
      loginRes.headers.get("set-cookie") as string,
    )[0];
    ctx.sessionId = cookie.value;

    // Revoke
    const res = await app.handle(
      new Request(
        `${baseUrl}${settings.pathPrefix}${settings.revokePath}`,
        mockPostInit(ctx.sessionId as string),
      ),
    );
    expect(res.status).toBe(204);
  });

  test("beforeHandle", () => {
    expect(oidcClient.getAuthHook({ scope: "scoped" })).toBeTruthy();
  });
});
