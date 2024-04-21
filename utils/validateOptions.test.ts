import { describe, expect, test } from "bun:test";
import type { BaseOidcClient } from "@/core/BaseOidcClient";
import { defaultSettings } from "@/core/const";
import type { OIDCClientOptions } from "@/types";
import { validateOptions } from "./validateOptions";

const baseOptions = {
  baseUrl: "https://localhost/client",
  issuerUrl: "https://localhost/issuer",
  clientMetadata: {
    client_id: "client_id",
    client_secret: "client_secret",
  },
  authParams: {
    scope: "openid",
  },
  settings: {
    ...defaultSettings,
  },
} as OIDCClientOptions as BaseOidcClient;

describe("Unit/utils/validateOptions", () => {
  test("Succeeded", () => {
    const options = structuredClone(baseOptions);

    validateOptions(options);
    expect(options).toMatchObject(baseOptions);
  });

  test("`client_secret` missing", () => {
    const options = structuredClone(baseOptions);
    options.clientMetadata.client_secret = undefined;

    expect(() => validateOptions(options)).toThrow("client_secret is required");
  });

  test("Duplicate paths", () => {
    const options = structuredClone(baseOptions);
    options.settings.logoutPath = "/login";

    expect(() => validateOptions(options)).toThrow("Duplicate path");
  });

  test("`response_mode` is invalid", () => {
    const options = structuredClone(baseOptions);
    options.authParams.response_mode = "fragment";

    expect(() => validateOptions(options)).toThrow(
      "response_mode must be query or undefined",
    );
  });

  test("`scope` missing", () => {
    const options = structuredClone(baseOptions);
    options.authParams.scope = undefined as string | undefined;

    validateOptions(options);
    expect(options.authParams.scope).toBe("openid");
  });

  test("`scope` does not contain `openid`", () => {
    const options = structuredClone(baseOptions);
    options.authParams.scope = "id_token" as string | undefined;

    validateOptions(options);
    expect(options.authParams.scope).toBe("openid id_token");
  });

  test("`redirect_uris` does not contain `redirect_uri`", () => {
    const options = structuredClone(baseOptions);
    options.clientMetadata.redirect_uris = ["https://localhost/redirect"];

    validateOptions(options);
    expect(options.clientMetadata.redirect_uris).toMatchObject([
      "https://localhost/redirect",
      "https://localhost/client/auth/callback",
    ]);
  });
});
