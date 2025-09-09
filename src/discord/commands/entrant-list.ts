import { 
  SlashCommandBuilder, 
  CommandInteraction, 
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder
} from "discord.js";
import { Entrant } from "@/core/entrant/entrant";
import { Manager } from "@/core/manager/manager";
import { Roblox } from "@/core/roblox";

const ADMIN_USER_ID = Bun.env.DISCORD_ADMIN_USER_ID;
const ENTRANTS_PER_PAGE = 10;

export const data = new SlashCommandBuilder()
  .setName("entrant-list")
  .setDescription("List all tournament entrants (manager only)")
  .addStringOption((option) =>
    option
      .setName("search")
      .setDescription("Search by Discord username or Roblox ID")
      .setRequired(false)
  );

export async function execute(interaction: CommandInteraction) {
  // Check if user is admin or manager
  const userId = interaction.user.id;
  if (userId !== ADMIN_USER_ID && !Manager.discordIds.has(userId)) {
    await interaction.reply({
      content: "❌ Only admins and managers can view the entrant list.",
      flags: 64, // ephemeral
    });
    return;
  }

  if (!interaction.isChatInputCommand()) return;

  await interaction.deferReply({ flags: 64 }); // ephemeral

  let entrants = Entrant.get();
  const searchTerm = interaction.options.getString("search");

  // Filter if search term provided
  if (searchTerm) {
    entrants = entrants.filter(e => 
      e.discordId.includes(searchTerm) || 
      e.robloxId.includes(searchTerm)
    );
  }

  if (entrants.length === 0) {
    await interaction.editReply({
      content: searchTerm 
        ? `📋 No entrants found matching "${searchTerm}".`
        : "📋 No entrants have registered yet.",
    });
    return;
  }

  // Calculate pages
  const totalPages = Math.ceil(entrants.length / ENTRANTS_PER_PAGE);
  let currentPage = 0;

  async function generateEmbed(page: number) {
    const start = page * ENTRANTS_PER_PAGE;
    const end = start + ENTRANTS_PER_PAGE;
    const pageEntrants = entrants.slice(start, end);

    const embed = new EmbedBuilder()
      .setTitle("🏆 Tournament Entrants")
      .setDescription(`${searchTerm ? `Search: "${searchTerm}"\n` : ""}Total: ${entrants.length}`)
      .setColor(0x5865f2)
      .setFooter({ text: `Page ${page + 1} of ${totalPages}` })
      .setTimestamp();

    // Build entrant list with Roblox usernames
    const entrantList: string[] = [];
    
    for (const [index, entrant] of pageEntrants.entries()) {
      const robloxUser = await Roblox.getUser(entrant.robloxId);
      const robloxDisplay = robloxUser 
        ? `${robloxUser.displayName} (${robloxUser.name})`
        : `ID: ${entrant.robloxId}`;
      
      entrantList.push(`${start + index + 1}. <@${entrant.discordId}> - ${robloxDisplay}`);
    }

    embed.addFields({
      name: `Entrants (${start + 1}-${Math.min(end, entrants.length)})`,
      value: entrantList.join("\n") || "None",
      inline: false,
    });

    return embed;
  }

  function generateButtons(page: number) {
    const row = new ActionRowBuilder<ButtonBuilder>();
    
    const prevButton = new ButtonBuilder()
      .setCustomId("entrant-list-prev")
      .setLabel("Previous")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(page === 0);
    
    const nextButton = new ButtonBuilder()
      .setCustomId("entrant-list-next")
      .setLabel("Next")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(page === totalPages - 1);
    
    row.addComponents(prevButton, nextButton);
    return row;
  }

  const embed = await generateEmbed(currentPage);
  const buttons = totalPages > 1 ? generateButtons(currentPage) : null;

  const response = await interaction.editReply({
    embeds: [embed],
    components: buttons ? [buttons] : [],
  });

  if (totalPages > 1) {
    // Set up collector for button interactions
    const collector = response.createMessageComponentCollector({
      time: 300000, // 5 minutes
      filter: (i) => i.user.id === interaction.user.id,
    });

    collector.on("collect", async (i) => {
      if (i.customId === "entrant-list-prev") {
        currentPage--;
      } else if (i.customId === "entrant-list-next") {
        currentPage++;
      }

      const newEmbed = await generateEmbed(currentPage);
      const newButtons = generateButtons(currentPage);

      await i.update({
        embeds: [newEmbed],
        components: [newButtons],
      });
    });

    collector.on("end", async () => {
      // Disable buttons when collector expires
      try {
        await interaction.editReply({
          components: [],
        });
      } catch (error) {
        // Message may have been deleted
      }
    });
  }
}