import { beforeEach, describe, expect, mock, test } from "bun:test";
import { defaultSettings } from "@/const";
import {
  mockActiveSessionWithRealIdToken,
  mockBaseClient,
  mockIdTokenClaims,
  mockOrigin,
  mockPostInit,
  mockResetRecursively,
} from "@/mock/const";
import type {} from "@/types";
import { Elysia } from "elysia";
import { claimsEndpoint } from "./claimsEndpoint.ts";

describe("Unit/endpoints/claimsEndpoint", () => {
  const endpoint = claimsEndpoint;
  const path = defaultSettings.claimsPath;
  const { logger } = mockBaseClient;

  beforeEach(() => {
    mockResetRecursively(mockBaseClient);
  });

  test("Succeeded", async () => {
    const app = new Elysia()
      .resolve(() => ({ session: mockActiveSessionWithRealIdToken }))
      .use(endpoint.call(mockBaseClient));
    const response = await app
      .handle(new Request(`${mockOrigin}${path}`, mockPostInit()))
      .then((res) => res);

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject(mockIdTokenClaims);
  });

  test("Session data does not exist", async () => {
    mockBaseClient.fetchSession = mock().mockReturnValue(null);

    const app = new Elysia()
      .resolve(() => ({ session: null }))
      .use(endpoint.call(mockBaseClient));
    const response = await app
      .handle(new Request(`${mockOrigin}${path}`, mockPostInit()))
      .then((res) => res.status);

    expect(response).toBe(401);
    expect(logger?.warn).toHaveBeenCalledWith("Session data does not exist");
  });
});
