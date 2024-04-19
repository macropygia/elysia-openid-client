import type { OIDCClientCookieSettings, OIDCClientSettings } from "@/types";
import type { LoggerOptions } from "pino";

/**
 * Plugin default settings
 */
export const defaultSettings: OIDCClientSettings = {
  callbackCompletedPath: "/",
  logoutCompletedPath: "/logout",
  pathPrefix: "/auth",
  loginPath: "/login",
  callbackPath: "/callback",
  logoutPath: "/logout",
  userinfoPath: "/userinfo",
  refreshPath: "/refresh",
  introspectPath: "/introspect",
  revokePath: "/revoke",
  statusPath: "/status",
  claimsPath: "/claims",
  resourcePath: "/resource",
  loginExpiration: 60 * 10 * 1000, // 10 minutes
  refreshExpiration: 60 * 60 * 24 * 30 * 1000, // 30 days
};

/**
 * Plugin default cookie settings
 */
export const defaultCookieSettings: OIDCClientCookieSettings = {
  sessionIdName: "__Host-sid",
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  path: "/",
};

/**
 * Default pino options
 * - Do not add `never`
 */
export const defaultLoggerOptions: Record<string, LoggerOptions> = {
  default: {
    level: "trace",
    transport: {
      target: "pino-pretty",
      options: {
        sync: true,
      },
    },
  },
  development: {
    level: "trace",
    transport: {
      target: "pino-pretty",
      options: {
        sync: true,
      },
    },
  },
  production: {
    level: "info",
    transport: {
      target: "pino-pretty",
      options: {
        sync: true,
      },
    },
  },
};
