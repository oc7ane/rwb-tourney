import { db } from "@/core/db/client";
import { Entrant } from "@/core/entrant/entrant";
import { Manager } from "@/core/manager/manager";
import { Game } from "@/core/game";
import { startGameNotifier } from "./core/game-notifier";
import { startBot } from "./discord/bot";

async function main() {
  Entrant.init();
  Manager.init();
  Game.init();

  await startBot();

  startGameNotifier();
}

main().catch(console.error);
