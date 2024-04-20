import pino, { type LoggerOptions } from "pino";

/**
 * Pino pretty logger
 * - Requires `pino` and `pino-pretty`
 * - If no options are provided, it will use the default options based on `process.env.NODE_ENV`.
 * @param options - pino options (optional)
 * @returns Logger (pino)
 */
export const pinoPrettyLogger = (options?: LoggerOptions) => {
  return pino(
    options ||
      defaultOptions[process.env.NODE_ENV || "never"] ||
      defaultOptions.default,
  );
};

/**
 * Pino Logger Options
 * - Do not add `never`
 */
const defaultOptions: Record<string, LoggerOptions> = {
  default: {
    level: "trace",
    transport: {
      target: "pino-pretty",
      options: {
        sync: true,
      },
    },
  },
  development: {
    level: "trace",
    transport: {
      target: "pino-pretty",
      options: {
        sync: true,
      },
    },
  },
  production: {
    level: "info",
    transport: {
      target: "pino-pretty",
      options: {
        sync: true,
      },
    },
  },
};
