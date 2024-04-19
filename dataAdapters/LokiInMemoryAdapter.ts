import type { OIDCClientSession } from "@/types";
import loki from "lokijs";
import { BaseLokiAdapter } from "./BaseLokiAdapter";

export interface LokiInMemoryAdapterOptions {
  /**
   * Database file path
   * @default "sessions.db"
   * @example "/path/to/sessions.db"
   */
  filename: string;
}

const defaultOptions: LokiInMemoryAdapterOptions = {
  filename: "sessions.db",
};

/**
 * In-memory data adapter using LokiJS
 * - Usage: `const dataAdapter = new LokiInMemoryAdapter();`
 * - Requires: `bun add lokijs` and `bun add -D @types/lokijs`
 * @see [LokiJS](https://techfort.github.io/LokiJS/)
 */
export class LokiInMemoryAdapter extends BaseLokiAdapter {
  /** Options */
  options: LokiInMemoryAdapterOptions;

  public constructor(options?: Partial<LokiInMemoryAdapterOptions>) {
    super();
    this.options = {
      ...defaultOptions,
      ...options,
    };

    const { filename } = this.options;

    this.db = new loki(filename);
    this.sessions = this.db.addCollection<OIDCClientSession>("sessions", {
      indices: ["sessionId", "sessionExpiresAt"],
      unique: ["sessionId"],
    });
  }
}
