import type { OidcClient } from "@/core";
import type { OIDCClientMethodArgs } from "@/types";
import { deleteCookie } from "@/utils";
import { revalidateSession } from "./revalidateSession";
// import type { Cookie } from "elysia";

export async function revoke(this: OidcClient, args: OIDCClientMethodArgs) {
  const { logger } = this;
  const { cookie } = args;

  logger?.trace("client/revoke");

  try {
    const resolved = await revalidateSession.call(this, {
      ...args,
      isRevoke: true,
    });

    if (!resolved) {
      return null;
    }

    const { currentSession, resolvedClient } = resolved;

    logger?.debug("openid-client/revoke: (inherit from revalidateSession)");

    await resolvedClient.revoke(currentSession.idToken);
    this.deleteSession(currentSession.sessionId);
    deleteCookie(this, cookie);

    return;
  } catch (e: unknown) {
    logger?.warn("endpoints/revoke: Throw exception");
    logger?.debug(e);

    return null;
  }
}
