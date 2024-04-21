import { describe, expect, mock, test } from "bun:test";
import {
  type DeepPartial,
  logger,
  mockBaseClient,
  mockLoginSession,
  rpPort,
} from "@/__mock__/const";
import type { OidcClient } from "@/core/OidcClient";
import { defaultSettings } from "@/core/const";
import type { OIDCClientActiveSession } from "@/types";
import Elysia from "elysia";
import { callback } from "./callback";

describe("Unit/endpoints/callback", () => {
  const endpoints = callback;
  const responseBody = {
    expired: mock().mockReturnValue(false),
  };
  const path = defaultSettings.callbackPath;
  const mockClient = mock(
    (session: Partial<OIDCClientActiveSession> | null) =>
      ({
        ...mockBaseClient,
        fetchSession: mock().mockReturnValue(session || null),
        client: {
          callback: mock().mockResolvedValue(responseBody),
          callbackParams: mock().mockReturnValue("params"),
        },
        authParams: {
          redirect_url: "mock-redirect-uri",
        },
        logger,
      }) as DeepPartial<OidcClient> as OidcClient,
  );

  test("Succeeded", async () => {
    const app = new Elysia().use(endpoints.call(mockClient(mockLoginSession)));

    const response = await app.handle(new Request(`http://localhost${path}`));
    logger?.info(response);
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe(
      `http://localhost:${rpPort}${defaultSettings.callbackCompletedPath}`,
    );
  });

  test("Session data missing", async () => {
    const app = new Elysia().use(endpoints.call(mockClient(null)));

    const response = await app.handle(new Request(`http://localhost${path}`));
    expect(response.status).toBe(401);
  });

  test.each([
    {
      sessionId: "mock-sid",
      state: "mock-state",
      nonce: "mock-nonce",
    },
    {
      sessionId: "mock-sid",
      codeVerifier: "mock-verifier",
      nonce: "mock-nonce",
    },
    {
      sessionId: "mock-sid",
      codeVerifier: "mock-verifier",
      state: "mock-state",
    },
  ])("`codeVerifier` hash missing", async (session) => {
    const app = new Elysia().use(endpoints.call(mockClient(session)));

    const response = await app.handle(new Request(`http://localhost${path}`));
    expect(response.status).toBe(401);
  });

  test("Update failed", async () => {
    const mc = mockClient(mockLoginSession);
    mc.updateSession = mock().mockReturnValue(null);
    const app = new Elysia().use(endpoints.call(mc));

    const response = await app.handle(new Request(`http://localhost${path}`));
    logger?.info(response);
    expect(response.status).toBe(401);
  });
});
