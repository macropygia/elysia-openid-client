import { Database, type Statement } from "bun:sqlite";
import type { OIDCClientDataAdapter, OIDCClientSession } from "@/types";

export interface SQLiteAdapterOptions {
  /**
   * Database file path
   * @default ":memory:"
   * @example "/path/to/sessions.sqlite"
   */
  filename: string;
  /**
   * Table name
   * @default "sessions"
   */
  table: string;
  /**
   * Use WAL mode
   * @default false
   */
  useWAL: boolean;
}

const defaultOptions: SQLiteAdapterOptions = {
  filename: ":memory:",
  table: "sessions",
  useWAL: false,
};

/** SQL Parameters convert from session data */
export type SQLiteAdapterParameters = Record<string, string | number | null>;

/** Session data as record */
export type SQLiteAdapterRecord = Record<
  keyof OIDCClientSession,
  string | number | null
>;

/**
 * SQLite data adapter
 * - Usage: `const dataAdapter = new SQLiteAdapter();`
 * @see [Bun SQLite3 driver](https://bun.sh/docs/api/sqlite)
 */
export class SQLiteAdapter implements OIDCClientDataAdapter {
  /** Database */
  db: Database;
  /** Options */
  options: SQLiteAdapterOptions;

  /** Fetch statement */
  private fetchQuery: Statement<SQLiteAdapterRecord, [string]>;
  /** Insert statement */
  private insertQuery: Statement<void, [SQLiteAdapterParameters]>;
  /** Update statement */
  private updateQuery: Statement<void, [SQLiteAdapterParameters]>;
  /** Delete statement */
  private deleteQuery: Statement<void, [string]>;
  /** Prune statement */
  private pruneQuery: Statement<void, [number]>;

  public constructor(options?: Partial<SQLiteAdapterOptions>) {
    this.options = {
      ...defaultOptions,
      ...options,
    };

    const db = new Database(this.options.filename);

    if (this.options.useWAL && this.options.filename !== ":memory:") {
      db.exec("PRAGMA journal_mode = WAL;");
    }

    db.exec(`
      CREATE TABLE IF NOT EXISTS ${this.options.table}
      (
        "sessionId" TEXT PRIMARY KEY,
        "sessionExpiresAt" INTEGER NOT NULL,
        "codeVerifier" TEXT,
        "state" TEXT,
        "nonce" TEXT,
        "idToken" TEXT,
        "accessToken" TEXT,
        "refreshToken" TEXT
      )
      WITHOUT ROWID
      ;
    `);
    db.exec(`
      CREATE INDEX IF NOT EXISTS expires ON ${this.options.table} (sessionExpiresAt ASC)
      ;
    `);

    this.fetchQuery = db.query(`
      SELECT * FROM ${this.options.table}
      WHERE sessionId = $sessionID
      ;
    `);

    this.insertQuery = db.query(`
      INSERT INTO ${this.options.table}
        (
          sessionId,
          sessionExpiresAt,
          codeVerifier,
          state,
          nonce,
          idToken,
          accessToken,
          refreshToken
        )
      VALUES
        (
          $sessionId,
          $sessionExpiresAt,
          $codeVerifier,
          $state,
          $nonce,
          $idToken,
          $accessToken,
          $refreshToken
        )
      ;
    `);

    this.updateQuery = db.query(`
      UPDATE ${this.options.table}
      SET
        sessionExpiresAt = $sessionExpiresAt,
        codeVerifier = $codeVerifier,
        state = $state,
        nonce = $nonce,
        idToken = $idToken,
        accessToken = $accessToken,
        refreshToken = $refreshToken
      WHERE sessionId = $sessionId
      ;
    `);

    this.deleteQuery = db.query(`
      DELETE FROM ${this.options.table}
      WHERE sessionId = $sessionID
      ;
    `);

    this.pruneQuery = db.query(`
      DELETE FROM ${this.options.table}
      WHERE sessionExpiresAt < $now
      ;
    `);

    this.db = db;
  }

  /**
   * Convert internal data to SQL parameters
   * @param session Session data
   * @returns SQL parameters
   */
  protected sessionToParameters = (
    session: OIDCClientSession,
  ): SQLiteAdapterParameters => {
    const params: SQLiteAdapterParameters = {
      $codeVerifier: null,
      $state: null,
      $nonce: null,
      $idToken: null,
      $accessToken: null,
      $refreshToken: null,
    };
    for (const [key, value] of Object.entries(session)) {
      if (value) {
        params[`$${key}`] = value;
      }
    }
    return params;
  };

  /**
   * Convert record to internal data
   * @param record Session record
   * @returns Session data
   */
  protected recordToSession = (
    record: SQLiteAdapterRecord,
  ): OIDCClientSession => {
    const session = {} as Record<keyof OIDCClientSession, string | number>;
    for (const [key, value] of Object.entries(record) as [
      keyof OIDCClientSession,
      string | number | null,
    ][]) {
      if (value) {
        session[key] = value;
      }
    }
    return session as OIDCClientSession;
  };

  /**
   * Fetch session
   * @param sessionId Session ID
   */
  public fetch = (sessionId: string): OIDCClientSession | null => {
    const result = this.fetchQuery.get(sessionId);
    return result ? this.recordToSession(result) : null;
  };

  /**
   * Insert session
   * @param session Session
   */
  public insert = (session: OIDCClientSession): void => {
    this.insertQuery.run(this.sessionToParameters(session));
  };

  /**
   * Update session
   * @param session Session
   */
  public update = (session: OIDCClientSession): void => {
    this.updateQuery.run(this.sessionToParameters(session));
  };

  /**
   * Delete session
   * @param sessionId Session ID
   */
  public delete = (sessionId: string): void => {
    this.deleteQuery.run(sessionId);
  };

  /** Prune expired sessions */
  public prune = () => {
    this.pruneQuery.run(Date.now());
  };

  /** Close database */
  public close = (): void => {
    this.db.close();
  };
}
