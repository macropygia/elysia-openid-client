/**
 * Append an 8-digit Session ID to the end of the message
 */
export const addShortId = (message: string, sessionId: string) =>
  `${message} [${sessionId?.slice(0, 8)}]`;
