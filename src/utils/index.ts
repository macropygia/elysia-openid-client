import { deleteCookie } from "./deleteCookie";
import { extendCookieExpiration } from "./extendCookieExpiration";
import { getClaimsFromIdToken } from "./getClaimsFromIdToken";
import { handleErrorResponse } from "./handleErrorResponse";
import { refreshHook } from "./refreshHook";
import { sessionToStatus } from "./sessionToStatus";
import { validateOptions } from "./validateOptions";

export {
  refreshHook,
  deleteCookie,
  extendCookieExpiration,
  getClaimsFromIdToken,
  handleErrorResponse,
  sessionToStatus,
  validateOptions,
};
