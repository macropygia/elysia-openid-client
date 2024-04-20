import { afterAll, describe, expect, test } from "bun:test";
import OidcClient from "@/index";
import Elysia from "elysia";
import setCookie from "set-cookie-parser";
import { opPort, postInitWithSid, rpPort } from "./const";
import { opMock } from "./opMock";

describe("Integration/general", async () => {
  const baseUrl = `http://localhost:${rpPort}`;
  const issuerUrl = `http://localhost:${opPort}`;

  const op = await opMock(opPort);

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

  afterAll(() => {
    op.stop();
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
        postInitWithSid(ctx.sessionId as string),
      ),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ endpoint: "userinfo" });
  });

  test("introspect", async () => {
    const res = await app.handle(
      new Request(
        `${baseUrl}${settings.pathPrefix}${settings.introspectPath}`,
        postInitWithSid(ctx.sessionId as string),
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
        postInitWithSid(ctx.sessionId as string),
      ),
    );
    expect(res.status).toBe(204);
  });

  test("beforeHandle", () => {
    expect(oidcClient.getAuthHook({ scope: "scoped" })).toBeTruthy();
  });
});
