import { describe, expect, mock, test } from "bun:test";
import {
  type DeepPartial,
  logger,
  mockBaseClient,
  mockGetInit,
} from "@/__mock__/const";
import type { OidcClient } from "@/core/OidcClient";
import { defaultSettings } from "@/core/const";
import type { OIDCClientActiveSession } from "@/types";
import Elysia from "elysia";
import { introspect } from "./introspect";

describe("Unit/endpoints/introspect", () => {
  const endpoints = introspect;
  const responseBody = { type: "introspect" };
  const path = defaultSettings.introspectPath;
  const mockClient = mock(
    (session: Partial<OIDCClientActiveSession> | null) =>
      ({
        ...mockBaseClient,
        fetchSession: mock().mockReturnValue(session || null),
        client: {
          introspect: mock().mockResolvedValue(responseBody),
        },
        logger,
      }) as DeepPartial<OidcClient> as OidcClient,
  );

  test("Succeeded", async () => {
    const app = new Elysia().use(
      endpoints.call(mockClient({ sessionId: "mock-sid" })),
    );

    const response = await app.handle(
      new Request(`http://localhost${path}`, mockGetInit()),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/json");
    expect(await response.json()).toMatchObject(responseBody);
  });

  test("Failed", async () => {
    const app = new Elysia().use(endpoints.call(mockClient(null)));

    const response = await app.handle(
      new Request(`http://localhost${path}`, mockGetInit()),
    );
    expect(response.status).toBe(401);
  });
});
