import type { OidcClient } from "@/core/OidcClient";
import { addShortId } from "@/utils/addShortId";
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

  logger?.debug("openid-client/authorizationUrl: self");

  const authorizationUrl = this.client.authorizationUrl({
    ...this.authParams,
    state,
    nonce,
    code_challenge: codeChallenge,
  });
  const sessionId = generators.random();
  const now = Date.now();

  logger?.debug(addShortId("Try to create session (insert)", sessionId));
  await sessions.insert({
    sessionId,
    sessionExpiresAt: now + loginExpiration,
    codeVerifier,
    state,
    nonce,
  });

  return [sessionId, authorizationUrl];
}
