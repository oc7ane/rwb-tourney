import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import { Entrant } from "@/core/entrant/entrant";
import { Manager } from "@/core/manager/manager";

const ADMIN_USER_ID = Bun.env.DISCORD_ADMIN_USER_ID;

export const data = new SlashCommandBuilder()
  .setName("entrant-remove")
  .setDescription("Remove an entrant from the tournament (manager only)")
  .addUserOption((option) =>
    option
      .setName("user")
      .setDescription("The Discord user to remove")
      .setRequired(true)
  );

export async function execute(interaction: CommandInteraction) {
  // Check if user is admin or manager
  const userId = interaction.user.id;
  if (userId !== ADMIN_USER_ID && !Manager.discordIds.has(userId)) {
    await interaction.reply({
      content: "❌ Only admins and managers can remove entrants.",
      flags: 64, // ephemeral
    });
    return;
  }

  if (!interaction.isChatInputCommand()) return;

  const user = interaction.options.getUser("user", true);
  const discordId = user.id;

  // Check if user is registered
  const entrant = Entrant.getByDiscordId({ discordId });
  if (!entrant) {
    await interaction.reply({
      content: `❌ ${user.username} is not registered for the tournament.`,
      flags: 64, // ephemeral
    });
    return;
  }

  // Remove from maps (we don't have a remove function yet, so we'll do it manually)
  Entrant.discordIdToInfoMap.delete(discordId);
  Entrant.robloxIdToDiscordIdMap.delete(entrant.robloxId);

  const totalEntrants = Entrant.discordIdToInfoMap.size;

  await interaction.reply({
    content: `✅ Successfully removed ${user.username} from the tournament.\n📊 Total entrants: ${totalEntrants}`,
    flags: 64, // ephemeral
  });
}