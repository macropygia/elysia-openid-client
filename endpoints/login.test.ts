import { describe, expect, mock, test } from "bun:test";
import { type DeepPartial, baseMockClient } from "@/__test__/const";
import type { OidcClient } from "@/core/OidcClient";
import Elysia from "elysia";
import setCookie from "set-cookie-parser";
import { login } from "./login";

describe("Unit/endpoints/login", () => {
  const mc = {
    ...baseMockClient,
    createSession: mock().mockReturnValue(["mock-sid", "/mock-url"]),
  } as DeepPartial<OidcClient> as OidcClient;

  test("Succeeded", async () => {
    const plugin = login.call(mc);
    const app = new Elysia().use(plugin);

    const response = await app.handle(new Request("http://localhost/login"));

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/mock-url");

    const cookie = setCookie.parse(
      response.headers.get("set-cookie") as string,
    )[0];
    expect(cookie.name).toBe("__Host-sid");
    expect(cookie.value).toBe("mock-sid");
    expect(cookie.path).toBe("/");
    expect((cookie.expires as Date) > new Date()).toBeTruthy();
    expect(cookie.httpOnly).toBe(true);
    expect(cookie.secure).toBeFalsy();
    expect(cookie.sameSite?.toLowerCase()).toBe("lax");
  });

  test("Failed (exception)", async () => {
    const mc = {
      ...baseMockClient,
      createSession: mock().mockImplementation(() => {
        throw "Unknown error";
      }),
    } as DeepPartial<OidcClient> as OidcClient;

    const plugin = login.call(mc);
    const app = new Elysia().use(plugin);

    const response = await app.handle(new Request("http://localhost/login"));

    expect(response.status).toBe(500);
  });
});
