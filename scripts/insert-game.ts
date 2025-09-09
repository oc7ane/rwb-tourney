import { redis } from "bun";

// Constants
const GAME_KEY_PREFIX = "game:";

// Create Redis client
const client = redis;

// Store a game and publish update (write operation moved from redis-client.ts)
async function setGame(game: any): Promise<void> {
  const key = `${GAME_KEY_PREFIX}${game.gameId}`;
  const gameJson = JSON.stringify(game);

  // Store the game
  await client.set(key, gameJson);

  // Push to a list for subscribers (instead of pub/sub)
  await client.send("LPUSH", ["game:updates", gameJson]);
}

// Example game data - raw format as it would come from Roblox
const ongoingGameRaw = {
  gameId: Bun.randomUUIDv7(),
  status: "ongoing" as const,
  startTime: new Date().toISOString(),
  endTime: undefined,
  serverType: "reserved" as const,
  gameMode: "default" as const,
  generationType: "default" as const,
  players: [
    { id: "player-1" },
    { id: "player-2" },
    { id: "player-3" },
    { id: "player-4" },
  ],
};

const completedGameRaw = {
  gameId: Bun.randomUUIDv7(),
  status: "completed" as const,
  startTime: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
  endTime: new Date().toISOString(),
  serverType: "reserved" as const,
  gameMode: "default" as const,
  generationType: "default" as const,
  players: [
    { id: "player-5", position: 1 },
    { id: "player-6", position: 2 },
    { id: "player-7", position: 3 },
    { id: "player-8", position: 4 },
  ],
};

async function insertExampleGames() {
  console.log("📝 Inserting example games into Redis...");

  try {
    // Insert ongoing game
    await setGame(ongoingGameRaw);
    console.log(`✅ Inserted ongoing game: ${ongoingGameRaw.gameId}`);

    // Wait a bit to ensure the first message is processed
    await Bun.sleep(100);

    // Insert completed game
    await setGame(completedGameRaw);
    console.log(`✅ Inserted completed game: ${completedGameRaw.gameId}`);

    console.log(
      "\n🎮 Games successfully inserted and published to subscribers!"
    );
  } catch (error) {
    console.error("❌ Error inserting games:", error);
    process.exit(1);
  }

  await Bun.sleep(500);
  process.exit(0);
}

insertExampleGames();
