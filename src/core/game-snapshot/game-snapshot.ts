import z from "zod";
import { db } from "@/core/db/client";

export namespace GameSnapshot {
  const Ongoing = z.object({
    _id: z.any().optional(),
    gameId: z.string(),
    status: z.literal("ongoing"),
    startTime: z.string().transform((str) => new Date(str)),
    endTime: z.undefined(),
    serverType: z.literal("reserved"),
    gameMode: z.literal("default"),
    generationType: z.literal("default"),
    players: z.array(
      z.object({
        id: z.string(),
      })
    ),
  });

  const Completed = z.object({
    _id: z.any().optional(),
    gameId: z.string(),
    status: z.literal("completed"),
    startTime: z.string().transform((str) => new Date(str)),
    endTime: z.string().transform((str) => new Date(str)),
    serverType: z.literal("reserved"),
    gameMode: z.literal("default"),
    generationType: z.literal("default"),
    players: z.array(
      z.object({
        id: z.string(),
        position: z.number(),
      })
    ),
  });

  export const Info = z.discriminatedUnion("status", [Ongoing, Completed]);

  export type Ongoing = z.infer<typeof Ongoing>;
  export type Completed = z.infer<typeof Completed>;
  export type Info = z.infer<typeof Info>;

  export function add(snapshot: Info) {
    const stmt = db.prepare(`
      INSERT INTO game_snapshot (game_id, status, raw_data)
      VALUES ($gameId, $status, $rawData)
    `);

    stmt.run({
      gameId: snapshot.gameId,
      status: snapshot.status,
      rawData: JSON.stringify(snapshot),
    });
  }

  export function getAll() {
    const stmt = db.prepare(`
      SELECT * FROM game_snapshot
      ORDER BY received_at ASC
    `);

    const rows = stmt.all() as Array<{
      id: number;
      game_id: string;
      status: string;
      received_at: string;
      raw_data: string;
    }>;

    return rows.map((row) => Info.parse(JSON.parse(row.raw_data)));
  }
}
