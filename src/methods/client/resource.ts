import type { OidcClient } from "@/core";
import type { OIDCClientMethodArgs } from "@/types";
import { revalidateSession } from "./revalidateSession";
// import type { Cookie } from "elysia";

export async function resource(
  this: OidcClient,
  args: OIDCClientMethodArgs & {
    resourceUrl: string;
  },
) {
  const { logger } = this;
  const { resourceUrl } = args;

  logger?.trace("client/resource");

  try {
    const resolved = await revalidateSession.call(this, args);

    if (!resolved) {
      return null;
    }

    const { currentSession, resolvedClient } = resolved;

    logger?.trace("openid-client(iss)/requestResource");

    const response = resolvedClient.requestResource(
      decodeURIComponent(resourceUrl),
      currentSession.accessToken,
      {
        method: "GET",
      },
    );
    return response;
  } catch (e: unknown) {
    logger?.warn("client/resource: Throw exception");
    logger?.debug(e);

    return null;
  }
}
