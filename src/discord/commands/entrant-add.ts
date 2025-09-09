import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import { Entrant } from "@/core/entrant/entrant";
import { Manager } from "@/core/manager/manager";
import { Roblox } from "@/core/roblox";

const ADMIN_USER_ID = Bun.env.DISCORD_ADMIN_USER_ID;

export const data = new SlashCommandBuilder()
  .setName("entrant-add")
  .setDescription("Manually add an entrant to the tournament (manager only)")
  .addUserOption((option) =>
    option
      .setName("user")
      .setDescription("The Discord user to add")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("robloxid")
      .setDescription("The Roblox user ID")
      .setRequired(true)
  );

export async function execute(interaction: CommandInteraction) {
  // Check if user is admin or manager
  const userId = interaction.user.id;
  if (userId !== ADMIN_USER_ID && !Manager.discordIds.has(userId)) {
    await interaction.reply({
      content: "❌ Only admins and managers can add entrants.",
      flags: 64, // ephemeral
    });
    return;
  }

  if (!interaction.isChatInputCommand()) return;

  const user = interaction.options.getUser("user", true);
  const discordId = user.id;
  const robloxId = interaction.options.getString("robloxid", true);

  // Check if already registered
  const existing = Entrant.getByDiscordId({ discordId });
  if (existing) {
    await interaction.reply({
      content: `❌ ${user.username} is already registered for the tournament!`,
      flags: 64, // ephemeral
    });
    return;
  }

  // Check if Roblox ID is already registered
  const existingRobloxId = Entrant.getByRobloxId({ robloxId });
  if (existingRobloxId) {
    await interaction.reply({
      content: `❌ This Roblox ID is already registered to another Discord user!`,
      flags: 64, // ephemeral
    });
    return;
  }

  // Get Roblox username for display
  const robloxUser = await Roblox.getUser(robloxId);
  if (!robloxUser) {
    await interaction.reply({
      content: `❌ Invalid Roblox ID: ${robloxId}`,
      flags: 64, // ephemeral
    });
    return;
  }

  const entrant: Entrant.Info = {
    discordId,
    robloxId,
    joinedAt: new Date(),
  };

  Entrant.add(entrant);

  const totalEntrants = Entrant.discordIdToInfoMap.size;
  const userDisplay = `${robloxUser.displayName} (${robloxUser.name})`;

  // Reply to the manager/admin who added the entrant
  await interaction.reply({
    content: `✅ Successfully added ${user.username} to the tournament!\n🎮 Roblox Account: ${userDisplay}\n📊 Total entrants: ${totalEntrants}`,
    flags: 64, // ephemeral - only visible to the person who used the command
  });

  // Optional: Send a DM to the added user (uncomment if desired)
  // try {
  //   await user.send(`🎉 You've been registered for the tournament by ${interaction.user.username}!\n🎮 Roblox Account: ${userDisplay}`);
  // } catch (error) {
  //   console.log(`Could not DM ${user.username}`);
  // }
}