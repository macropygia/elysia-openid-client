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
import { revoke } from "./revoke";

describe("Unit/endpoints/revoke", () => {
  const endpoint = revoke;
  const responseBody = { type: "revoke" };
  const path = defaultSettings.revokePath;
  const { logger } = mockBaseClient;

  beforeEach(() => {
    mockResetRecursively(mockBaseClient);
    mockBaseClient.fetchSession = mock().mockReturnValue(mockActiveSession);
    mockBaseClient.client.revoke = mock().mockResolvedValue(responseBody);
  });

  test("Succeeded", async () => {
    const app = new Elysia().use(endpoint.call(mockBaseClient));
    const response = await app.handle(
      new Request(`http://localhost${path}`, mockGetInit()),
    );

    expect(response.status).toBe(204);
    expect(mockBaseClient.client.revoke).toHaveBeenCalledTimes(1);
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
    expect(mockBaseClient.client.revoke).not.toHaveBeenCalled();
    expect(logger?.warn).toHaveBeenCalledTimes(1);
  });

  test("Exception", async () => {
    mockBaseClient.client.revoke = () => {
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
