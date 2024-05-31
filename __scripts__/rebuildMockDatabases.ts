import fs from "node:fs";
import { LokiFileAdapter } from "@/dataAdapters/LokiFileAdapter";
import { LowdbAdapter } from "@/dataAdapters/LowdbAdapter";
import { SQLiteAdapter } from "@/dataAdapters/SQLiteAdapter";
import {
  lokiMockFile,
  lowMockFile,
  mockActiveSession,
  sqliteMockFile,
} from "@mock/const";
import { sleep } from "bun";

// SQLite
if (fs.existsSync(sqliteMockFile)) {
  fs.unlinkSync(sqliteMockFile);
}

const sqlite = new SQLiteAdapter({
  filename: sqliteMockFile,
});
sqlite.insert(mockActiveSession);
sqlite.close();

// Lowdb
if (fs.existsSync(lowMockFile)) {
  fs.unlinkSync(lowMockFile);
}

const lowdb = await LowdbAdapter.create({
  filename: lowMockFile,
});
await lowdb.insert(mockActiveSession);
await sleep(100);
await lowdb.close();

// LokiJS
if (fs.existsSync(lokiMockFile)) {
  fs.unlinkSync(lokiMockFile);
}

const loki = await LokiFileAdapter.create({
  filename: lokiMockFile,
  autosaveInterval: 500,
});
loki.insert(mockActiveSession);
await sleep(1000);
loki.close();
