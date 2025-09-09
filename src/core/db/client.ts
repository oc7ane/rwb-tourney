import { Database } from "bun:sqlite";
import { initializeEntrantSchema } from "../entrant/entrant.sqlite";
import { initializeGameSnapshotSchema } from "../game-snapshot/game-snapshot.sqlite";
import { initializeManagerSchema } from "../manager/manager.sqlite";

export const db = new Database("tourney.db", {
  create: true,
  strict: true,
});

db.run("PRAGMA journal_mode = WAL;");
db.run("PRAGMA foreign_keys = ON;");

initializeEntrantSchema(db);
initializeGameSnapshotSchema(db);
initializeManagerSchema(db);
