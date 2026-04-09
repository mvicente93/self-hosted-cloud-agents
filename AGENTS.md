# self-hosted-cloud-agents

## Run Commands

- Root entry: `bun run index.ts`
- UI dev server: `bun run dev` (from `apps/ui`)

## Toolchain

- **Runtime**: Bun v1.3.11
- **Lint/Format**: Biome (referenced via catalog in package.json)
- **UI Framework**: SolidJS + Vite + TailwindCSS

## Architecture

- **Monorepo** with Bun workspaces: `apps/*`
- Root `index.ts` is the main entry point
- `apps/ui` is the frontend app (SolidJS + Vite + TailwindCSS)

## Notes

- No test framework configured
- No CI workflows present
