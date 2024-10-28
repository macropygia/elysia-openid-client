import {
  type Mock,
  afterEach,
  beforeEach,
  describe,
  expect,
  spyOn,
  test,
} from "bun:test";
import { consoleLogger } from "./consoleLogger.ts";

describe("Unit/loggers/consoleLogger", () => {
  let logDebug: Mock<() => void>;
  let logInfo: Mock<() => void>;
  let logWarn: Mock<() => void>;
  let logError: Mock<() => void>;

  beforeEach(() => {
    logDebug = spyOn(console, "debug").mockImplementation(() => undefined);
    logInfo = spyOn(console, "info").mockImplementation(() => undefined);
    logWarn = spyOn(console, "warn").mockImplementation(() => undefined);
    logError = spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    logDebug.mockRestore();
    logInfo.mockRestore();
    logWarn.mockRestore();
    logError.mockRestore();
  });

  test("default", () => {
    const logger = consoleLogger();

    logger.silent("test"); // Not called
    logger.trace("test"); // Called
    logger.debug("test"); // Called
    expect(logDebug).toHaveBeenCalledTimes(2);

    logger.info("test"); // Called
    expect(logInfo).toHaveBeenCalledTimes(1);

    logger.warn("test"); // Called
    expect(logWarn).toHaveBeenCalledTimes(1);

    logger.error("test"); // Called
    logger.fatal("test"); // Called
    expect(logError).toHaveBeenCalledTimes(2);
  });

  test("info", () => {
    const logger = consoleLogger("info");

    logger.silent("test"); // Not called
    logger.trace("test"); // Not called
    logger.debug("test"); // Not called
    expect(logDebug).toHaveBeenCalledTimes(0);

    logger.info("test"); // Called
    expect(logInfo).toHaveBeenCalledTimes(1);

    logger.warn("test"); // Called
    expect(logWarn).toHaveBeenCalledTimes(1);

    logger.error("test"); // Called
    logger.fatal("test"); // Called
    expect(logError).toHaveBeenCalledTimes(2);
  });

  test("silent", () => {
    const logger = consoleLogger("silent");

    logger.silent("test"); // Called
    logger.trace("test"); // Called
    logger.debug("test"); // Called
    expect(logDebug).toHaveBeenCalledTimes(3);

    logger.info("test"); // Called
    expect(logInfo).toHaveBeenCalledTimes(1);

    logger.warn("test"); // Called
    expect(logWarn).toHaveBeenCalledTimes(1);

    logger.error("test"); // Called
    logger.fatal("test"); // Called
    expect(logError).toHaveBeenCalledTimes(2);
  });

  test("error", () => {
    const logger = consoleLogger("error");

    logger.silent("test"); // Not called
    logger.trace("test"); // Not called
    logger.debug("test"); // Not called
    expect(logDebug).toHaveBeenCalledTimes(0);

    logger.info("test"); // Not called
    expect(logInfo).toHaveBeenCalledTimes(0);

    logger.warn("test"); // Not called
    expect(logWarn).toHaveBeenCalledTimes(0);

    logger.error("test"); // Called
    logger.fatal("test"); // Called
    expect(logError).toHaveBeenCalledTimes(2);
  });
});
