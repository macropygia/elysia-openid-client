import { beforeAll, describe, expect, mock, test } from "bun:test";
import { defaultCookieSettings } from "@/const";
import { mockBaseClient, mockCookie, mockResetRecursively } from "@/mock/const";
import type { Cookie } from "elysia";
import { deleteCookie } from "./deleteCookie.ts";

describe("Unit/utils/deleteCookie", () => {
  beforeAll(() => {
    mockResetRecursively(mockCookie);
  });

  test("Succeeded", () => {
    deleteCookie(mockBaseClient, mockCookie);

    expect(
      mockCookie[defaultCookieSettings.sessionIdName].update,
    ).toHaveBeenCalledTimes(1);
  });

  test("Value missing", () => {
    const cookie = {
      [mockBaseClient.cookieSettings.sessionIdName]: {
        value: undefined,
        update: mock(),
      },
    } as unknown as Record<string, Cookie<string | undefined>>;
    deleteCookie(mockBaseClient, cookie);

    expect(
      cookie[mockBaseClient.cookieSettings.sessionIdName].update,
    ).toHaveBeenCalledTimes(1);
  });
});
