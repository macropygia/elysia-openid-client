import type { OidcClient } from "@/core";
import type { OIDCClientMethodArgs } from "@/types";
import { revalidateSession } from "./revalidateSession";

export async function userinfo(this: OidcClient, args: OIDCClientMethodArgs) {
  const { logger } = this;

  logger?.trace("client/userinfo");

  try {
    const resolved = await revalidateSession.call(this, args);

    if (!resolved) {
      return null;
    }

    const { currentSession, resolvedClient } = resolved;

    logger?.trace("openid-client(iss)/userinfo");

    return await resolvedClient.userinfo(currentSession.accessToken);
  } catch (e: unknown) {
    logger?.warn("client/userinfo: Throw exception");
    logger?.debug(e);

    return null;
  }
}
