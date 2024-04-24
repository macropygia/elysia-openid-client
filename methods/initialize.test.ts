import { afterAll, describe, expect, test } from "bun:test";
import { mockBaseOptions } from "@/__mock__/const";
import { getRandomPort } from "@/__mock__/getRandomPort";
import { mockProvider } from "@/__mock__/mockProvider";
import { BaseOidcClient } from "@/core/BaseOidcClient";
import { initialize } from "./initialize";

describe("Unit/methods/initialize", async () => {
  const opPort = getRandomPort();

  const op = await mockProvider(opPort);

  test("Default", async () => {
    const mockOptions = structuredClone(mockBaseOptions);
    const mockClinet = await BaseOidcClient.create({
      ...mockOptions,
      issuerUrl: `http://localhost:${opPort}`,
    });
    expect(initialize.call(mockClinet)).resolves.toBeUndefined();
    expect(mockClinet.issuer).toMatchSnapshot("issuer");
    // expect(mockClinet.issuerMetadata).toMatchSnapshot("issuerMetadata");
    expect(mockClinet.client).toMatchSnapshot("client");
    expect(mockClinet.initialized).toBeTrue();
  });

  afterAll(async () => {
    await op.stop();
  });
});
