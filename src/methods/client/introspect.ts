import type { OidcClient } from "@/core";
import type { OIDCClientMethodArgs } from "@/types";
import { revalidateSession } from "./revalidateSession";

export async function introspect(this: OidcClient, args: OIDCClientMethodArgs) {
  const { logger } = this;

  logger?.trace("client/introspect");

  try {
    const resolved = await revalidateSession.call(this, args);

    if (!resolved) {
      return null;
    }

    const { currentSession, resolvedClient } = resolved;

    logger?.debug("openid-client/introspect: (inherit from revalidateSession)");

    return await resolvedClient.introspect(currentSession.idToken);
  } catch (e: unknown) {
    logger?.warn("client/introspect: Throw exception");
    logger?.debug(e);

    return null;
  }
}
