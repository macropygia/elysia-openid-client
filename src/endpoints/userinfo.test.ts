import { beforeEach, describe, expect, mock, test } from "bun:test";
import { defaultSettings } from "@/const";
import {
  mockActiveSession,
  mockBaseClient,
  mockGetInit,
  mockResetRecursively,
} from "@mock/const";
import Elysia from "elysia";
import { userinfo } from "./userinfo";

describe("Unit/endpoints/userinfo", () => {
  const endpoint = userinfo;
  const responseBody = { type: "userinfo" };
  const path = defaultSettings.userinfoPath;
  const { logger } = mockBaseClient;

  beforeEach(() => {
    mockResetRecursively(mockBaseClient);
    mockBaseClient.client.userinfo = mock().mockResolvedValue(responseBody);
  });

  test("Succeeded", async () => {
    const app = new Elysia()
      .resolve(() => ({ sessionData: mockActiveSession }))
      .use(endpoint.call(mockBaseClient));
    const response = await app.handle(
      new Request(`http://localhost${path}`, mockGetInit()),
    );

    expect(mockBaseClient.client.userinfo).toHaveBeenCalledWith(
      "mock-access-token",
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/json");
    expect(await response.json()).toMatchObject(responseBody);
  });

  test("Session missing", async () => {
    const app = new Elysia()
      .resolve(() => ({ sessionData: null }))
      .use(endpoint.call(mockBaseClient));
    const response = await app.handle(
      new Request(`http://localhost${path}`, mockGetInit()),
    );

    expect(mockBaseClient.client.userinfo).not.toHaveBeenCalled();
    expect(response.status).toBe(401);
    expect(logger?.warn).toHaveBeenCalledWith(
      "endpoints/userinfo: Throw exception",
    );
  });

  test("Exception", async () => {
    mockBaseClient.client.userinfo = () => {
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
      "endpoints/userinfo: Throw exception",
    );
  });
});
