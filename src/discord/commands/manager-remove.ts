import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import { Manager } from "@/core/manager/manager";

const ADMIN_USER_ID = Bun.env.DISCORD_ADMIN_USER_ID;

export const data = new SlashCommandBuilder()
  .setName("manager-remove")
  .setDescription("Remove a tournament manager (admin only)")
  .addUserOption((option) =>
    option
      .setName("user")
      .setDescription("The user to remove as a manager")
      .setRequired(true)
  );

export async function execute(interaction: CommandInteraction) {
  if (interaction.user.id !== ADMIN_USER_ID) {
    await interaction.reply({
      content: "❌ Only the admin can remove managers.",
      flags: 64, // ephemeral
    });
    return;
  }

  if (!interaction.isChatInputCommand()) return;

  const user = interaction.options.getUser("user", true);
  const discordId = user.id;

  if (!Manager.discordIds.has(discordId)) {
    await interaction.reply({
      content: `❌ ${user.username} is not a manager.`,
      flags: 64, // ephemeral
    });
    return;
  }

  Manager.remove({ discordId });

  await interaction.reply({
    content: `✅ Successfully removed ${user.username} as a tournament manager.`,
    flags: 64, // ephemeral
  });
}
