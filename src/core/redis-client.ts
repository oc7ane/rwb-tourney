import { redis, RedisClient } from "bun";
import { Game } from "@/core/game";

// Constants
const GAME_KEY_PREFIX = "game:";

// Create the main Redis client (uses REDIS_URL env var or defaults to localhost)
const client = redis;

// Setup connection handlers
client.onconnect = () => {
  console.log("✅ Connected to Redis");
};

client.onclose = (error) => {
  console.error("❌ Redis connection closed:", error);
};

// Get a game by ID (read-only)
export async function getGame(gameId: string) {
  const key = `${GAME_KEY_PREFIX}${gameId}`;
  const gameJson = await client.get(key);

  if (!gameJson) return null;

  // Parse and validate with Zod
  const parsed = JSON.parse(gameJson);
  return Game.Info.parse(parsed);
}

// Get all games (read-only, with optional status filter)
export async function getAllGames(
  status?: "ongoing" | "completed"
) {
  const pattern = `${GAME_KEY_PREFIX}*`;
  const keys = (await client.send("KEYS", [pattern])) as string[];

  if (keys.length === 0) return [];

  const games = [];

  for (const key of keys) {
    const gameJson = await client.get(key);
    if (gameJson) {
      try {
        const parsed = JSON.parse(gameJson);
        const game = Game.Info.parse(parsed);

        if (!status || game.status === status) {
          games.push(game);
        }
      } catch (error) {
        console.error(`Failed to parse game from key ${key}:`, error);
      }
    }
  }

  return games;
}

// Subscribe to game updates using list blocking pop
export async function subscribeToGames(
  callback: (game: Game.Info) => void
) {
  // Create a separate client for subscription
  const subClient = new RedisClient(
    Bun.env.REDIS_URL || "redis://localhost:6379"
  );

  await subClient.connect();

  let running = true;

  // Handle incoming messages
  const handleMessage = async () => {
    console.log("📡 Listening for game updates...");
    console.log(`📍 Connected: ${subClient.connected}`);

    while (running && subClient.connected) {
      try {
        const result = await subClient.send("BRPOP", ["game:updates", "5"]);

        if (result) {
          const [, data] = result; // Ignore list name
          console.log("📝 Raw data received:", data.substring(0, 100) + "...");

          try {
            const parsed = JSON.parse(data);
            const game = Game.Info.parse(parsed);
            console.log(`🎮 Game parsed: ${game.gameId} (${game.status})`);
            callback(game); // Remove unnecessary await
          } catch (error) {
            console.error("Failed to parse game update:", error);
          }
        }
      } catch (error) {
        if (running) {
          console.error("Subscription error:", error);
          await Bun.sleep(1000); // Wait before retrying
        }
      }
    }
  };

  // Start handling messages
  handleMessage();

  // Return unsubscribe function
  return () => {
    running = false;
    subClient.close();
  };
}
