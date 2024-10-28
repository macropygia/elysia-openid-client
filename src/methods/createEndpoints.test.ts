import { afterAll, describe, expect, test } from "bun:test";
import { OidcClient } from "@/core/OidcClient";
import { mockBaseOptions } from "@/mock/const";
import { getRandomPort } from "@/mock/getRandomPort";
import { mockIssuerMetadata } from "@/mock/issuerMetadata";
import Elysia from "elysia";

describe("Unit/methods/createEndpoints", async () => {
  const opPort = getRandomPort();
  const rpPort = getRandomPort();

  const op = new Elysia()
    .get("/.well-known/openid-configuration", ({ set }) => {
      set.headers["Content-Type"] = "application/json";
      return mockIssuerMetadata(rpPort);
    })
    .listen(opPort);

  const mockOptions = structuredClone(mockBaseOptions);
  const rp = await OidcClient.factory({
    ...mockOptions,
    baseUrl: `http://localhost:${rpPort}`,
    issuerUrl: `http://localhost:${opPort}`,
    logger: null,
  });
  const endpoints = rp.endpoints;
  const paths = rp.paths;

  const app = new Elysia().use(endpoints).listen(rpPort);

  test.each(Object.values(paths))("Default", async (path) => {
    const res = await app.handle(
      new Request(`http://localhost:${rpPort}${path}`),
    );
    console.log(path, res.status);
    if (path === paths.login) {
      expect(res.status).toBe(303);
    } else {
      expect(res.status).toBe(401);
    }
  });

  afterAll(async () => {
    await app.stop();
    await op.stop();
  });
});
