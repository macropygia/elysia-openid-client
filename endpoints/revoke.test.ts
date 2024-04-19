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
import { revoke } from "./revoke";

describe("Unit/endpoints/revoke", () => {
  const plugin = revoke;
  const responseBody = { type: "revoke" };
  const path = defaultSettings.revokePath;
  const mockClient = mock(
    (session: Partial<OIDCClientActiveSession> | null) =>
      ({
        ...baseMockClient,
        fetchSession: mock().mockReturnValue(session || null),
        client: {
          revoke: mock().mockResolvedValue(responseBody),
        },
        logger,
      }) as DeepPartial<OidcClient> as OidcClient,
  );

  test("Succeeded", async () => {
    const app = new Elysia().use(
      plugin.call(mockClient({ sessionId: "mock-sid" })),
    );

    const response = await app.handle(
      new Request(`http://localhost${path}`, getInit),
    );
    expect(response.status).toBe(204);
  });

  test("Failed", async () => {
    const app = new Elysia().use(plugin.call(mockClient(null)));

    const response = await app.handle(
      new Request(`http://localhost${path}`, getInit),
    );
    expect(response.status).toBe(401);
  });
});
