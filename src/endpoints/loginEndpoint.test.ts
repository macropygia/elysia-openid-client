import { beforeEach, describe, expect, mock, test } from "bun:test";
import { defaultSettings } from "@/const";
import {
  mockBaseClient,
  mockResetRecursively,
  mockSessionId,
  opPort,
} from "@/mock/const";
import Elysia from "elysia";
import setCookie from "set-cookie-parser";
import { loginEndpoint } from "./loginEndpoint.ts";

describe("Unit/endpoints/loginEndpoint", () => {
  const endpoint = loginEndpoint;
  const path = defaultSettings.loginPath;
  const { logger } = mockBaseClient;

  beforeEach(() => {
    mockResetRecursively(mockBaseClient);
    mockBaseClient.createSession = mock().mockReturnValue([
      mockSessionId,
      `http://localhost:${opPort}/authorization`,
    ]);
  });

  test("Succeeded", async () => {
    const app = new Elysia().use(endpoint.call(mockBaseClient));

    const response = await app.handle(new Request(`http://localhost${path}`));

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(
      `http://localhost:${opPort}/authorization`,
    );

    const cookie = setCookie.parse(
      response.headers.get("set-cookie") as string,
    )[0];
    expect(cookie.name).toBe("__Host-sid");
    expect(cookie.value).toBe(mockSessionId);
    expect(cookie.path).toBe("/");
    expect((cookie.expires as Date) > new Date()).toBeTruthy();
    expect(cookie.httpOnly).toBe(true);
    expect(cookie.secure).toBeFalsy();
    expect(
      typeof cookie.sameSite === "string"
        ? cookie.sameSite.toLowerCase()
        : cookie.sameSite,
    ).toBe("lax");
  });

  test("Failed", async () => {
    mockBaseClient.createSession = mock().mockImplementation(() => {
      throw new Error("Error");
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
