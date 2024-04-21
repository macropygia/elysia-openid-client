import { describe, expect, mock, test } from "bun:test";
import { type DeepPartial, logger } from "@/__mock__/const";
import type { OidcClient } from "@/core/OidcClient";
import type { OIDCClientSession } from "@/types";
import loki from "lokijs";
import { createSession } from "./createSession";

describe("Unit/methods/createSession", () => {
  test("Default", async () => {
    const db = new loki("in-memory.db");
    const sessions = db.addCollection<OIDCClientSession>("sessions");
    const loginExpiration = 60 * 10 * 1000;

    const mockClient = {
      db,
      sessions,
      client: {
        authorizationUrl: mock().mockReturnValue("authorizationUrl"),
      },
      settings: {
        loginExpiration,
      },
      logger,
    } as DeepPartial<OidcClient> as OidcClient;

    const [sessionId, authorizationUrl] =
      await createSession.bind(mockClient)();
    expect(sessionId).toBeTypeOf("string");
    expect(sessionId.length).toBe(43);
    expect(authorizationUrl).toBe("authorizationUrl");

    const record = sessions.findOne();
    expect(record?.sessionId === sessionId);
    expect(record?.sessionExpiresAt).toBeTypeOf("number");
    expect(record?.codeVerifier).toBeTypeOf("string");
    expect(record?.state).toBeTypeOf("string");
    expect(record?.nonce).toBeTypeOf("string");

    db.close();
  });
});
