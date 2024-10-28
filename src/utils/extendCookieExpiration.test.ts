import { describe, expect, mock, test } from "bun:test";
import type { OidcClient } from "@/core/OidcClient";
import { type DeepPartial, logger, mockSessionId } from "@/mock/const";
import type { Cookie } from "elysia";
import { extendCookieExpiration } from "./extendCookieExpiration.ts";

describe("Unit/utils/extendCookieExpiration", () => {
  test("Succeeded", () => {
    const ctx = {
      settings: { refreshExpiration: 3600000 },
      cookieSettings: {
        sessionIdName: "session_id",
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        expires: 3600000,
      },
      logger,
    } as DeepPartial<OidcClient> as OidcClient;

    const cookie = {
      session_id: {
        value: mockSessionId,
        update: mock(),
      },
    } as unknown as Record<string, Cookie<string | undefined>>;

    extendCookieExpiration(ctx, cookie);

    expect(cookie.session_id.update).toHaveBeenCalledWith({
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      expires: expect.any(Date),
    });
  });

  test("Skip", () => {
    const ctx = {
      settings: {},
      cookieSettings: {
        expires: 0,
      },
      logger: undefined,
    } as DeepPartial<OidcClient> as OidcClient;

    const cookie = {
      session_id: {
        update: mock(),
      },
    } as unknown as Record<string, Cookie<string | undefined>>;

    extendCookieExpiration(ctx, cookie);

    expect(cookie.session_id.update).not.toHaveBeenCalled();
  });
});
