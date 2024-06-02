import { beforeEach, describe, expect, mock, test } from "bun:test";
import { defaultSettings } from "@/const";
import {
  mockActiveSession,
  mockBaseClient,
  mockGetInit,
  mockResetRecursively,
} from "@mock/const";
import Elysia from "elysia";
import { introspect } from "./introspect";

describe("Unit/endpoints/introspect", () => {
  const endpoint = introspect;
  const responseBody = { type: "introspect" };
  const path = defaultSettings.introspectPath;
  const { logger } = mockBaseClient;

  beforeEach(() => {
    mockResetRecursively(mockBaseClient);
    mockBaseClient.client.introspect = mock().mockResolvedValue(responseBody);
  });

  test("Succeeded", async () => {
    const app = new Elysia()
      .resolve(() => ({ sessionData: mockActiveSession }))
      .use(endpoint.call(mockBaseClient));
    const response = await app.handle(
      new Request(`http://localhost${path}`, mockGetInit()),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/json");
    expect(await response.json()).toMatchObject(responseBody);
    expect(mockBaseClient.client.introspect).toHaveBeenCalledTimes(1);
  });

  test("Session missing", async () => {
    const app = new Elysia()
      .resolve(() => ({ sessionData: null }))
      .use(endpoint.call(mockBaseClient));
    const response = await app.handle(
      new Request(`http://localhost${path}`, mockGetInit()),
    );

    expect(response.status).toBe(401);
    expect(mockBaseClient.client.introspect).not.toHaveBeenCalled();
    expect(logger?.warn).toHaveBeenCalledWith(
      "endpoints/introspect: Throw exception",
    );
  });

  test("Exception", async () => {
    mockBaseClient.client.introspect = () => {
      throw "Unknown Error";
    };

    const app = new Elysia()
      .resolve(() => ({ sessionData: mockActiveSession }))
      .use(endpoint.call(mockBaseClient));
    const response = await app
      .handle(new Request(`http://localhost${path}`))
      .then((res) => res.status);

    expect(response).toBe(500);
    expect(logger?.warn).toHaveBeenCalledWith(
      "endpoints/introspect: Throw exception",
    );
  });
});
