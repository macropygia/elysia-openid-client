import { describe, expect, mock, test } from "bun:test";
import {
  type DeepPartial,
  baseMockClient,
  logger,
  mockActiveSession,
  mockAuthSession,
  mockClaims,
  mockStatus,
  rpPort,
} from "@/__test__/const";
import type { OidcClient } from "@/core/OidcClient";
import type { OIDCClientActiveSession, OIDCClientOptions } from "@/types";
import Elysia from "elysia";
import { getAuthHook } from "./getAuthHook";

describe("Unit/endpoints/getAuthHook", () => {
  const mockClient = mock(
    (session: Partial<OIDCClientActiveSession> | null) =>
      ({
        ...baseMockClient,
        fetchSession: mock().mockReturnValue(session || null),
        client: {
          refresh: mock().mockReturnValue({
            expired: mock().mockReturnValue(false),
          }),
        },
        logger,
      }) as DeepPartial<OIDCClientOptions> as OidcClient,
  );

  test("Succeeded", async () => {
    const plugin = getAuthHook.bind(mockClient(mockActiveSession))();
    const app = new Elysia()
      .guard((app) =>
        app
          .use(plugin)
          .get("/case1", ({ sessionClaims }) => sessionClaims)
          .get("/case2", ({ sessionStatus }) => sessionStatus),
      )
      .listen(rpPort);

    const case1 = await app.handle(
      new Request(`http://localhost:${rpPort}/case1`),
    );
    expect(case1.status).toBe(200);
    expect(await case1.json()).toMatchObject(mockClaims);

    const case2 = await app.handle(
      new Request(`http://localhost:${rpPort}/case2`),
    );
    expect(case2.status).toBe(200);
    expect(await case2.json()).toMatchObject(mockStatus);
    app.stop();
  });

  test("Skipped", async () => {
    const plugin = getAuthHook.bind(mockClient(null))();
    const app = new Elysia()
      .guard((app) => app.use(plugin).post("/", () => "home"))
      .listen(rpPort);

    const result = await app.handle(
      new Request(`http://localhost:${rpPort}/`, { method: "POST" }),
    );
    expect(result.status).toBe(200);
    app.stop();
  });

  test("Failed (session missing)", async () => {
    const plugin = getAuthHook.bind(mockClient(null))();
    const app = new Elysia()
      .guard((app) => app.use(plugin).get("/", () => "home"))
      .listen(rpPort);

    const res = await app.handle(new Request(`http://localhost:${rpPort}/`));
    expect(res.status).toBe(303);
    app.stop();
  });

  test("Failed (token missing)", async () => {
    const mc = mockClient(mockAuthSession);
    mc.getClaims = mock().mockReturnValue({
      ...mockClaims,
      exp: 100,
    });
    const plugin = getAuthHook.bind(mc)();
    const app = new Elysia()
      .guard((app) => app.use(plugin).get("/", () => "home"))
      .listen(rpPort);

    const res = await app.handle(new Request(`http://localhost:${rpPort}/`));
    expect(res.status).toBe(303);
    app.stop();
  });

  test("Failed (expired, no-refresh)", async () => {
    const mc = mockClient(mockActiveSession);
    mc.getClaims = mock().mockReturnValue({
      ...mockClaims,
      exp: 100,
    });
    const plugin = getAuthHook.bind(mc)({
      autoRefresh: false,
    });
    const app = new Elysia()
      .guard((app) => app.use(plugin).get("/", () => "home"))
      .listen(rpPort);

    const res = await app.handle(new Request(`http://localhost:${rpPort}/`));
    expect(res.status).toBe(303);
    app.stop();
  });

  test("Succeeded (refresh)", async () => {
    const mc = mockClient(mockActiveSession);
    mc.getClaims = mock().mockReturnValue({
      ...mockClaims,
      exp: 100,
    });
    const plugin = getAuthHook.bind(mc)();
    const app = new Elysia()
      .guard((app) => app.use(plugin).get("/", () => "home"))
      .listen(rpPort);

    const res = await app.handle(new Request(`http://localhost:${rpPort}/`));
    expect(res.status).toBe(200);
    app.stop();
  });

  test("Failed (refresh)", async () => {
    const mc = mockClient(mockActiveSession);
    mc.updateSession = mock().mockReturnValue(null);
    mc.getClaims = mock().mockReturnValue({
      ...mockClaims,
      exp: 100,
    });
    const plugin = getAuthHook.bind(mc)();
    const app = new Elysia()
      .guard((app) => app.use(plugin).get("/", () => "home"))
      .listen(rpPort);

    const res = await app.handle(new Request(`http://localhost:${rpPort}/`));
    expect(res.status).toBe(303);
    app.stop();
  });

  test("Failed (throw)", async () => {
    const mc = mockClient(mockActiveSession);
    mc.updateSession = mock().mockImplementation(() => {
      throw "Unknown Error";
    });
    mc.getClaims = mock().mockReturnValue({
      ...mockClaims,
      exp: 100,
    });
    const plugin = getAuthHook.bind(mc)();
    const app = new Elysia()
      .guard((app) => app.use(plugin).get("/", () => "home"))
      .listen(rpPort);

    const res = await app.handle(new Request(`http://localhost:${rpPort}/`));
    expect(res.status).toBe(500);
    app.stop();
  });
});
