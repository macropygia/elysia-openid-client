import { describe, expect, test } from "bun:test";
import { mockBaseOptions, opPort } from "@/__mock__/const";
import { mockProvider } from "@/__mock__/mockProvider";
import { BaseOidcClient } from "./BaseOidcClient";
import { defaultCookieSettings, defaultSettings } from "./const";

describe("Unit/core/BaseOidcClient", () => {
  describe("handleErrorResponse", () => {
    test("Default", async () => {
      const op = await mockProvider(opPort);

      const client = await BaseOidcClient.create({
        ...mockBaseOptions,
        issuerUrl: `http://localhost:${opPort}`,
        settings: defaultSettings,
        cookieSettings: defaultCookieSettings,
      });
      const { pathPrefix } = defaultSettings;
      expect(client.getPaths()).toMatchObject({
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

      op.stop();
    });
  });
});
