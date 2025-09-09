import { client } from "@/discord/bot";
import { subscribeToGames } from "./redis-client";
import { Game } from "@/core/game";
import { EmbedBuilder, TextChannel } from "discord.js";

export async function startGameNotifier() {
  const channelId = Bun.env.DISCORD_CHANNEL_ID;

  if (!channelId) {
    console.error("❌ DISCORD_CHANNEL_ID not found in environment variables");
    return;
  }

  // Wait for client to be ready
  if (!client.isReady()) {
    await new Promise((resolve) => client.once("clientReady", resolve));
  }

  const channel = await client.channels.fetch(channelId);

  if (!channel || !channel.isTextBased()) {
    console.error(`❌ Channel ${channelId} not found or is not a text channel`);
    return;
  }

  const textChannel = channel as TextChannel;

  console.log(`📨 Starting game notifier for channel: #${textChannel.name}`);

  // Subscribe to game updates
  const unsubscribe = await subscribeToGames(async (game: Game.Info) => {
    // Only send messages for completed games
    if (game.status !== "completed") {
      return;
    }

    try {
      const duration = Math.round(
        (game.endTime.getTime() - game.startTime.getTime()) / 1000 / 60
      );

      const embed = new EmbedBuilder()
        .setTitle("🏁 Game Completed!")
        .setColor(0x00ff00)
        .addFields(
          { name: "Game ID", value: game.gameId, inline: true },
          { name: "Mode", value: game.gameMode, inline: true },
          { name: "Server Type", value: game.serverType, inline: true },
          { name: "Duration", value: `${duration} minutes`, inline: true },
          {
            name: "Players",
            value: `${game.players.length} players`,
            inline: true,
          }
        )
        .setTimestamp(game.endTime);

      // Add top 3 placements if available
      const topThree = game.players
        .filter((p) => p.position <= 3)
        .sort((a, b) => a.position - b.position)
        .map(
          (p) =>
            `${p.position === 1 ? "🥇" : p.position === 2 ? "🥈" : "🥉"} #${
              p.position
            }: Player ${p.id}`
        )
        .join("\n");

      if (topThree) {
        embed.addFields({
          name: "Top Players",
          value: topThree,
          inline: false,
        });
      }

      await textChannel.send({ embeds: [embed] });

      console.log(`✅ Sent notification for completed game: ${game.gameId}`);
    } catch (error) {
      console.error(`❌ Failed to send game notification:`, error);
    }
  });

  // Return unsubscribe function for cleanup
  return unsubscribe;
}
