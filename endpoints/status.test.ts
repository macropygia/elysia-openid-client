import { describe, expect, it, mock } from "bun:test";
import {
  type DeepPartial,
  baseMockClient,
  logger,
  mockActiveSession,
  mockStatus,
  postInit,
} from "@/__test__/const";
import type { OidcClient } from "@/core/OidcClient";
import { defaultSettings } from "@/core/const";
import type { OIDCClientActiveSession, OIDCClientSessionStatus } from "@/types";
import { Elysia } from "elysia";
import { status } from "./status";

describe("Unit/endpoints/status", () => {
  const plugin = status;
  const path = defaultSettings.statusPath;
  const mockClient = mock(
    (
      session: OIDCClientActiveSession | null,
      status: OIDCClientSessionStatus | null,
    ) =>
      ({
        ...baseMockClient,
        fetchSession: mock().mockReturnValue(session),
        sessionToStatus: mock().mockReturnValue(status),
        logger,
      }) as DeepPartial<OidcClient> as OidcClient,
  );

  it("Succeeded", async () => {
    const app = new Elysia().use(
      plugin.call(mockClient(mockActiveSession, mockStatus)),
    );

    const response = await app
      .handle(new Request(`http://localhost${path}`, postInit))
      .then((res) => res.json());

    expect(response).toMatchObject(mockStatus);
  });

  it("Session does not exist", async () => {
    const app = new Elysia().use(plugin.call(mockClient(null, null)));

    const response = await app
      .handle(new Request(`http://localhost${path}`, postInit))
      .then((res) => res.status);

    expect(response).toBe(401);
  });
});
