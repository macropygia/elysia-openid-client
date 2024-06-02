import { mock } from "bun:test";
import {
  defaultAuthHookSettings,
  defaultCookieSettings,
  defaultSettings,
} from "@/const";
import type { OidcClient } from "@/core/OidcClient";
import { consoleLogger } from "@/loggers/consoleLogger";
import type {
  OIDCClientActiveSession,
  OIDCClientOptions,
  OIDCClientSession,
} from "@/types";
import type { Cookie } from "elysia";
import { t } from "elysia";
import type { IdTokenClaims } from "openid-client";

export type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

export const sqliteMockFile = "__mock__/mock.sqlite";
export const sqliteTempFile = "__mock__/temp.sqlite";
export const lokiMockFile = "__mock__/mock.db";
export const lokiTempFile = "__mock__/temp.db";
export const lowMockFile = "__mock__/mock.json";
export const lowTempFile = "__mock__/temp.json";
export const redisPort = 6379;
export const redisHost = "localhost";
export const rpPort = 57828;
export const opPort = 57829;

export const logger = consoleLogger();

export const mockLogger = {
  silent: mock(),
  trace: mock(),
  debug: mock(),
  info: mock(),
  warn: mock(),
  error: mock(),
  fatal: mock(),
};

export const mockBaseOptions = {
  baseUrl: `http://localhost:${rpPort}`,
  issuerUrl: `http://localhost:${opPort}`,
  clientMetadata: {
    client_id: "mock-client-id",
    client_secret: "mock-client-secret",
  },
  authParams: {},
  settings: defaultSettings,
  authHookSettings: defaultAuthHookSettings,
  cookieSettings: {
    ...defaultCookieSettings,
    secure: false,
  },
} as OIDCClientOptions;

export const mockIdToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtb2NrLXN1YiIsIm5vbmNlIjoibW9jay1ub25jZSIsImF1ZCI6Im1vY2stYXVkIiwiaWF0Ijo1MDAwMDAwMDAwLCJleHAiOjUwMDAwMDAwMDAsImlzcyI6Imh0dHBzOi8vb3AuZXhhbXBsZS5jb20ifQ.SyVdKzxYNl0ZsjZvJ9gZyOzPDEE9Q0_bI2l_j5B8fSw";

export const mockIdTokenExpired =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtb2NrLXN1YiIsIm5vbmNlIjoibW9jay1ub25jZSIsImF1ZCI6Im1vY2stYXVkIiwiaWF0IjoxNzA0MDY3MjAwLCJleHAiOjE3MDQwNjcyMDAsImlzcyI6Imh0dHBzOi8vb3AuZXhhbXBsZS5jb20ifQ.JrNwu4_ji3cnoCDd_wxhRVbc25D1Y2io6n7VKDd5pLc";

export const mockIdTokenClaims = {
  aud: "mock-aud",
  exp: 5000000000,
  iat: 5000000000,
  iss: "https://op.example.com",
  nonce: "mock-nonce",
  sub: "mock-sub",
};

export const mockIdTokenExpiredClaims = {
  aud: "mock-aud",
  exp: 1704067200,
  iat: 1704067200,
  iss: "https://op.example.com",
  nonce: "mock-nonce",
  sub: "mock-sub",
};

export const mockLoginSession: OIDCClientSession = {
  sessionId: "mock-session-id",
  codeVerifier: "mock-code-verifier",
  state: "mock-state",
  nonce: "mock-nonce",
  sessionExpiresAt: 5000000000000,
};

export const mockActiveSession: OIDCClientActiveSession = {
  sessionId: "mock-session-id",
  idToken: "mock-id-token",
  accessToken: "mock-access-token",
  refreshToken: "mock-refresh-token",
  sessionExpiresAt: 5000000000000,
};

export const mockActiveSessionWithoutRefreshToken: OIDCClientActiveSession = {
  sessionId: "mock-session-id",
  idToken: "mock-id-token",
  accessToken: "mock-access-token",
  sessionExpiresAt: 5000000000000,
};

export const mockActiveSessionWithRealIdToken: OIDCClientActiveSession = {
  sessionId: "mock-session-id",
  idToken: mockIdToken,
  accessToken: "mock-access-token",
  refreshToken: "mock-refresh-token",
  sessionExpiresAt: 5000000000000,
};

export const mockActiveSessionWithRealIdTokenRefreshed: OIDCClientActiveSession =
  {
    ...mockActiveSessionWithRealIdToken,
    accessToken: "mock-access-token-refreshed",
    refreshToken: "mock-refresh-token-refreshed",
    sessionExpiresAt: 5000000000001,
  };

export const mockActiveSessionWithRealIdTokenExpired: OIDCClientActiveSession =
  {
    ...mockActiveSessionWithRealIdToken,
    idToken: mockIdTokenExpired,
  };

export const mockPostInit = (sid?: string): RequestInit => ({
  method: "POST",
  headers: {
    Cookie: `${defaultCookieSettings.sessionIdName}=${sid || "mock-sid"}`,
  },
});

export const mockGetInit = (sid?: string): RequestInit => ({
  headers: {
    Cookie: `${defaultCookieSettings.sessionIdName}=${sid || "mock-sid"}`,
  },
});

export const mockClaims = {
  exp: 5000000000000 / 1000,
  iss: `http://localhost:${opPort}`,
  sub: "mock-sub",
} as IdTokenClaims;

export const mockStatus = {
  sessionExpiresAt: mockActiveSession.sessionExpiresAt,
  hasRefreshToken: !!mockActiveSession.refreshToken,
  isExpired: mockClaims.exp * 1000 < Date.now(),
  expiresAt: mockClaims.exp * 1000,
  issuerUrl: mockClaims.iss,
  sub: mockClaims.sub,
};

export const mockBaseClient = {
  ...mockBaseOptions,
  factory: mock(),
  initialize: mock(),
  validateOptions: mock(),
  createSession: mock(),
  updateSession: mock(),
  fetchSession: mock(),
  deleteSession: mock(),
  cookieTypeBox: t.Cookie({ "mock-cookie-name": t.String() }),
  createAuthHook: mock(),
  createEndpoints: mock(),
  logger: mockLogger,
  initialized: true,
  client: {},
  sessions: mock(),
} as DeepPartial<OidcClient> as OidcClient;

export const mockCookie = {
  [defaultCookieSettings.sessionIdName]: {
    value: mockActiveSession.sessionId,
    remove: mock(),
    update: mock(),
  },
} as unknown as Record<string, Cookie<string>>;

/**
 * Clear calls/instances
 */
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const mockClearRecursively = (mockObj: any) => {
  if (typeof mockObj !== "object") {
    return;
  }
  for (const [_name, maybeMethod] of Object.entries(mockObj)) {
    if (!maybeMethod) {
      continue;
    }
    if (
      typeof maybeMethod === "function" &&
      "mockClear" in maybeMethod &&
      typeof maybeMethod.mockClear === "function"
    ) {
      maybeMethod.mockClear();
    } else if (typeof maybeMethod === "object") {
      mockClearRecursively(maybeMethod);
    }
  }
};

/**
 * Reset all mocks to `mock()`
 */
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const mockResetRecursively = (mockObj: any) => {
  if (typeof mockObj !== "object") {
    return;
  }
  for (const [_name, maybeMethod] of Object.entries(mockObj)) {
    if (!maybeMethod) {
      continue;
    }
    if (
      typeof maybeMethod === "function" &&
      "mockReset" in maybeMethod &&
      typeof maybeMethod.mockReset === "function"
    ) {
      maybeMethod.mockReset();
    } else if (typeof maybeMethod === "object") {
      mockResetRecursively(maybeMethod);
    }
  }
};
