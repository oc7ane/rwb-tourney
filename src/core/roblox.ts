import { z } from "zod";

export namespace Roblox {
  const UserResponse = z.object({
    id: z.number(),
    name: z.string(),
    displayName: z.string(),
    description: z.string(),
    created: z.string(),
    isBanned: z.boolean(),
    externalAppDisplayName: z.string().nullable(),
    hasVerifiedBadge: z.boolean(),
  });

  export type UserResponse = z.infer<typeof UserResponse>;

  export interface UserNames {
    name: string;
    displayName: string;
  }

  const robloxIdToUserNamesMap = new Map<string, UserNames>();

  export async function getUser(userId: string) {
    const cached = robloxIdToUserNamesMap.get(userId);
    if (cached) {
      return cached;
    }

    const url = `https://users.roblox.com/v1/users/${userId}`;

    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(
        `Roblox API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    const parsed = UserResponse.parse(data);

    const names: UserNames = {
      name: parsed.name,
      displayName: parsed.displayName,
    };
    robloxIdToUserNamesMap.set(userId, names);

    return names;
  }
}
