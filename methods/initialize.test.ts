import { afterAll, describe, expect, test } from "bun:test";
import { mockBaseOptions, opPort } from "@/__mock__/const";
import { mockProvider } from "@/__mock__/mockProvider";
import { BaseOidcClient } from "@/core/BaseOidcClient";
import { initialize } from "./initialize";

describe("Unit/methods/initialize", async () => {
  const op = await mockProvider(opPort);

  afterAll(() => {
    op.stop();
  });

  test("Default", async () => {
    const mockClinet = await BaseOidcClient.create({
      ...mockBaseOptions,
      issuerUrl: `http://localhost:${opPort}`,
    });
    expect(initialize.call(mockClinet)).resolves.toBeUndefined();
    expect(mockClinet.issuer).toMatchSnapshot("issuer");
    expect(mockClinet.issuerMetadata).toMatchSnapshot("issuerMetadata");
    expect(mockClinet.client).toMatchSnapshot("client");
    expect(mockClinet.initialized).toBeTrue();
  });
});
