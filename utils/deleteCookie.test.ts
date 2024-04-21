import { describe, expect, mock, test } from "bun:test";
import { type DeepPartial, baseMockClient, mockCookie } from "@/__test__/const";
import type { OidcClient } from "@/core/OidcClient";
import { defaultCookieSettings } from "@/core/const";
import { deleteCookie } from "./deleteCookie";

describe("Unit/utils/deleteCookie", () => {
  test("Default", () => {
    const ms = {
      ...baseMockClient,
      logger: {
        trace: mock(),
        debug: mock(),
      },
    } as DeepPartial<OidcClient> as OidcClient;

    deleteCookie(ms, mockCookie);

    expect(ms.logger?.trace).toHaveBeenCalled();
    expect(ms.logger?.debug).toHaveBeenCalled();
    expect(
      mockCookie[defaultCookieSettings.sessionIdName].update,
    ).toHaveBeenCalled();
  });
});
