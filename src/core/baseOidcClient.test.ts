import { afterAll, describe, expect, test } from "bun:test";
import { defaultCookieSettings, defaultSettings } from "@/const";
import { mockBaseOptions, opPort } from "@/mock/const";
import { mockProvider } from "@/mock/mockProvider";
import { BaseOidcClient } from "./BaseOidcClient.ts";

describe("Unit/core/BaseOidcClient", () => {
  describe("handleErrorResponse", () => {
    test("Default", async () => {
      const op = await mockProvider(opPort);

      afterAll(async () => {
        await op.stop();
      });

      const mockOptions = structuredClone(mockBaseOptions);
      const client = await BaseOidcClient.factory({
        ...mockOptions,
        issuerUrl: `http://localhost:${opPort}`,
        settings: defaultSettings,
        cookieSettings: defaultCookieSettings,
      });
      const { pathPrefix } = defaultSettings;
      expect(client.paths).toMatchObject({
        callback: `${pathPrefix}${defaultSettings.callbackPath}`,
        introspect: `${pathPrefix}${defaultSettings.introspectPath}`,
        login: `${pathPrefix}${defaultSettings.loginPath}`,
        logout: `${pathPrefix}${defaultSettings.logoutPath}`,
        refresh: `${pathPrefix}${defaultSettings.refreshPath}`,
        resource: `${pathPrefix}${defaultSettings.resourcePath}`,
        revoke: `${pathPrefix}${defaultSettings.revokePath}`,
        status: `${pathPrefix}${defaultSettings.statusPath}`,
        userinfo: `${pathPrefix}${defaultSettings.userinfoPath}`,
      });
    });
  });
});
