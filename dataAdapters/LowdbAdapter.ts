import type { OIDCClientDataAdapter, OIDCClientSession } from "@/types";
import { Low, Memory } from "lowdb";
import { JSONFile } from "lowdb/node";

export interface LowdbAdapterOptions {
  /**
   * Database file path
   * @default null
   * @example "/path/to/sessions.json"
   */
  filename?: string;
}

const defaultOptions: LowdbAdapterOptions = {
  filename: undefined,
};

/**
 * Lowdb data adapter
 * - Usage: `const dataAdapter = new LowdbAdapter();`
 * @see [Lowdb](https://github.com/typicode/lowdb)
 * @experimental
 */
export class LowdbAdapter implements OIDCClientDataAdapter {
  /** Database */
  db: Low<OIDCClientSession[]>;
  /** Options */
  options: LowdbAdapterOptions;

  public constructor(options?: Partial<LowdbAdapterOptions>) {
    this.options = {
      ...defaultOptions,
      ...options,
    };

    const { filename } = this.options;

    this.db = filename
      ? new Low<OIDCClientSession[]>(new JSONFile(filename), [])
      : new Low<OIDCClientSession[]>(new Memory(), []);
  }

  /**
   * Fetch session
   * @param sessionId Session ID
   */
  public fetch = (sessionId: string): OIDCClientSession | null => {
    const result =
      this.db.data.find((session) => session.sessionId === sessionId) || null;
    return result;
  };

  /**
   * Insert session
   * @param session Session
   */
  public insert = async (session: OIDCClientSession): Promise<void> => {
    await this.db.update((data) => {
      data.push(session);
    });
    await this.db.write();
  };

  /**
   * Update session
   * @param session Session
   */
  public update = async (session: OIDCClientSession): Promise<void> => {
    const { sessionId } = session;
    const index = this.db.data.findIndex((s) => s.sessionId === sessionId);
    if (index > 0) {
      await this.db.update((data) => {
        data[index] = session;
      });
      await this.db.write();
    }
  };

  /**
   * Delete session
   * @param sessionId Session ID
   */
  public delete = async (sessionId: string): Promise<void> => {
    this.db.data = this.db.data.filter((data) => data.sessionId !== sessionId);
    await this.db.write();
  };

  /** Prune expired sessions */
  public prune = async (): Promise<void> => {
    const now = Date.now();
    this.db.data = this.db.data.filter((data) => data.sessionExpiresAt > now);
    await this.db.write();
  };

  /** Close database */
  public close = async (): Promise<void> => {
    await this.db.write();
  };
}
