import { beforeEach, describe, expect, mock, test } from "bun:test";
import { defaultSettings } from "@/const";
import {
  mockActiveSession,
  mockBaseClient,
  mockOrigin,
  mockResetRecursively,
} from "@/mock/const";
import Elysia from "elysia";
import { logoutEndpoint } from "./logoutEndpoint.ts";

describe("Unit/endpoints/logoutEndpoint", () => {
  const endpoint = logoutEndpoint;
  const path = defaultSettings.logoutPath;
  const redirectPath = "/path/to/logout";
  const { logger } = mockBaseClient;

  beforeEach(() => {
    mockResetRecursively(mockBaseClient);
    mockBaseClient.client.endSessionUrl = mock().mockReturnValue(redirectPath);
    mockBaseClient.fetchSession = mock().mockReturnValue(mockActiveSession);
  });

  test("Succeeded", async () => {
    const app = new Elysia().use(endpoint.call(mockBaseClient));
    const response = await app.handle(new Request(`${mockOrigin}${path}`));

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(redirectPath);
  });

  test("Session missing", async () => {
    mockBaseClient.fetchSession = mock().mockReturnValue(null);

    const app = new Elysia().use(endpoint.call(mockBaseClient));
    const response = await app.handle(new Request(`${mockOrigin}${path}`));

    expect(response.status).toBe(401);
    expect(logger?.warn).toHaveBeenCalledTimes(1);
  });

  test("Unknown error", async () => {
    mockBaseClient.fetchSession = mock().mockReturnValue(mockActiveSession);
    mockBaseClient.deleteSession = mock().mockImplementation(() => {
      throw "Unknown error";
    });

    const app = new Elysia().use(endpoint.call(mockBaseClient));
    const response = await app.handle(new Request(`${mockOrigin}${path}`));

    expect(response.status).toBe(500);
    expect(logger?.warn).toHaveBeenCalledTimes(1);
  });
});
