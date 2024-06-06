import { afterAll, beforeEach, describe, expect, mock, test } from "bun:test";
import { sessionToStatus } from "@/utils";
import {
  mockActiveSessionWithRealIdToken,
  mockActiveSessionWithRealIdTokenExpired,
  mockBaseClient,
  mockGetInit,
  mockIdTokenClaims,
  mockLoginSession,
  mockResetRecursively,
  rpPort,
} from "@mock/const";
import Elysia from "elysia";
import { createAuthHook } from "./createAuthHook";

describe("Unit/methods/createAuthHook", () => {
  const { logger } = mockBaseClient;

  beforeEach(() => {
    mockResetRecursively(mockBaseClient);
  });

  afterAll(() => {
    mockResetRecursively(mockBaseClient);
  });

  test("Method is not GET (authHook)", async () => {
    const hook = createAuthHook.call(mockBaseClient);
    const app = new Elysia()
      .guard((app) => app.use(hook).post("/", () => ""))
      .listen(rpPort);

    const res = await app.handle(
      new Request(`http://localhost:${rpPort}/`, { method: "POST" }),
    );

    expect(res.status).toBe(200);
    expect(logger?.debug).toHaveBeenCalledWith("Method is not GET (authHook)");

    app.stop();
  });

  test("Session ID does not exist (authHook)", async () => {
    const hook = createAuthHook.call(mockBaseClient);
    const app = new Elysia()
      .guard((app) => app.use(hook).get("/", () => ""))
      .listen(rpPort);

    const res = await app.handle(new Request(`http://localhost:${rpPort}/`));

    expect(res.status).toBe(303);
    expect(logger?.debug).toHaveBeenCalledWith(
      "Session ID does not exist (authHook)",
    );

    app.stop();
  });

  test("Session data does not exist (authHook)", async () => {
    const hook = createAuthHook.call(mockBaseClient);
    const app = new Elysia()
      .guard((app) => app.use(hook).get("/", () => ""))
      .listen(rpPort);

    const res = await app.handle(
      new Request(`http://localhost:${rpPort}/`, mockGetInit()),
    );

    expect(res.status).toBe(303);
    expect(logger?.debug).toHaveBeenCalledWith(
      "Session data does not exist (authHook)",
    );

    app.stop();
  });

  test("ID Token or Access Token does not exist (authHook)", async () => {
    mockBaseClient.fetchSession = mock().mockResolvedValue({
      mockLoginSession,
    });

    const hook = createAuthHook.call(mockBaseClient);
    const app = new Elysia()
      .guard((app) => app.use(hook).get("/", () => ""))
      .listen(rpPort);

    const res = await app.handle(
      new Request(`http://localhost:${rpPort}/`, mockGetInit()),
    );

    expect(res.status).toBe(303);
    expect(mockBaseClient.deleteSession).toHaveBeenCalledTimes(1);
    expect(logger?.warn).toHaveBeenCalledWith(
      "ID Token or Access Token does not exist (authHook)",
    );

    app.stop();
  });

  test("Session expired (authHook) Auto refresh disabled", async () => {
    mockBaseClient.fetchSession = mock().mockReturnValue(
      mockActiveSessionWithRealIdTokenExpired,
    );

    mockBaseClient.authHookSettings.autoRefresh = false;
    const hook = createAuthHook.call(mockBaseClient);
    const app = new Elysia()
      .guard((app) => app.use(hook).get("/", () => ""))
      .listen(rpPort);

    const res = await app.handle(
      new Request(`http://localhost:${rpPort}/`, mockGetInit()),
    );

    expect(res.status).toBe(303);
    expect(mockBaseClient.deleteSession).toHaveBeenCalledTimes(1);
    expect(logger?.warn).toHaveBeenCalledWith("Session expired (authHook)");

    app.stop();
    mockBaseClient.authHookSettings.autoRefresh = true;
  });

  test("Session expired (authHook) Refresh token does not exist", async () => {
    mockBaseClient.fetchSession = mock().mockReturnValue({
      ...mockActiveSessionWithRealIdTokenExpired,
      refreshToken: undefined,
    });

    const hook = createAuthHook.call(mockBaseClient);
    const app = new Elysia()
      .guard((app) => app.use(hook).get("/", () => ""))
      .listen(rpPort);

    const res = await app.handle(
      new Request(`http://localhost:${rpPort}/`, mockGetInit()),
    );

    expect(res.status).toBe(303);
    expect(mockBaseClient.deleteSession).toHaveBeenCalledTimes(1);
    expect(logger?.warn).toHaveBeenCalledWith("Session expired (authHook)");

    app.stop();
  });

  test("Session renew failed (authHook)", async () => {
    mockBaseClient.fetchSession = mock().mockReturnValue(
      mockActiveSessionWithRealIdTokenExpired,
    );
    mockBaseClient.client.refresh = mock();
    mockBaseClient.updateSession = mock().mockReturnValue(null);

    const hook = createAuthHook.call(mockBaseClient);
    const app = new Elysia()
      .guard((app) => app.use(hook).get("/", () => ""))
      .listen(rpPort);

    const res = await app.handle(
      new Request(`http://localhost:${rpPort}/`, mockGetInit()),
    );

    expect(res.status).toBe(303);
    expect(mockBaseClient.updateSession).toHaveBeenCalledTimes(1);
    expect(logger?.warn).toHaveBeenCalledWith("Auto refresh failed (authHook)");

    app.stop();
  });

  test("Error on refresh", async () => {
    mockBaseClient.fetchSession = mock().mockReturnValue(
      mockActiveSessionWithRealIdTokenExpired,
    );
    mockBaseClient.client.refresh = mock().mockImplementation(() => {
      throw new Error("Error");
    });
    mockBaseClient.updateSession = mock().mockReturnValue(null);

    const hook = createAuthHook.call(mockBaseClient);
    const app = new Elysia()
      .guard((app) => app.use(hook).get("/", () => ""))
      .listen(rpPort);

    const res = await app.handle(
      new Request(`http://localhost:${rpPort}/`, mockGetInit()),
    );

    expect(res.status).toBe(401);
    expect(mockBaseClient.deleteSession).toHaveBeenCalledTimes(1);
    expect(logger?.warn).toHaveBeenCalledWith("Throw exception (authHook)");

    app.stop();
  });

  test("Unknown error on refresh", async () => {
    mockBaseClient.fetchSession = mock().mockReturnValue(
      mockActiveSessionWithRealIdTokenExpired,
    );
    mockBaseClient.client.refresh = mock().mockImplementation(() => {
      throw "Unknown error";
    });
    mockBaseClient.updateSession = mock().mockReturnValue(null);

    const hook = createAuthHook.call(mockBaseClient);
    const app = new Elysia()
      .guard((app) => app.use(hook).get("/", () => ""))
      .listen(rpPort);

    const res = await app.handle(
      new Request(`http://localhost:${rpPort}/`, mockGetInit()),
    );

    expect(res.status).toBe(500);
    expect(mockBaseClient.deleteSession).toHaveBeenCalledTimes(1);
    expect(logger?.warn).toHaveBeenCalledWith("Throw exception (authHook)");

    app.stop();
  });

  test("Succeeded with refresh", async () => {
    mockBaseClient.fetchSession = mock().mockReturnValue(
      mockActiveSessionWithRealIdTokenExpired,
    );
    mockBaseClient.client.refresh = mock();
    mockBaseClient.updateSession = mock().mockReturnValue(
      mockActiveSessionWithRealIdToken,
    );

    const hook = createAuthHook.call(mockBaseClient);
    const app = new Elysia()
      .guard((app) =>
        app.use(hook).get("/", ({ sessionStatus, sessionClaims }) =>
          JSON.stringify({
            sessionStatus,
            sessionClaims,
          }),
        ),
      )
      .listen(rpPort);

    const res = await app.handle(
      new Request(`http://localhost:${rpPort}/`, mockGetInit()),
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      sessionClaims: mockIdTokenClaims,
      sessionStatus: sessionToStatus(mockActiveSessionWithRealIdToken),
    });
    app.stop();
  });

  test("Succeeded withpit refresh", async () => {
    mockBaseClient.fetchSession = mock().mockReturnValue(
      mockActiveSessionWithRealIdToken,
    );

    const hook = createAuthHook.call(mockBaseClient);
    const app = new Elysia()
      .guard((app) =>
        app.use(hook).get("/", ({ sessionStatus, sessionClaims }) =>
          JSON.stringify({
            sessionStatus,
            sessionClaims,
          }),
        ),
      )
      .listen(rpPort);

    const res = await app.handle(
      new Request(`http://localhost:${rpPort}/`, mockGetInit()),
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      sessionClaims: mockIdTokenClaims,
      sessionStatus: sessionToStatus(mockActiveSessionWithRealIdToken),
    });
    app.stop();
  });
});
