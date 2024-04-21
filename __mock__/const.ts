import { mock } from "bun:test";
import type { OidcClient } from "@/core/OidcClient";
import { defaultCookieSettings, defaultSettings } from "@/core/const";
import { consoleLogger } from "@/loggers/consoleLogger";
import type {
  OIDCClientActiveSession,
  OIDCClientOptions,
  OIDCClientSession,
} from "@/types";
import type { Cookie } from "elysia";
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
  baseUrl: `https://localhost:${rpPort}`,
  issuerUrl: `https://localhost:${opPort}`,
  clientMetadata: {
    client_id: "mock-client-id",
    client_secret: "mock-client-secret",
  },
  authParams: {},
  settings: defaultSettings,
  cookieSettings: {
    ...defaultCookieSettings,
    secure: false,
  },
} as OIDCClientOptions;

export const mockIdToken =
  "eyJhbGciOiJSUzI1NiIsImtpZCI6IjFlOWdkazcifQ.ewogImlzcyI6Imh0dHBzOi8vc2VydmVyLmV4YW1wbGUuY29tIiwKICAic3ViIjoiMjQ4Mjg5NzYxMDAxIiwKICAiYXVkIjoiczZCaGRSa3F0MyIsCiAgIm5vbmNlIjoibi0wUzZfV3pBMk1qIiwKICAiZXhwIjoxMzExMjgxOTcwLAogImlhdCI6MTMxMTI4MDE3MAp9.ggW8hZ1EuVLuxNuuIJKX_V8a_OMXzR0EHrAsNSbvOojeUFFrEalG9covNi1SDYmXKlgNuL59mVPeHspqI6J7sbo4-K3TSkhogU6JUgiy3OdDrfAav9yU5SCLZSxnW8NAkFguHiMeJfRugKyybartdLriPmIYkmI6VzwlHxGiuqlEkjFZjoiewpIdRHFuzkzGSmXEOpZGDaSIPuP7oGxjn_vSI7v7kpJIlBS-xloiFqXnudkjESaWCtkZO5LF1Wn01YklmTPQoh3Sxsm0Tp1QTwecRjyFz7exbcVwhQqXYTlvaUo-4KE5lKcxKVV_uCZuhSA2QS1cvI";

export const mockIdTokenClaims = {
  aud: "s6BhdRkqt3",
  exp: 1311281970,
  iat: 1311280170,
  iss: "https://server.example.com",
  nonce: "n-0S6_WzA2Mj",
  sub: "248289761001",
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

export const mockPostInit: RequestInit = {
  method: "POST",
  headers: {
    Cookie: `${defaultCookieSettings.sessionIdName}=mock-sid`,
  },
};

export const mockPostInitWithSid = (sid?: string): RequestInit => ({
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
  create: mock(),
  initialize: mock(),
  validateOptions: mock(),
  createSession: mock(),
  updateSession: mock().mockReturnValue(mockActiveSession),
  fetchSession: mock(),
  deleteSession: mock(),
  getSessionIdCookieType: mock(),
  getCookieDefinition: mock(),
  getAuthHook: mock(),
  getEndpoints: mock(),
  logger: undefined,
} as DeepPartial<OidcClient> as OidcClient;

export const mockCookie = {
  [defaultCookieSettings.sessionIdName]: {
    value: mockActiveSession.sessionId,
    remove: mock(),
    update: mock(),
  },
} as unknown as Record<string, Cookie<string>>;
