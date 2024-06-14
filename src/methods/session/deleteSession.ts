import type { OidcClient } from "@/core/OidcClient";
import { addShortId } from "@/utils/addShortId";

export async function deleteSession(this: OidcClient, sessionId: string) {
  const { sessions, logger } = this;

  logger?.trace("methods/deleteSession");

  logger?.debug(addShortId("Try to delete session (delete)", sessionId));
  await sessions.delete(sessionId);
}
