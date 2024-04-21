import type { OidcClient } from "@/core/OidcClient";
import type { Cookie } from "elysia";

/**
 * Delete session cookie
 * @param cookie Cookie
 * @param ctx OIDCClient Instance
 */
export function deleteCookie(
  ctx: OidcClient,
  cookie: Record<string, Cookie<string>>,
) {
  const {
    cookieSettings: { sessionIdName, httpOnly, secure, sameSite, path },
    logger,
  } = ctx;
  logger?.trace("core/deleteCookie");

  // cookie[sessionIdName].remove();

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
