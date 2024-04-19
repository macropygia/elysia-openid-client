import { describe, expect, mock, test } from "bun:test";
import {
  type DeepPartial,
  baseMockClient,
  getInit,
  logger,
} from "@/__test__/const";
import type { OidcClient } from "@/core/OidcClient";
import { defaultSettings } from "@/core/const";
import type { OIDCClientActiveSession } from "@/types";
import Elysia from "elysia";
import { userinfo } from "./userinfo";

describe("Unit/endpoints/userinfo", () => {
  const endpoints = userinfo;
  const responseBody = { type: "userinfo" };
  const path = defaultSettings.userinfoPath;
  const mockClient = mock(
    (session: Partial<OIDCClientActiveSession> | null) =>
      ({
        ...baseMockClient,
        fetchSession: mock().mockReturnValue(session || null),
        client: {
          userinfo: mock().mockResolvedValue(responseBody),
        },
        logger,
      }) as DeepPartial<OidcClient> as OidcClient,
  );

  test("Succeeded", async () => {
    const app = new Elysia().use(
      endpoints.call(mockClient({ sessionId: "mock-sid" })),
    );

    const response = await app.handle(
      new Request(`http://localhost${path}`, getInit),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/json");
    expect(await response.json()).toMatchObject(responseBody);
  });

  test("Failed", async () => {
    const app = new Elysia().use(endpoints.call(mockClient(null)));

    const response = await app.handle(
      new Request(`http://localhost${path}`, getInit),
    );
    expect(response.status).toBe(401);
  });
});
