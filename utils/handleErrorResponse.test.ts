import { describe, expect, test } from "bun:test";
import {
  mockActiveSession,
  mockBaseClient,
  mockCookie,
} from "@/__mock__/const";
import { defaultCookieSettings } from "@/core/const";
import { handleErrorResponse } from "./handleErrorResponse";

describe("Unit/utils/handleErrorResponse", () => {
  test("Session does not exist", () => {
    expect(
      handleErrorResponse(new Error(), null, mockBaseClient, mockCookie).status,
    ).toBe(401);
    expect(mockBaseClient.deleteSession).not.toHaveBeenCalled();
    expect(
      mockCookie[defaultCookieSettings.sessionIdName].update,
    ).toHaveBeenCalled();
  });

  test("Session exists and delete", () => {
    expect(
      handleErrorResponse(
        new Error(),
        mockActiveSession,
        mockBaseClient,
        mockCookie,
      ).status,
    ).toBe(401);
    expect(mockBaseClient.deleteSession).toHaveBeenCalled();
    expect(
      mockCookie[defaultCookieSettings.sessionIdName].update,
    ).toHaveBeenCalled();
  });

  test("Unknown Error", () => {
    expect(
      handleErrorResponse(
        "Unknown Error",
        mockActiveSession,
        mockBaseClient,
        mockCookie,
      ).status,
    ).toBe(500);
  });
});
