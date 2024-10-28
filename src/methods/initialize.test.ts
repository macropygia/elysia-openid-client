import { afterAll, describe, expect, test } from "bun:test";
import { BaseOidcClient } from "@/core/BaseOidcClient";
import { mockBaseOptions, mockOrigin } from "@/mock/const";
import { getRandomPort } from "@/mock/getRandomPort";
import { mockProvider } from "@/mock/mockProvider";
import { initialize } from "./initialize.ts";

describe("Unit/methods/initialize", async () => {
  const opPort = getRandomPort();

  const op = await mockProvider(opPort);

  test("Default", async () => {
    const mockOptions = structuredClone(mockBaseOptions);
    const mockClinet = await BaseOidcClient.factory({
      ...mockOptions,
      issuerUrl: `${mockOrigin}:${opPort}`,
    });
    expect(initialize.call(mockClinet)).resolves.toBeUndefined();
    expect(mockClinet.issuer).toMatchSnapshot("issuer");
    // expect(mockClinet.issuerMetadata).toMatchSnapshot("issuerMetadata");
    expect(mockClinet.client).toMatchSnapshot("client");
    expect(mockClinet.clients[`${mockOrigin}:${opPort}`]).toMatchSnapshot(
      "clients",
    );
    expect(mockClinet.initialized).toBeTrue();
  });

  afterAll(async () => {
    await op.stop();
  });
});
