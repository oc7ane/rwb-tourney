import { z } from "zod";

export namespace Bloxlink {
  const GUILD_ID = Bun.env.BLOXLINK_GUILD_ID;

  const SuccessResponse = z.object({
    robloxID: z.string(),
    resolved: z.any().optional(),
  });

  const ErrorResponse = z.object({
    error: z.string(),
  });

  const Response = z.union([SuccessResponse, ErrorResponse]);

  export type SuccessResponse = z.infer<typeof SuccessResponse>;
  export type ErrorResponse = z.infer<typeof ErrorResponse>;
  export type Response = z.infer<typeof Response>;

  export async function get(discordUserId: string) {
    // Mock return for testing
    /*return {
      robloxID: "9008204223",
    };*/

    const url = `https://api.blox.link/v4/public/guilds/${GUILD_ID}/discord-to-roblox/${discordUserId}`;

    const response = await fetch(url, {
      headers: {
        Authorization: Bun.env.BLOXLINK_KEY || "",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Bloxlink API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return Response.parse(data);
  }
}
