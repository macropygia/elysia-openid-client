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
  mockSessionId,
  rpPort,
} from "@mock/const";
import Elysia from "elysia";
import { addShortId } from "./addShortId";
import { revalidateHook } from "./revalidateHook";

describe("Unit/utils/revalidateHook", () => {
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

  test("Session ID does not exist (revalidateHook)", async () => {
    const hook = revalidateHook.call(mockBaseClient);
    const app = new Elysia()
      .guard((app) => app.use(hook).get("/", () => ""))
      .listen(rpPort);

    const res = await app.handle(new Request(`http://localhost:${rpPort}/`));

    expect(res.status).toBe(401);
    expect(logger?.debug).toHaveBeenCalledWith(
      "Session ID does not exist (revalidateHook)",
    );
    app.stop();
  });

  test("Session data does not exist (revalidateHook)", async () => {
    const hook = revalidateHook.call(mockBaseClient);
    const app = new Elysia()
      .guard((app) => app.use(hook).get("/", () => ""))
      .listen(rpPort);

    (mockBaseClient.fetchSession as Mock<any>).mockReturnValue(null);

    const res = await app.handle(
      new Request(`http://localhost:${rpPort}/`, mockGetInit()),
    );

    expect(res.status).toBe(401);
    expect(logger?.debug).toHaveBeenCalledWith(
      addShortId("Session data does not exist (revalidateHook)", mockSessionId),
    );
    app.stop();
  });

  test("ID Token does not exist", async () => {
    const hook = revalidateHook.call(mockBaseClient);
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
      addShortId(
        "ID Token or Access Token does not exist (revalidateHook)",
        mockSessionId,
      ),
    );
    app.stop();
  });

  test("Access Token does not exist", async () => {
    const hook = revalidateHook.call(mockBaseClient);
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
      addShortId(
        "ID Token or Access Token does not exist (revalidateHook)",
        mockSessionId,
      ),
    );
    app.stop();
  });

  test("Expired/Refresh Token does not exist", async () => {
    const hook = revalidateHook.call(mockBaseClient);
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
    expect(logger?.info).toHaveBeenCalledWith(
      addShortId("Session expired (revalidateHook)", mockSessionId),
    );
    app.stop();
  });

  test("Expired/Auto refresh is disabled", async () => {
    mockBaseClient.authHookSettings.autoRefresh = false;
    const hook = revalidateHook.call(mockBaseClient);
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
    expect(logger?.info).toHaveBeenCalledWith(
      addShortId("Session expired (revalidateHook)", mockSessionId),
    );
    app.stop();
    mockBaseClient.authHookSettings.autoRefresh = true;
  });

  test("Succeeded", async () => {
    const hook = revalidateHook.call(mockBaseClient);
    let result: any;
    const app = new Elysia()
      .guard((app) =>
        app.use(hook).get("/", ({ session }) => {
          console.log();
          result = session;
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
    const hook = revalidateHook.call(mockBaseClient);
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
      addShortId("Auto refresh failed (revalidateHook)", mockSessionId),
    );
  });

  test("Refresh failed", async () => {
    const hook = revalidateHook.call(mockBaseClient);
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
    expect(logger?.warn).toHaveBeenCalledWith(
      addShortId("Throw exception (revalidateHook)", mockSessionId),
    );
  });

  test("Refresh failed (Unknown error)", async () => {
    const hook = revalidateHook.call(mockBaseClient);
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
    expect(logger?.warn).toHaveBeenCalledWith(
      addShortId("Throw exception (revalidateHook)", mockSessionId),
    );
  });
});
