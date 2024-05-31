import type { OIDCClientDataAdapter, OIDCClientSession } from "@/types";
import { Redis } from "ioredis";
import type { RedisOptions } from "ioredis/built/index";

const defaultOptions = {
  port: 6379,
  host: "127.0.0.1",
};

/**
 * Redis data adapter
 * - Usage: `const dataAdapter = new RedisAdapter();`
 * - Not recommended for use in production.
 * @see [ioredis](https://github.com/redis/ioredis)
 * @experimental
 */
export class RedisAdapter implements OIDCClientDataAdapter {
  /** Database */
  db: Redis;
  options: RedisOptions;

  constructor(options?: RedisOptions) {
    this.options = { ...defaultOptions, ...options };
    this.db = new Redis(this.options);
  }

  /**
   * Fetch session
   * @param sessionId Session ID
   */
  public fetch = async (
    sessionId: string,
  ): Promise<OIDCClientSession | null> => {
    const jsonStr = await this.db.get(sessionId);
    if (!jsonStr) {
      return null;
    }
    const jsonObj = JSON.parse(jsonStr);
    jsonObj.sessionId = sessionId;
    return jsonObj as OIDCClientSession;
  };

  /**
   * Insert session
   * @param session Session
   */
  public insert = async (session: OIDCClientSession): Promise<void> => {
    const { sessionId, ...payload } = session;
    await this.db.set(
      sessionId,
      JSON.stringify(payload),
      "PXAT",
      payload.sessionExpiresAt,
    );
  };

  /**
   * Update session
   * @param session Session
   */
  public update = async (session: OIDCClientSession): Promise<void> => {
    const { sessionId, ...payload } = session;
    await this.db.set(
      sessionId,
      JSON.stringify(payload),
      "PXAT",
      payload.sessionExpiresAt,
    );
  };

  /**
   * Delete session
   * @param sessionId Session ID
   */
  public delete = async (sessionId: string): Promise<void> => {
    await this.db.del(sessionId);
  };

  /** Prune expired sessions */
  public prune = (): void => undefined;

  /** Close database */
  public close = async (): Promise<void> => {
    await this.db.quit();
  };

  /** Flush database (for testing) */
  public flushAll = async (): Promise<void> => {
    await this.db.flushall();
  };
}
