import { GameSnapshot } from "@/core/game-snapshot/game-snapshot";

export namespace Game {
  export const Info = GameSnapshot.Info;
  export type Info = GameSnapshot.Info;

  export const gameIdToInfoMap = new Map<string, GameSnapshot.Info>();

  function shouldUpdateGame(
    existing: GameSnapshot.Info | undefined,
    incoming: GameSnapshot.Info
  ): boolean {
    // Update if:
    // 1. No existing entry for this gameId
    // 2. Existing entry is "ongoing" and new snapshot is "completed"
    return (
      !existing ||
      (existing.status === "ongoing" && incoming.status === "completed")
    );
  }

  export function init() {
    const snapshots = GameSnapshot.getAll();

    gameIdToInfoMap.clear();

    for (const snapshot of snapshots) {
      const existing = gameIdToInfoMap.get(snapshot.gameId);

      if (shouldUpdateGame(existing, snapshot)) {
        gameIdToInfoMap.set(snapshot.gameId, snapshot);
      }
    }
  }

  export function add(snapshot: GameSnapshot.Info) {
    // Always add to snapshot db
    GameSnapshot.add(snapshot);

    const existing = gameIdToInfoMap.get(snapshot.gameId);
    if (shouldUpdateGame(existing, snapshot)) {
      gameIdToInfoMap.set(snapshot.gameId, snapshot);
    }
  }

  export function get(gameId: string) {
    return gameIdToInfoMap.get(gameId);
  }
}
