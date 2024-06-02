import type { OidcClient } from "@/core/OidcClient";
import type { Cookie } from "elysia";

/**
 * Delete session cookie
 * @param ctx OIDCClient Instance
 * @param cookie Cookie
 */
export function deleteCookie(
  ctx: OidcClient,
  cookie: Record<string, Cookie<string>>,
) {
  const {
    cookieSettings: { sessionIdName, httpOnly, secure, sameSite, path },
    logger,
  } = ctx;
  logger?.trace("utils/deleteCookie");

  // cookie[sessionIdName].remove(); // NOTE: No effect (2024-04-19)

  if (cookie[sessionIdName].value) {
    logger?.debug(`Session ID Cookie deleted: ${cookie[sessionIdName].value}`);
    cookie[sessionIdName].update({
      httpOnly,
      secure,
      sameSite,
      path,
      expires: new Date(0),
      // maxAge: 0,
    });
  }
}
