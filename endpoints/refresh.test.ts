import { beforeEach, describe, expect, mock, test } from "bun:test";
import {
  mockActiveSession,
  mockBaseClient,
  mockGetInit,
  mockResetRecursively,
} from "@/__mock__/const";
import type { OidcClient } from "@/core/OidcClient";
import { defaultSettings } from "@/core/const";
import Elysia from "elysia";
import { refresh } from "./refresh";

describe("Unit/endpoints/refresh", () => {
  const endpoint = refresh;
  const responseBody = { type: "refresh" };
  const path = defaultSettings.refreshPath;
  const { logger } = mockBaseClient;

  beforeEach(() => {
    mockResetRecursively(mockBaseClient);
    mockBaseClient.fetchSession = mock().mockReturnValue(mockActiveSession);
    mockBaseClient.updateSession = mock().mockReturnValue(mockActiveSession);
    mockBaseClient.client.refresh = mock().mockResolvedValue({
      claims: () => responseBody,
    });
  });

  test("Succeeded", async () => {
    const app = new Elysia().use(endpoint.call(mockBaseClient));
    const response = await app.handle(
      new Request(`http://localhost${path}`, mockGetInit()),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/json");
    expect(await response.json()).toMatchObject(responseBody);
    expect(mockBaseClient.client.refresh).toHaveBeenCalledTimes(1);
  });

  test("Session missing", async () => {
    const app = new Elysia().use(
      endpoint.call({
        ...mockBaseClient,
        fetchSession: mock().mockReturnValue(null),
      } as unknown as OidcClient),
    );
    const response = await app.handle(
      new Request(`http://localhost${path}`, mockGetInit()),
    );

    expect(response.status).toBe(401);
    expect(mockBaseClient.client.refresh).not.toHaveBeenCalled();
    expect(logger?.warn).toHaveBeenCalledTimes(1);
  });

  test("Exception", async () => {
    mockBaseClient.client.refresh = () => {
      throw "Unknown Error";
    };

    const app = new Elysia().use(endpoint.call(mockBaseClient));
    const response = await app
      .handle(new Request(`http://localhost${path}`))
      .then((res) => res.status);

    expect(response).toBe(500);
    expect(logger?.warn).toHaveBeenCalledTimes(1);
  });
});
