import type { OidcClient } from "@/core";
import type { OIDCClientMethodArgs } from "@/types";
import {} from "@/utils";
import { TokenSet } from "openid-client";
import { revalidateSession } from "./revalidateSession.ts";

export async function refresh(this: OidcClient, args: OIDCClientMethodArgs) {
  const { logger } = this;

  logger?.trace("client/refresh");

  try {
    const resolved = await revalidateSession.call(this, {
      ...args,
      forceRefresh: true,
    });

    if (!resolved) {
      return null;
    }

    const { currentSession } = resolved;

    return new TokenSet({ id_token: currentSession.idToken }).claims();
  } catch (e: unknown) {
    logger?.warn("client/refresh: Throw exception");
    logger?.debug(e);
    return null;
  }
}
