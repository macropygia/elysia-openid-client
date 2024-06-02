import {
  type Mock,
  afterAll,
  beforeEach,
  describe,
  expect,
  mock,
  test,
} from "bun:test";
import {
  mockActiveSessionWithRealIdToken,
  mockActiveSessionWithRealIdTokenExpired,
  mockActiveSessionWithRealIdTokenRefreshed,
  mockBaseClient,
  mockGetInit,
  mockResetRecursively,
  rpPort,
} from "@mock/const";
import Elysia from "elysia";
import { autoRefreshHook } from "./autoRefreshHook";

describe("Unit/utils/autoRefreshHook", () => {
  const { logger } = mockBaseClient;

  beforeEach(() => {
    mockResetRecursively(mockBaseClient);
    (mockBaseClient.fetchSession as Mock<any>).mockReturnValue(
      mockActiveSessionWithRealIdToken,
    );
    (mockBaseClient.updateSession as Mock<any>).mockReturnValue(
      mockActiveSessionWithRealIdTokenRefreshed,
    );
    mockBaseClient.client.refresh = mock();
  });

  afterAll(() => {
    mockResetRecursively(mockBaseClient);
  });

  test("Session ID does not exist (refreshHook)", async () => {
    const hook = autoRefreshHook.call(mockBaseClient);
    const app = new Elysia()
      .guard((app) => app.use(hook).get("/", () => ""))
      .listen(rpPort);

    const res = await app.handle(new Request(`http://localhost:${rpPort}/`));

    expect(res.status).toBe(401);
    expect(logger?.debug).toHaveBeenCalledWith(
      "Session ID does not exist (refreshHook)",
    );
    app.stop();
  });

  test("Session data does not exist (refreshHook)", async () => {
    const hook = autoRefreshHook.call(mockBaseClient);
    const app = new Elysia()
      .guard((app) => app.use(hook).get("/", () => ""))
      .listen(rpPort);

    (mockBaseClient.fetchSession as Mock<any>).mockReturnValue(null);

    const res = await app.handle(
      new Request(`http://localhost:${rpPort}/`, mockGetInit()),
    );

    expect(res.status).toBe(401);
    expect(logger?.debug).toHaveBeenCalledWith(
      "Session data does not exist (refreshHook)",
    );
    app.stop();
  });

  test("ID Token does not exist", async () => {
    const hook = autoRefreshHook.call(mockBaseClient);
    const app = new Elysia()
      .guard((app) => app.use(hook).get("/", () => ""))
      .listen(rpPort);

    (mockBaseClient.fetchSession as Mock<any>).mockReturnValue({
      ...mockActiveSessionWithRealIdToken,
      idToken: undefined,
    });

    const res = await app.handle(
      new Request(`http://localhost:${rpPort}/`, mockGetInit()),
    );

    expect(res.status).toBe(401);
    expect(logger?.warn).toHaveBeenCalledWith(
      "ID Token or Access Token does not exist (refreshHook)",
    );
    app.stop();
  });

  test("Access Token does not exist", async () => {
    const hook = autoRefreshHook.call(mockBaseClient);
    const app = new Elysia()
      .guard((app) => app.use(hook).get("/", () => ""))
      .listen(rpPort);

    (mockBaseClient.fetchSession as Mock<any>).mockReturnValue({
      ...mockActiveSessionWithRealIdToken,
      accessToken: undefined,
    });

    const res = await app.handle(
      new Request(`http://localhost:${rpPort}/`, mockGetInit()),
    );

    expect(res.status).toBe(401);
    expect(logger?.warn).toHaveBeenCalledWith(
      "ID Token or Access Token does not exist (refreshHook)",
    );
    app.stop();
  });

  test("Expired/Refresh Token does not exist", async () => {
    const hook = autoRefreshHook.call(mockBaseClient);
    const app = new Elysia()
      .guard((app) => app.use(hook).get("/", () => ""))
      .listen(rpPort);

    (mockBaseClient.fetchSession as Mock<any>).mockReturnValue({
      ...mockActiveSessionWithRealIdTokenExpired,
      refreshToken: undefined,
    });

    const res = await app.handle(
      new Request(`http://localhost:${rpPort}/`, mockGetInit()),
    );

    expect(res.status).toBe(401);
    expect(mockBaseClient.deleteSession).toHaveBeenCalledTimes(1);
    expect(logger?.warn).toHaveBeenCalledWith("Session expired (refreshHook)");
    app.stop();
  });

  test("Expired/Auto refresh is disabled", async () => {
    mockBaseClient.authHookSettings.autoRefresh = false;
    const hook = autoRefreshHook.call(mockBaseClient);
    const app = new Elysia()
      .guard((app) => app.use(hook).get("/", () => ""))
      .listen(rpPort);

    (mockBaseClient.fetchSession as Mock<any>).mockReturnValue(
      mockActiveSessionWithRealIdTokenExpired,
    );

    const res = await app.handle(
      new Request(`http://localhost:${rpPort}/`, mockGetInit()),
    );

    expect(res.status).toBe(401);
    expect(mockBaseClient.deleteSession).toHaveBeenCalledTimes(1);
    expect(logger?.warn).toHaveBeenCalledWith("Session expired (refreshHook)");
    app.stop();
    mockBaseClient.authHookSettings.autoRefresh = true;
  });

  test("Succeeded", async () => {
    const hook = autoRefreshHook.call(mockBaseClient);
    let result: any;
    const app = new Elysia()
      .guard((app) =>
        app.use(hook).get("/", ({ sessionData }) => {
          result = sessionData;
        }),
      )
      .listen(rpPort);

    (mockBaseClient.fetchSession as Mock<any>).mockReturnValue(
      mockActiveSessionWithRealIdTokenExpired,
    );

    const res = await app.handle(
      new Request(`http://localhost:${rpPort}/`, mockGetInit()),
    );

    expect(result).toBe(mockActiveSessionWithRealIdTokenRefreshed);
    expect(res.status).toBe(200);
  });

  test("Session renew failed", async () => {
    const hook = autoRefreshHook.call(mockBaseClient);
    const app = new Elysia()
      .guard((app) => app.use(hook).get("/", () => ""))
      .listen(rpPort);

    (mockBaseClient.fetchSession as Mock<any>).mockReturnValue(
      mockActiveSessionWithRealIdTokenExpired,
    );
    (mockBaseClient.updateSession as Mock<any>).mockReturnValue(null);

    const res = await app.handle(
      new Request(`http://localhost:${rpPort}/`, mockGetInit()),
    );

    expect(res.status).toBe(401);
    expect(logger?.warn).toHaveBeenCalledWith(
      "Session renew failed (refreshHook)",
    );
  });

  test("Refresh failed", async () => {
    const hook = autoRefreshHook.call(mockBaseClient);
    const app = new Elysia()
      .guard((app) => app.use(hook).get("/", () => ""))
      .listen(rpPort);

    (mockBaseClient.fetchSession as Mock<any>).mockReturnValue(
      mockActiveSessionWithRealIdTokenExpired,
    );
    mockBaseClient.client.refresh = mock().mockImplementation(() => {
      throw new Error("Error");
    });

    const res = await app.handle(
      new Request(`http://localhost:${rpPort}/`, mockGetInit()),
    );

    expect(res.status).toBe(401);
    expect(logger?.warn).toHaveBeenCalledWith("Throw exception (refreshHook)");
  });

  test("Refresh failed (Unknown error)", async () => {
    const hook = autoRefreshHook.call(mockBaseClient);
    const app = new Elysia()
      .guard((app) => app.use(hook).get("/", () => ""))
      .listen(rpPort);

    (mockBaseClient.fetchSession as Mock<any>).mockReturnValue(
      mockActiveSessionWithRealIdTokenExpired,
    );
    mockBaseClient.client.refresh = mock().mockImplementation(() => {
      throw undefined;
    });

    const res = await app.handle(
      new Request(`http://localhost:${rpPort}/`, mockGetInit()),
    );

    expect(res.status).toBe(500);
    expect(logger?.warn).toHaveBeenCalledWith("Throw exception (refreshHook)");
  });
});
