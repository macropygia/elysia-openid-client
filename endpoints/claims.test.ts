import { beforeEach, describe, expect, mock, test } from "bun:test";
import {
  mockActiveSessionWithRealIdToken,
  mockBaseClient,
  mockIdTokenClaims,
  mockPostInit,
  mockResetRecursively,
} from "@/__mock__/const";
import { defaultSettings } from "@/core/const";
import type {} from "@/types";
import { Elysia } from "elysia";
import { claims } from "./claims";

describe("Unit/endpoints/claims", () => {
  const endpoint = claims;
  const path = defaultSettings.claimsPath;
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
    expect(await response.json()).toMatchObject(mockIdTokenClaims);
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
