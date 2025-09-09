import { type Database } from "bun:sqlite";

export function initializeManagerSchema(db: Database) {
  db.run(`
    CREATE TABLE IF NOT EXISTS manager (
      discord_id TEXT PRIMARY KEY
    );
  `);
}
