import { afterAll, describe, expect, test } from "bun:test";
import { mockBaseOptions } from "@/__mock__/const";
import { getRandomPort } from "@/__mock__/getRandomPort";
import { mockIssuerMetadata } from "@/__mock__/issuerMetadata";
import { OidcClient } from "@/core/OidcClient";
import Elysia from "elysia";

describe("Unit/methods/getEndpoints", async () => {
  const opPort = getRandomPort();
  const rpPort = getRandomPort();

  const op = new Elysia()
    .get("/.well-known/openid-configuration", ({ set }) => {
      set.headers["Content-Type"] = "application/json";
      return mockIssuerMetadata(rpPort);
    })
    .listen(opPort);

  const mockOptions = structuredClone(mockBaseOptions);
  const rp = await OidcClient.create({
    ...mockOptions,
    baseUrl: `http://localhost:${rpPort}`,
    issuerUrl: `http://localhost:${opPort}`,
    logger: null,
  });
  const endpoints = rp.getEndpoints();
  const paths = rp.getPaths();

  const app = new Elysia().use(endpoints).listen(rpPort);

  test.each(Object.values(paths))("Default", async (path) => {
    const res = await app.handle(
      new Request(`http://localhost:${rpPort}${path}`),
    );
    console.log(path, res.status);
    if (path === paths.login) {
      expect(res.status).toBe(303);
    } else if (path === paths.resource) {
      expect(res.status).toBe(400);
    } else {
      expect(res.status).toBe(401);
    }
  });

  afterAll(async () => {
    await app.stop();
    await op.stop();
  });
});
