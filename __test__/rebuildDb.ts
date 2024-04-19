import fs from "node:fs";
import { sleep } from "bun";
import { LokiFileAdapter } from "../dataAdapters/LokiFileAdapter";
import { SQLiteAdapter } from "../dataAdapters/SQLiteAdapter";
import { lokiTestFile, mockActiveSession, sqliteTestFile } from "./const";

// SQLite
if (fs.existsSync(sqliteTestFile)) {
  fs.unlinkSync(sqliteTestFile);
}

const sl = new SQLiteAdapter({
  filename: sqliteTestFile,
});
sl.insert(mockActiveSession);
sl.close();

// LokiJS
if (fs.existsSync(lokiTestFile)) {
  fs.unlinkSync(lokiTestFile);
}

const lj = await LokiFileAdapter.create({
  filename: lokiTestFile,
  autosaveInterval: 500,
});
lj.insert(mockActiveSession);
await sleep(1000);
lj.close();
