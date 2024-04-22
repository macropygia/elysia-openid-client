import { beforeEach, describe, expect, test } from "bun:test";
import { mockBaseOptions } from "@/__mock__/const";
import type { BaseOidcClient } from "@/core/BaseOidcClient";
import { validateOptions } from "./validateOptions";

describe("Unit/utils/validateOptions", () => {
  let options: BaseOidcClient;

  beforeEach(() => {
    options = structuredClone(mockBaseOptions) as BaseOidcClient;
  });

  test("Succeeded", () => {
    validateOptions(options);
    expect(options).toMatchObject(options);
  });

  test("`client_secret` missing", () => {
    options.clientMetadata.client_secret = undefined;
    expect(() => validateOptions(options)).toThrow("client_secret is required");
  });

  test("Duplicate paths", () => {
    options.settings.logoutPath = "/login";
    expect(() => validateOptions(options)).toThrow("Duplicate path");
  });

  test("`response_mode` is invalid", () => {
    options.authParams.response_mode = "fragment";

    expect(() => validateOptions(options)).toThrow(
      "response_mode must be query or undefined",
    );
  });

  test("`scope` missing", () => {
    options.authParams.scope = undefined as string | undefined;

    validateOptions(options);
    expect(options.authParams.scope).toBe("openid");
  });

  test("`scope` does not contain `openid`", () => {
    options.authParams.scope = "id_token" as string | undefined;

    validateOptions(options);
    expect(options.authParams.scope).toBe("openid id_token");
  });

  test("`redirect_uris` does not contain `redirect_uri`", () => {
    options.clientMetadata.redirect_uris = ["https://localhost/redirect"];

    validateOptions(options);
    expect(options.clientMetadata.redirect_uris).toMatchObject([
      "https://localhost/redirect",
      "http://localhost:57828/auth/callback",
    ]);
  });
});
