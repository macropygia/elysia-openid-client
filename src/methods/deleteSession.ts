import type { OidcClient } from "@/core/OidcClient";

export async function deleteSession(this: OidcClient, sessionId: string) {
  const { sessions, logger } = this;

  logger?.trace("methods/deleteSession");

  await sessions.delete(sessionId);
}
