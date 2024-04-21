import { beforeEach, describe, expect, mock, test } from "bun:test";
import {
  mockActiveSession,
  mockBaseClient,
  mockLoginSession,
  mockResetRecursively,
  rpPort,
} from "@/__mock__/const";
import { defaultSettings } from "@/core/const";
import Elysia from "elysia";
import { callback } from "./callback";

describe("Unit/endpoints/callback", () => {
  const endpoint = callback;
  const responseBody = {
    expired: mock().mockReturnValue(false),
  };
  const path = defaultSettings.callbackPath;
  const { logger } = mockBaseClient;

  beforeEach(() => {
    mockResetRecursively(mockBaseClient);
    mockBaseClient.fetchSession = mock().mockReturnValue(mockLoginSession);
    mockBaseClient.updateSession = mock().mockReturnValue(mockActiveSession);
    mockBaseClient.client.callback = mock().mockReturnValue(responseBody);
    mockBaseClient.client.callbackParams = mock().mockReturnValue("params");
  });

  test("Succeeded", async () => {
    const app = new Elysia().use(endpoint.call(mockBaseClient));
    const response = await app.handle(new Request(`http://localhost${path}`));

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe(
      `http://localhost:${rpPort}${defaultSettings.callbackCompletedPath}`,
    );
  });

  test("Session does not exist", async () => {
    mockBaseClient.fetchSession = mock().mockReturnValue(null);

    const app = new Elysia().use(endpoint.call(mockBaseClient));
    const response = await app.handle(new Request(`http://localhost${path}`));

    expect(response.status).toBe(401);
    expect(logger?.warn).toHaveBeenCalledTimes(1);
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
  ])("Hash generation failure", async (session) => {
    mockBaseClient.fetchSession = mock().mockReturnValue(session);

    const app = new Elysia().use(endpoint.call(mockBaseClient));
    const response = await app.handle(new Request(`http://localhost${path}`));

    expect(response.status).toBe(401);
    expect(logger?.warn).toHaveBeenCalledTimes(1);
  });

  test("Session update failed", async () => {
    mockBaseClient.updateSession = mock().mockReturnValue(null);

    const app = new Elysia().use(endpoint.call(mockBaseClient));
    const response = await app.handle(new Request(`http://localhost${path}`));

    expect(response.status).toBe(401);
    expect(logger?.warn).toHaveBeenCalledTimes(1);
  });

  test("Unknown error", async () => {
    mockBaseClient.client.callbackParams = mock().mockImplementation(() => {
      throw "Unknown error";
    });

    const app = new Elysia().use(endpoint.call(mockBaseClient));
    const response = await app.handle(new Request(`http://localhost${path}`));

    expect(response.status).toBe(500);
    expect(logger?.warn).toHaveBeenCalledTimes(1);
  });
});
