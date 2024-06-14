import { beforeEach, describe, expect, test } from "bun:test";
import { defaultSettings } from "@/const";
import type {} from "@/types";
import { sessionToStatus } from "@/utils/sessionToStatus";
import {
  mockActiveSessionWithRealIdToken,
  mockBaseClient,
  mockPostInit,
  mockResetRecursively,
} from "@mock/const";
import { Elysia } from "elysia";
import { statusEndpoint } from "./statusEndpoint";

describe("Unit/endpoints/statusEndpoint", () => {
  const endpoint = statusEndpoint;
  const path = defaultSettings.statusPath;
  const { logger } = mockBaseClient;

  beforeEach(() => {
    mockResetRecursively(mockBaseClient);
  });

  test("Succeeded", async () => {
    const app = new Elysia()
      .resolve(() => ({ session: mockActiveSessionWithRealIdToken }))
      .use(endpoint.call(mockBaseClient));

    const response = await app
      .handle(new Request(`http://localhost${path}`, mockPostInit()))
      .then((res) => res);

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject(
      sessionToStatus(mockActiveSessionWithRealIdToken),
    );
  });

  test("Session data does not exist", async () => {
    const app = new Elysia()
      .resolve(() => ({ session: null }))
      .use(endpoint.call(mockBaseClient));
    const response = await app
      .handle(new Request(`http://localhost${path}`, mockPostInit()))
      .then((res) => res.status);

    expect(response).toBe(401);
    expect(logger?.warn).toHaveBeenCalledWith("Session data does not exist");
  });
});
