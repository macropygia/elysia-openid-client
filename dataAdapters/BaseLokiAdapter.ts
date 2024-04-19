import type { OIDCClientDataAdapter, OIDCClientSession } from "@/types";
import type loki from "lokijs";
import type { Collection } from "lokijs";

export class BaseLokiAdapter implements OIDCClientDataAdapter {
  /**
   * Database
   * - Initialized at async constructor
   */
  db!: loki;
  /**
   * Sessions collection
   * - Initialized at async constructor
   */
  sessions!: Collection<OIDCClientSession>;

  /**
   * Fetch session
   * @param sessionId Session ID
   */
  public readonly fetch = (sessionId: string): OIDCClientSession | null => {
    const [result] = this.sessions
      .chain()
      .find({ sessionId })
      .data({ removeMeta: true });
    return result || null;
  };

  /**
   * Insert session
   * @param session Session
   */
  public readonly insert = (session: OIDCClientSession): void => {
    this.sessions.insert(session);
  };

  /**
   * Update session
   * @param session Session
   */
  public readonly update = (session: OIDCClientSession): void => {
    const { sessionId } = session;
    this.sessions
      .chain()
      .find({ sessionId })
      .update((obj) => {
        for (const [k, v] of Object.entries(session)) {
          // @ts-ignore
          obj[k] = v;
        }
      });
  };

  /**
   * Delete session
   * @param sessionId Session ID
   */
  public readonly delete = (sessionId: string): void => {
    this.sessions.chain().find({ sessionId }).remove();
  };

  /** Prune expired sessions */
  public prune = () => {
    this.sessions
      .chain()
      .find({ sessionExpiresAt: { $lt: Date.now() } })
      .remove();
  };

  /** Close database */
  public readonly close = (): void => {
    this.db.close();
  };
}
