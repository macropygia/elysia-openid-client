import { afterAll, describe, expect, test } from "bun:test";
import { mockBaseOptions, opPort, rpPort } from "@/__mock__/const";
import { mockIssuerMetadata } from "@/__mock__/issuerMetadata";
import Elysia from "elysia";
import OidcClient from "..";

describe("Unit/methods/getEndpoints", async () => {
  const op = new Elysia()
    .get("/.well-known/openid-configuration", ({ set }) => {
      set.headers["Content-Type"] = "application/json";
      return mockIssuerMetadata;
    })
    .listen(opPort);
  const rp = await OidcClient.create({
    ...mockBaseOptions,
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

  afterAll(() => {
    app.stop();
    op.stop();
  });
});
