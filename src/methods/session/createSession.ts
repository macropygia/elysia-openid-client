import type { OidcClient } from "@/core/OidcClient";
import { generators } from "openid-client";

export async function createSession(
  this: OidcClient,
): Promise<[string, string]> {
  const {
    settings: { loginExpiration },
    sessions,
    logger,
  } = this;

  logger?.trace("methods/createSession");

  const state = generators.state();
  const nonce = generators.nonce();
  const codeVerifier = generators.codeVerifier();
  const codeChallenge = generators.codeChallenge(codeVerifier);

  logger?.trace("openid-client/authorizationUrl");

  const authorizationUrl = this.client.authorizationUrl({
    ...this.authParams,
    state,
    nonce,
    code_challenge: codeChallenge,
  });
  const sessionId = generators.random();
  const now = Date.now();

  await sessions.insert({
    sessionId,
    sessionExpiresAt: now + loginExpiration,
    codeVerifier,
    state,
    nonce,
  });

  return [sessionId, authorizationUrl];
}
