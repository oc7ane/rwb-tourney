import { Client, GatewayIntentBits } from "discord.js";
import { Glob } from "bun";

const GUILD_ID = Bun.env.GUILD_ID;

if (!GUILD_ID) {
  throw new Error("GUILD_ID not found in environment variables");
}

const commands = new Map();
const buttons = new Map();

const commandGlob = new Glob("**/*.ts");
const commandsPath = `${import.meta.dir}/commands`;

for await (const file of commandGlob.scan(commandsPath)) {
  const command = await import(`./commands/${file}`);
  commands.set(command.data.name, command);
}

const buttonGlob = new Glob("**/*.ts");
const buttonsPath = `${import.meta.dir}/buttons`;

for await (const file of buttonGlob.scan(buttonsPath)) {
  const button = await import(`./buttons/${file}`);
  buttons.set(button.customId, button);
}

export const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.once("clientReady", async () => {
  console.log(`✅ Discord bot logged in as ${client.user?.tag}`);

  const guild = client.guilds.cache.get(GUILD_ID);
  if (!guild) {
    console.error(`❌ Could not find guild ${GUILD_ID}`);
    return;
  }

  for (const command of commands.values()) {
    await guild.commands.create(command.data);
  }

  console.log(`✅ Registered ${commands.size} commands`);
});

client.on("interactionCreate", async (interaction) => {
  try {
    if (interaction.isCommand()) {
      const command = commands.get(interaction.commandName);
      await command?.execute(interaction);
    } else if (interaction.isButton()) {
      const button = buttons.get(interaction.customId);
      await button?.execute(interaction);
    }
  } catch (error) {
    console.error("Interaction error:", error);
  }
});

export async function startBot() {
  const token = Bun.env.DISCORD_TOKEN;
  if (!token) {
    throw new Error("DISCORD_TOKEN not found in environment variables");
  }

  await client.login(token);
}
