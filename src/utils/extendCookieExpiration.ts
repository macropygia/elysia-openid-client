import type { OidcClient } from "@/core/OidcClient";
import type { Cookie } from "elysia";

/**
 * Extend cookie expiration
 * @param cookie Cookie
 * @param ctx OIDCClient Instance
 */
export function extendCookieExpiration(
  ctx: OidcClient,
  cookie: Record<string, Cookie<string>>,
) {
  const {
    settings: { refreshExpiration },
    cookieSettings: {
      sessionIdName,
      httpOnly,
      secure,
      sameSite,
      path,
      expires,
    },
    logger,
  } = ctx;
  logger?.trace("utils/extendCookieExpiration");

  if (expires === 0) {
    return;
  }

  cookie[sessionIdName].update({
    httpOnly,
    secure,
    sameSite,
    path,
    expires:
      expires === 0 ? undefined : new Date(Date.now() + refreshExpiration),
  });
  logger?.debug(
    `Cookie expiration has been extended: ${cookie[
      sessionIdName
    ].expires?.toLocaleString()}`,
  );
}
