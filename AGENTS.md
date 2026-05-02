# self-hosted-cloud-agents

A platform for running coding agents (like opencode or pi) in cloud containers. Users can start agent sessions via the API, which spawns Docker containers running the agent.

## Run Commands

- Root entry: `bun run index.ts`
- UI dev server: `bun run dev` (from `apps/ui`)
- API dev server: `bun run dev` (from `apps/api`)
- Jobs service: `bun run dev` (from `apps/jobs`)

## Toolchain

- **Runtime**: Bun v1.3.11
- **Lint/Format**: Biome (referenced via catalog in package.json)
- **UI Framework**: SolidJS + Vite + TailwindCSS
- **API Framework**: Hono
- **Database**: SQLite with Drizzle ORM

## Architecture

**Monorepo** with Bun workspaces: `apps/*`

### Apps

| App | Description |
|-----|-------------|
| `apps/api` | HTTP API server (Hono) - handles requests like starting sessions |
| `apps/ui` | Frontend app (SolidJS + Vite + TailwindCSS) |
| `apps/db` | Database layer (SQLite + Drizzle ORM) - stores jobs |
| `apps/jobs` | Job processing service - polls and executes pending jobs |
| `apps/docker` | Docker client - manages container lifecycle |

## Notes

- No test framework configured
- No CI workflows present