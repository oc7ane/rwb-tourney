import { type Database } from "bun:sqlite";

export function initializeEntrantSchema(db: Database) {
  db.run(`
    CREATE TABLE IF NOT EXISTS entrant (
      discord_id TEXT PRIMARY KEY,
      roblox_id TEXT NOT NULL UNIQUE,
      joined_at TIMESTAMP NOT NULL
    );
    
    CREATE INDEX IF NOT EXISTS idx_entrant_roblox_id ON entrant(roblox_id);
  `);
}
