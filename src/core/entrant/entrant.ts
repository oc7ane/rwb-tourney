import { z } from "zod";
import { fn } from "../fn";
import { db } from "../db/client";

export namespace Entrant {
  export const Info = z.object({
    discordId: z.string(),
    robloxId: z.string(),
    joinedAt: z.date(),
  });

  export type Info = z.infer<typeof Info>;

  const RowSchema = z.object({
    discord_id: z.string(),
    roblox_id: z.string(),
    joined_at: z.string().transform((str) => new Date(str)),
  });

  export const discordIdToInfoMap = new Map<string, Info>();
  export const robloxIdToDiscordIdMap = new Map<string, string>();

  export function init() {
    const stmt = db.prepare(
      `SELECT discord_id, roblox_id, joined_at FROM entrant`
    );
    const rows = stmt.all();

    discordIdToInfoMap.clear();
    robloxIdToDiscordIdMap.clear();

    for (const row of rows) {
      const parsed = RowSchema.parse(row);
      const info: Info = {
        discordId: parsed.discord_id,
        robloxId: parsed.roblox_id,
        joinedAt: parsed.joined_at,
      };
      discordIdToInfoMap.set(info.discordId, info);
      robloxIdToDiscordIdMap.set(info.robloxId, info.discordId);
    }
  }

  export const add = fn(Info, (info) => {
    console.log("Adding entrant:", info);
    discordIdToInfoMap.set(info.discordId, info);
    robloxIdToDiscordIdMap.set(info.robloxId, info.discordId);

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO entrant (discord_id, roblox_id, joined_at)
      VALUES ($discordId, $robloxId, $joinedAt)
    `);
    stmt.run({
      discordId: info.discordId,
      robloxId: info.robloxId,
      joinedAt: info.joinedAt.toISOString(),
    });
  });

  export function get() {
    return Array.from(discordIdToInfoMap.values());
  }

  export function getByDiscordId({ discordId }: { discordId: string }) {
    return discordIdToInfoMap.get(discordId);
  }

  export function getByRobloxId({ robloxId }: { robloxId: string }) {
    return robloxIdToDiscordIdMap.get(robloxId);
  }
}
