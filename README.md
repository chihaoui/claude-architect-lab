# claude-architect-lab

A sandbox project used to prepare for the **Claude Architect** certification. The application is a small Pokémon browser built on top of the public [PokéAPI](https://pokeapi.co/docs/v2) — paginated list with search on `/`, and a detail page on `/pokemon/[name]`. There is no custom backend, no database, and no custom API route: the goal is to keep the surface narrow so the focus stays on Claude Code workflows (skills, sub-agents, hooks, memory) rather than on app plumbing.

## Why this exists

The lab is a deliberately simple Next.js app. Its real purpose is to exercise:

- writing and consuming **agent skills** (`.claude/skills/`) on a real codebase,
- delegating exploration to **sub-agents** without polluting the main context,
- maintaining `CLAUDE.md` / `AGENTS.md` as the single source of truth for agent-facing conventions,
- keeping the URL as the source of truth for shareable application state.

## Tech stack

| Tool | Version | Notes |
| --- | --- | --- |
| Next.js | `16.2.4` | App Router only. Uses `'use cache'`, `cacheLife`, async `params` / `searchParams`. Patterns from Next.js ≤ 14 are obsolete here. |
| React | `19.2.4` | Server Components by default; `use()` on the client to resolve promises. |
| TypeScript | `^5` | `strict: true`, `moduleResolution: "bundler"`, alias `@/*` → repo root. |
| Tailwind CSS | `^4` | Inline config via `@theme` in `app/globals.css`. No `tailwind.config.*`. PostCSS via `@tailwindcss/postcss`. |
| ESLint | `^9` | Flat config (`eslint.config.mjs`) extending `eslint-config-next`. |

No environment variables are required — the PokéAPI is public and unauthenticated.

## Getting started

```bash
npm install
npm run dev      # dev server on http://localhost:3000
npm run build    # production build
npm run start    # serve the production build
npm run lint     # eslint
```

## Architecture

Rendering happens primarily on the server with streaming. The browser never talks to PokéAPI directly; Server Components do.

```
Browser ──▶ Next.js (Server Component) ──▶ pokeapi.co
                       │
                       └─▶ Streamed HTML + RSC payload
```

- **List** (`/`) — server fetch of `pokemon?limit=&offset=`, pagination through search params (`?page=`).
- **Search** — client-side input updates `?q=`; final filtering happens server-side on the cached list (PokéAPI has no full-text search endpoint).
- **Detail** (`/pokemon/[name]`) — dynamic segment, fetches `pokemon/{name}` and `pokemon-species/{name}`.

## Folder structure

```
app/
  layout.tsx              # root layout (Geist fonts)
  globals.css             # Tailwind v4 + inline @theme
  page.tsx                # paginated list + search
  pokemon/
    [name]/
      page.tsx            # detail page
  _components/            # route-private components
lib/
  pokeapi.ts              # typed fetch helpers, error classes, 'use cache'
  types.ts                # shared PokéAPI types
components/
  PokemonTypeBadge.tsx    # shared presentational components
public/                   # static assets
.claude/
  settings.json           # Claude Code harness config
  skills/                 # project-scoped agent skills
```

Conventions:

- `app/` is for routing only (Next.js file conventions: `layout`, `page`, `loading`, `error`, `not-found`).
- Application code lives at the repo root (`lib/`, `components/`) and is imported via the `@/` alias.
- A component used by a single route is colocated under that route's `_components/` folder rather than added to `components/`.
- All PokéAPI calls go through `lib/pokeapi.ts` — components never call `fetch()` directly.
- Shared types live in `lib/types.ts`. No `any`, no `@ts-ignore`.

## Claude Code tooling

Agent-facing conventions are documented in [`CLAUDE.md`](./CLAUDE.md) and [`AGENTS.md`](./AGENTS.md). They override defaults — read them before generating code.

### Skills (`.claude/skills/`)

- **`pokeapi-component`** — scaffolds a React component (Server or Client) that consumes the PokéAPI while honouring project conventions: strict TypeScript, Tailwind-only styling, fetch routed through `lib/pokeapi.ts`, and explicit loading/error states.
- **`code-auditor`** — read-only static analysis. Triggered by phrases such as "audit this", "review the code", "analyze this file". Makes no modifications.

### Sub-agents

- **`code-explorer`** — handles open-ended architectural questions ("how is X wired?", "map this directory") by exploring the codebase in isolation and returning a structured summary, so the main conversation context stays clean.

## References for agents

- Next.js 16 guides: `node_modules/next/dist/docs/01-app/`
- Fetching & streaming: `01-getting-started/06-fetching-data.md`
- Caching (`use cache`, `cacheLife`): `01-getting-started/08-caching.md`
- Instant navigation: `01-app/02-guides/instant-navigation.md`
- File conventions: `01-app/03-api-reference/03-file-conventions/`
- PokéAPI: `https://pokeapi.co/docs/v2`
