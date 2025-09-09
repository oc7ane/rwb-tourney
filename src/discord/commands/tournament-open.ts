import {
  SlashCommandBuilder,
  CommandInteraction,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  EmbedBuilder,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("tournament-open")
  .setDescription("Open tournament registration");

export async function execute(interaction: CommandInteraction) {
  const button = new ButtonBuilder()
    .setCustomId("tournament-register")
    .setLabel("Register for Tournament")
    .setStyle(ButtonStyle.Primary)
    .setEmoji("🎮");

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

  const embed = new EmbedBuilder()
    .setTitle("🏆 Tournament Registration Open!")
    .setDescription("Click the button below to register for the tournament.")
    .setColor(0x5865f2)
    .setTimestamp();

  await interaction.reply({
    embeds: [embed],
    components: [row],
  });
}
