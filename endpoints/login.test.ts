import { beforeEach, describe, expect, mock, test } from "bun:test";
import { mockBaseClient, mockResetRecursively, opPort } from "@/__mock__/const";
import { defaultSettings } from "@/core/const";
import Elysia from "elysia";
import setCookie from "set-cookie-parser";
import { login } from "./login";

describe("Unit/endpoints/login", () => {
  const endpoint = login;
  const path = defaultSettings.loginPath;
  const { logger } = mockBaseClient;

  beforeEach(() => {
    mockResetRecursively(mockBaseClient);
    mockBaseClient.createSession = mock().mockReturnValue([
      "mock-sid",
      `http://localhost:${opPort}/authorization`,
    ]);
  });

  test("Succeeded", async () => {
    const app = new Elysia().use(endpoint.call(mockBaseClient));

    const response = await app.handle(new Request(`http://localhost${path}`));

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(
      "http://localhost:57829/authorization",
    );

    const cookie = setCookie.parse(
      response.headers.get("set-cookie") as string,
    )[0];
    expect(cookie.name).toBe("__Host-sid");
    expect(cookie.value).toBe("mock-sid");
    expect(cookie.path).toBe("/");
    expect((cookie.expires as Date) > new Date()).toBeTruthy();
    expect(cookie.httpOnly).toBe(true);
    expect(cookie.secure).toBeFalsy();
    expect(cookie.sameSite?.toLowerCase()).toBe("lax");
  });

  test("Failed", async () => {
    mockBaseClient.createSession = mock().mockImplementation(() => {
      throw new Error();
    });

    const app = new Elysia().use(endpoint.call(mockBaseClient));
    const response = await app.handle(new Request(`http://localhost${path}`));

    expect(response.status).toBe(401);
    expect(logger?.warn).toHaveBeenCalledTimes(1);
  });

  test("Unknown Error", async () => {
    mockBaseClient.createSession = mock().mockImplementation(() => {
      throw "Unknown Error";
    });

    const app = new Elysia().use(endpoint.call(mockBaseClient));
    const response = await app.handle(new Request(`http://localhost${path}`));

    expect(response.status).toBe(500);
    expect(logger?.warn).toHaveBeenCalledTimes(1);
  });
});
