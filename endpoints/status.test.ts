import { beforeEach, describe, expect, mock, test } from "bun:test";
import {
  mockActiveSessionWithRealIdToken,
  mockBaseClient,
  mockPostInit,
  mockResetRecursively,
} from "@/__mock__/const";
import { defaultSettings } from "@/core/const";
import type {} from "@/types";
import { sessionToStatus } from "@/utils/sessionToStatus";
import { Elysia } from "elysia";
import { status } from "./status";

describe("Unit/endpoints/status", () => {
  const endpoint = status;
  const path = defaultSettings.statusPath;
  const { logger } = mockBaseClient;

  beforeEach(() => {
    mockResetRecursively(mockBaseClient);
    mockBaseClient.fetchSession = mock().mockReturnValue(
      mockActiveSessionWithRealIdToken,
    );
  });

  test("Succeeded", async () => {
    const app = new Elysia().use(endpoint.call(mockBaseClient));

    const response = await app
      .handle(new Request(`http://localhost${path}`, mockPostInit()))
      .then((res) => res);

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject(
      sessionToStatus(mockActiveSessionWithRealIdToken),
    );
  });

  test("Session does not exist", async () => {
    mockBaseClient.fetchSession = mock().mockReturnValue(null);

    const app = new Elysia().use(endpoint.call(mockBaseClient));
    const response = await app
      .handle(new Request(`http://localhost${path}`, mockPostInit()))
      .then((res) => res.status);

    expect(response).toBe(401);
    expect(logger?.warn).toHaveBeenCalledTimes(1);
  });

  test("Exception", async () => {
    mockBaseClient.fetchSession = () => {
      throw "Unknown Error";
    };

    const app = new Elysia().use(endpoint.call(mockBaseClient));
    const response = await app
      .handle(new Request(`http://localhost${path}`, mockPostInit()))
      .then((res) => res.status);

    expect(response).toBe(500);
    expect(logger?.warn).not.toHaveBeenCalled();
  });
});
