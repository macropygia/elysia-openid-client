import { describe, expect, test } from "bun:test";
import {
  baseMockClient,
  mockActiveSession,
  mockCookie,
} from "@/__test__/const";
import { defaultCookieSettings } from "@/core/const";
import { handleErrorResponse } from "./handleErrorResponse";

describe("Unit/utils/handleErrorResponse", () => {
  test("Session does not exist", () => {
    expect(
      handleErrorResponse(new Error(), null, baseMockClient, mockCookie).status,
    ).toBe(401);
    expect(baseMockClient.deleteSession).not.toHaveBeenCalled();
    expect(
      mockCookie[defaultCookieSettings.sessionIdName].update,
    ).toHaveBeenCalled();
  });

  test("Session exists and delete", () => {
    expect(
      handleErrorResponse(
        new Error(),
        mockActiveSession,
        baseMockClient,
        mockCookie,
      ).status,
    ).toBe(401);
    expect(baseMockClient.deleteSession).toHaveBeenCalled();
    expect(
      mockCookie[defaultCookieSettings.sessionIdName].update,
    ).toHaveBeenCalled();
  });

  test("Unknown Error", () => {
    expect(
      handleErrorResponse(
        "Unknown Error",
        mockActiveSession,
        baseMockClient,
        mockCookie,
      ).status,
    ).toBe(500);
  });
});
