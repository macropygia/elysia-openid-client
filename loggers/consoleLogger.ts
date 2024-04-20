import type { OIDCClientLogger } from "@/types";
import type { LevelWithSilent } from "pino";

/**
 * Console logger
 * @param level - Minimum level to be displayed
 * @returns Logger (console)
 */
export const consoleLogger = (
  level?: keyof typeof levels,
): OIDCClientLogger => ({
  silent: levels[level || "trace"] === 0 ? console.debug : () => undefined,
  trace: levels[level || "trace"] <= 10 ? console.debug : () => undefined,
  debug: levels[level || "trace"] <= 20 ? console.debug : () => undefined,
  info: levels[level || "trace"] <= 30 ? console.info : () => undefined,
  warn: levels[level || "trace"] <= 40 ? console.warn : () => undefined,
  error: levels[level || "trace"] <= 50 ? console.error : () => undefined,
  fatal: levels[level || "trace"] <= 60 ? console.error : () => undefined,
});

const levels: Record<LevelWithSilent, number> = {
  silent: 0,
  fatal: 60,
  error: 50,
  warn: 40,
  info: 30,
  debug: 20,
  trace: 10,
};
