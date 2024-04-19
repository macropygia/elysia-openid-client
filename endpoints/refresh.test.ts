import { describe, expect, mock, test } from "bun:test";
import {
  type DeepPartial,
  baseMockClient,
  getInit,
  logger,
} from "@/__test__/const";
import type { OidcClient } from "@/core/OidcClient";
import { defaultSettings } from "@/core/const";
import type { OIDCClientActiveSession } from "@/types";
import Elysia from "elysia";
import { refresh } from "./refresh";

describe("Unit/endpoints/refresh", () => {
  const endpoints = refresh;
  const responseBody = {
    id_token: "mock-id-token",
    access_token: "mock-access-token",
    expired: mock().mockReturnValue(false),
    claims: mock().mockReturnValue({ type: "refresh" }),
  };
  const path = defaultSettings.refreshPath;
  const mockClient = mock(
    (session: Partial<OIDCClientActiveSession> | null, newSession?: boolean) =>
      ({
        ...baseMockClient,
        fetchSession: mock().mockReturnValue(session || null),
        updateSession: mock().mockReturnValue(newSession),
        client: {
          refresh: mock().mockResolvedValue(responseBody),
        },
        logger,
      }) as DeepPartial<OidcClient> as OidcClient,
  );

  test("Succeeded", async () => {
    const session = {
      sessionId: "mock-sid",
      refreshToken: "mock-refresh-token",
    };
    const app = new Elysia().use(endpoints.call(mockClient(session, true)));

    const response = await app.handle(
      new Request(`http://localhost${path}`, getInit),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/json");
    expect(await response.json()).toMatchObject({ type: "refresh" });
  });

  test("Session missing", async () => {
    const app = new Elysia().use(endpoints.call(mockClient(null, true)));

    const response = await app.handle(
      new Request(`http://localhost${path}`, getInit),
    );
    expect(response.status).toBe(401);
  });

  test("Refresh token missing", async () => {
    const session = { sessionId: "mock-sid" };
    const app = new Elysia().use(endpoints.call(mockClient(session, true)));

    const response = await app.handle(
      new Request(`http://localhost${path}`, getInit),
    );
    expect(response.status).toBe(401);
  });

  test("Invalid tokenSet", async () => {
    const session = {
      sessionId: "mock-sid",
      refreshToken: "mock-refresh-token",
    };
    const app = new Elysia().use(endpoints.call(mockClient(session, false)));

    const response = await app.handle(
      new Request(`http://localhost${path}`, getInit),
    );
    expect(response.status).toBe(401);
  });
});
