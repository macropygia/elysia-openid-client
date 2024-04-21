import { afterAll, describe, expect, test } from "bun:test";
import { mockBaseOptions, opPort } from "@/__test__/const";
import { opMock } from "@/__test__/opMock";
import { BaseOidcClient } from "@/core/BaseOidcClient";
import { initialize } from "./initialize";

describe("Unit/methods/initialize", async () => {
  const op = await opMock(opPort);

  afterAll(() => {
    op.stop();
  });
  test("Default", async () => {
    const mockClinet = await BaseOidcClient.create({
      ...mockBaseOptions,
      issuerUrl: `http://localhost:${opPort}`,
    });
    expect(initialize.bind(mockClinet)()).resolves.toBeUndefined();
    expect(mockClinet.issuer).toMatchSnapshot("issuer");
    expect(mockClinet.issuerMetadata).toMatchSnapshot("issuerMetadata");
    expect(mockClinet.client).toMatchSnapshot("client");
    expect(mockClinet.initialized).toBeTrue();
  });
});
