import type { OidcClient } from "@/core/OidcClient";
import type { OIDCClientSession } from "@/types";
import type { Cookie } from "elysia";
import { deleteCookie } from "./deleteCookie";

/**
 * Handle error response
 * @param e Error object
 * @param currentSession Session data
 * @param ctx OIDCClient Instance
 * @param cookie Cookie
 * @returns Response
 */
export function handleErrorResponse(
  e: unknown,
  currentSession: OIDCClientSession | null,
  ctx: OidcClient,
  cookie: Record<string, Cookie<string>>,
): Response {
  const { logger } = ctx;

  logger?.trace("core/handleErrorResponse");

  if (currentSession) {
    ctx.deleteSession(currentSession.sessionId);
  }
  deleteCookie(ctx, cookie);

  if (e instanceof Error) {
    return new Response(null, { status: 401 });
  }
  return new Response(null, { status: 500 });
}
