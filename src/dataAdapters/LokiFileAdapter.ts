import type { OIDCClientSession } from "@/types";
import loki from "lokijs";
import { BaseLokiAdapter } from "./BaseLokiAdapter";

export interface LokiFileAdapterOptions {
  /**
   * Database file path
   * @default "sessions.db"
   * @example "/path/to/sessions.db"
   */
  filename: string;
  /**
   * Save interval for file database (ms)
   * @default 10000
   */
  autosaveInterval: number;
  /**
   * Max waiting time to init database (ms)
   * @default 10000
   */
  initMaxWaitTime: number;
}

const defaultOptions: LokiFileAdapterOptions = {
  filename: "sessions.db",
  autosaveInterval: 10000,
  initMaxWaitTime: 10000,
};

/**
 * File-system data adapter using LokiJS
 * - Usage: `const dataAdapter = await LokiFileAdapter.create();`
 * - Requires: `bun add lokijs` and `bun add -D @types/lokijs`
 * @see [LokiJS](https://techfort.github.io/LokiJS/)
 */
export class LokiFileAdapter extends BaseLokiAdapter {
  /** Options */
  options: LokiFileAdapterOptions;

  protected constructor(options?: Partial<LokiFileAdapterOptions>) {
    super();
    this.options = {
      ...defaultOptions,
      ...options,
    };

    const { filename, autosaveInterval } = this.options;

    this.db = new loki(filename, {
      autoload: true,
      autoloadCallback: () => {
        this.sessions = this.db.getCollection<OIDCClientSession>("sessions");
        if (!this.sessions) {
          this.sessions = this.db.addCollection<OIDCClientSession>("sessions", {
            indices: ["sessionId", "sessionExpiresAt"],
            unique: ["sessionId"],
          });
        }
      },
      autosave: true,
      autosaveInterval,
      autosaveCallback: () => {
        // Remove expired sessions
        this.prune();
      },
    });
  }

  /**
   * Async constructor
   * @param options LokiFileAdapterOptions
   * @returns LokiFileAdapter instance
   */
  static async create(options?: Partial<LokiFileAdapterOptions>) {
    const instance = new LokiFileAdapter(options);
    await instance.initialize();
    return instance;
  }

  /**
   * Part of async constructor
   * @returns Promise<void>
   */
  protected initialize = async () => {
    const { initMaxWaitTime } = this.options;
    if (!this.initPromise) {
      this.initPromise = new Promise<void>((resolve, reject) => {
        if (this.sessions) {
          resolve();
        }
        const interval = setInterval(() => {
          if (this.sessions) {
            clearInterval(interval);
            resolve();
          } else if (Date.now() - startTime > initMaxWaitTime) {
            clearInterval(interval);
            reject(new Error());
          }
        }, 100);
        const startTime = Date.now();
      }).catch(() => {
        throw new Error("Database not available within timeout");
      });
    }
    return this.initPromise;
  };

  /** Flag for wait for sessions */
  protected initPromise: Promise<void> | null = null;
}
