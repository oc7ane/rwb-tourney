import { ButtonInteraction } from "discord.js";
import { Bloxlink } from "@/core/bloxlink";
import { Entrant } from "@/core/entrant/entrant";
import { Roblox } from "@/core/roblox";

export const customId = "tournament-register";

export async function execute(interaction: ButtonInteraction) {
  await interaction.deferReply({ flags: 64 }); // ephemeral

  const discordId = interaction.user.id;

  try {
    const existing = Entrant.getByDiscordId({ discordId });
    if (existing) {
      await interaction.editReply({
        content: "❌ You are already registered for the tournament!",
      });
      return;
    }

    const bloxlinkResponse = await Bloxlink.get(discordId);

    if ("error" in bloxlinkResponse) {
      await interaction.editReply({
        content:
          "❌ Your Discord account is not linked with Bloxlink. Please link your account at https://blox.link and try again.",
      });
      return;
    }

    const entrant: Entrant.Info = {
      discordId,
      robloxId: bloxlinkResponse.robloxID,
      joinedAt: new Date(),
    };

    console.log("Adding entrant:", entrant);

    Entrant.add(entrant);

    const totalEntrants = Entrant.discordIdToInfoMap.size;

    // Get Roblox username for display
    const robloxUser = await Roblox.getUser(bloxlinkResponse.robloxID);
    const userDisplay = robloxUser 
      ? `${robloxUser.displayName} (${robloxUser.name})`
      : "Unknown User";

    await interaction.editReply({
      content: `✅ Successfully registered for the tournament!\n🎮 Roblox Account: ${userDisplay}\n📊 You are entrant #${totalEntrants}`,
    });
  } catch (error) {
    console.error("Registration error:", error);
    await interaction.editReply({
      content:
        "❌ An error occurred during registration. Please try again later.",
    });
  }
}
