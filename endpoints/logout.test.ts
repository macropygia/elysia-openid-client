import { describe, expect, mock, test } from "bun:test";
import { type DeepPartial, baseMockClient, logger } from "@/__test__/const";
import type { OidcClient } from "@/core/OidcClient";
import type { OIDCClientActiveSession } from "@/types";
import Elysia from "elysia";
import { logout } from "./logout";

describe("Unit/endpoints/logout", () => {
  const redirectPath = "/path/to/logout";
  const mockClient = mock(
    (session: Partial<OIDCClientActiveSession> | null) =>
      ({
        ...baseMockClient,
        settings: {
          logoutPath: "/logout",
          logoutCompletedPath: "/home",
        },
        fetchSession: mock().mockReturnValue(session || null),
        client: {
          endSessionUrl: mock().mockReturnValue(redirectPath),
        },
        logger,
      }) as DeepPartial<OidcClient> as OidcClient,
  );

  test("Succeeded", async () => {
    const endpoints = logout.call(mockClient({ sessionId: "mock-sid" }));
    const app = new Elysia().use(endpoints);

    const response = await app.handle(new Request("http://localhost/logout"));
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(redirectPath);
  });

  test("Failed", async () => {
    const endpoints = logout.call(mockClient(null));
    const app = new Elysia().use(endpoints);

    const response = await app.handle(new Request("http://localhost/logout"));
    expect(response.status).toBe(401);
  });
});
