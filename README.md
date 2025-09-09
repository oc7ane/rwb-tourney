# rwb-tourney

## Setup guide

1. Install dependencies:

```bash
bun install
```

2. Create .env (use .env.example as a reference)

3. Start docker for redis:

```bash
bun run docker:up
```

4. Run server

```bash
bun run dev
```

5. Insert test games, watch them come through in discord

```bash
bun run redis:insert
```

If you need to clean the db for testing:

```bash
bun run db:clean
```

## Bot commands

### Public

- `/tournament-open` - Opens registration with button. Users can click to join the tourney

### Admin Only

- `/manager-add <user>` - Add tournament manager
- `/manager-remove <user>` - Remove tournament manager
- `/manager-list` - List all managers

### Manager/Admin

- `/entrant-add <user> <robloxid>` - Manually add entrant
- `/entrant-remove <user>` - Remove entrant
- `/entrant-list [search]` - List entrants (paginated)
