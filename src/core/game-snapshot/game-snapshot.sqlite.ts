import { type Database } from "bun:sqlite";

export function initializeGameSnapshotSchema(db: Database) {
  db.run(`
    CREATE TABLE IF NOT EXISTS game_snapshot (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id TEXT NOT NULL,
      status TEXT NOT NULL,
      received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      raw_data TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_game_snapshots_game_id ON game_snapshot(game_id);
    CREATE INDEX IF NOT EXISTS idx_game_snapshots_received_at ON game_snapshot(received_at);
  `);
}
