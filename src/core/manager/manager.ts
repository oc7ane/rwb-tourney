import z from "zod";
import { fn } from "../fn";
import { db } from "../db/client";

export namespace Manager {
  export const Info = z.object({
    discordId: z.string(),
  });

  export const RowSchema = z.object({
    discord_id: z.string(),
  });

  export const discordIds = new Set<string>();

  export function init() {
    const stmt = db.prepare(`SELECT discord_id FROM manager`);
    const rows = stmt.all();

    discordIds.clear();
    for (const row of rows) {
      const parsed = RowSchema.parse(row);
      discordIds.add(parsed.discord_id);
    }
  }

  export const add = fn(Info, (input) => {
    discordIds.add(input.discordId);

    const stmt = db.prepare(`
        INSERT OR IGNORE INTO manager (discord_id)
        VALUES ($discordId)
      `);
    stmt.run({ discordId: input.discordId });
  });

  export const remove = fn(Info, (input) => {
    discordIds.delete(input.discordId);

    const stmt = db.prepare(`
        DELETE FROM manager WHERE discord_id = $discordId
      `);
    stmt.run({ discordId: input.discordId });
  });

  export function get() {
    return Array.from(discordIds);
  }
}
