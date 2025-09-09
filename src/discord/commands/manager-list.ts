import {
  SlashCommandBuilder,
  CommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Manager } from "@/core/manager/manager";

const ADMIN_USER_ID = Bun.env.DISCORD_ADMIN_USER_ID;

export const data = new SlashCommandBuilder()
  .setName("manager-list")
  .setDescription("List all tournament managers (admin only)");

export async function execute(interaction: CommandInteraction) {
  if (interaction.user.id !== ADMIN_USER_ID) {
    await interaction.reply({
      content: "❌ Only the admin can view managers.",
      flags: 64, // ephemeral
    });
    return;
  }

  const managers = Manager.get();

  if (managers.length === 0) {
    await interaction.reply({
      content: "📋 No managers have been added yet.",
      flags: 64, // ephemeral
    });
    return;
  }

  const embed = new EmbedBuilder()
    .setTitle("🛡️ Tournament Managers")
    .setDescription(`Total: ${managers.length}`)
    .setColor(0x5865f2)
    .setTimestamp();

  const managerList = managers
    .map((discordId, index) => `${index + 1}. <@${discordId}>`)
    .join("\n");

  embed.addFields({
    name: "Managers",
    value: managerList || "None",
    inline: false,
  });

  await interaction.reply({
    embeds: [embed],
    flags: 64, // ephemeral
  });
}
