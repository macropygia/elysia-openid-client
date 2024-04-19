import type { OidcClient } from "@/core/OidcClient";

export async function deleteSession(this: OidcClient, sessionId: string) {
  const { sessions, logger } = this;

  logger?.trace("functions/deleteSession");

  await sessions.delete(sessionId);
}
