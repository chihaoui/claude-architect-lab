---
name: pokeapi-component

description: Use this skill when the user asks to create, generate, or scaffold a React component that consumes the PokéAPI (https://pokeapi.co). Trigger on phrases like "create a component for...", "build a Pokemon card", "scaffold a UI for the PokeAPI", or any request involving Pokemon data display in this Next.js project. Produces production-ready Server or Client Components with strict TypeScript types, loading/error states, and Tailwind styling consistent with the project conventions.
---

# PokéAPI Component Generator

When this skill is activated, generate React components for the **Next.js 16** (App Router) lab project that consume the PokéAPI. Follow the rules below strictly.

> **Important — Next.js 16.** This project uses Next.js 16.x. APIs differ from Next.js ≤ 14 (`params` is a `Promise`, fetches are not cached by default, `'use cache'` directive, `unstable_instant`, etc.). Before writing routing or data-fetching code, read the relevant guide in `node_modules/next/dist/docs/01-app/`.

## 1. Decide: Server Component or Client Component?

Default to **Server Component** unless the component needs:
- User interaction (`onClick`, `onChange`, form input) → Client
- React hooks (`useState`, `useEffect`, `useMemo`, `use`) → Client
- Browser APIs (`localStorage`, `window`) → Client
- Real-time updates → Client

If Client Component is needed, add `"use client"` at the top of the file.

## 2. Always use the project's API layer

NEVER call `fetch("https://pokeapi.co/...")` directly inside components.
ALWAYS import from `@/lib/api`:

```ts
import {
  getPokemonList,
  getPokemonByName,
  getPokemonSpeciesByName,
  PokeApiError,
} from "@/lib/api";
import type { Pokemon, PokemonListItem, PokemonSpecies } from "@/lib/types";
```

If a needed function does not exist in `lib/api.ts`, STOP and tell the user:
> "I need to add `getXxx()` to lib/api.ts first. Should I proceed?"

Do not duplicate fetch logic in components.

## 3. Strict TypeScript

- All props must have an explicit interface or type alias named `<ComponentName>Props`
- No `any`, no `unknown` without narrowing
- Import shared types from `@/lib/types` with `import type`
- Use `readonly` for props that are not mutated

See `references/typescript-rules.md` for full rules.

Example:
```ts
interface PokemonCardProps {
  readonly pokemon: PokemonListItem;
  readonly priority?: boolean;
}
```

## 4. Loading and error states

### Server Components (preferred)
- Use `loading.tsx` for the segment skeleton
- Use `error.tsx` for error boundaries
- For 404s, narrow `PokeApiError` and call `notFound()`:
  ```ts
  import { notFound } from "next/navigation";
  import { PokeApiError } from "@/lib/api";

  try {
    return await getPokemonByName(name);
  } catch (err) {
    if (err instanceof PokeApiError && err.status === 404) notFound();
    throw err;
  }
  ```
- Use `not-found.tsx` to customize the 404 page for a route segment.
- Stream slow sub-trees behind `<Suspense>` instead of blocking the shell.

### Client Components fetching data
- Show a skeleton or spinner during loading
- Display a friendly error message on failure (never raw error objects)
- Provide a retry mechanism when relevant

## 5. Next.js 16 routing patterns

- `params` and `searchParams` in `page.tsx` are `Promise<...>` — `await` them (or pass them to a sub-component awaited behind `<Suspense>`).
  ```ts
  export default async function Page({
    params,
  }: {
    params: Promise<{ name: string }>;
  }) {
    const { name } = await params;
    // ...
  }
  ```
- `fetch` is **not cached by default**. For stable resources, wrap the fetch helper with the `'use cache'` directive (see `node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md`). For fresh data, leave as-is and stream behind `<Suspense>`.

## 6. Tailwind styling

Follow `references/styling-conventions.md` (single source of truth — do not duplicate the rules here). Key points enforced by that file:
- `zinc-*` palette only (no `gray-*`)
- Always pair `class dark:class` (dark mode is system-preference based)
- Border radius by usage: `rounded-md` (inputs/buttons), `rounded-lg` (cards), `rounded-full` (badges)
- Standard focus pattern with `focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-800`
- Always include `alt` for images and `aria-label` for icon-only buttons

## 7. Image handling

Use Next.js `<Image>` for Pokémon sprites. The project uses `unoptimized` since sprites come straight from GitHub raw and don't need Next's optimizer:

```tsx
import Image from "next/image";

<Image
  src={spriteUrl}
  alt={pokemon.name}
  width={96}
  height={96}
  unoptimized
  className="..."
/>
```

The hosts already allowed in `next.config.ts` are:
- `raw.githubusercontent.com` (sprites repo)

If you reference a new external host, REMIND the user to add it to `next.config.ts`:
```ts
images: { remotePatterns: [{ protocol: "https", hostname: "<new-host>" }] }
```

## 8. File location and naming

- **Shared / reusable components** → `components/` at the project root
- **Components used by a single route** → colocalize in `app/<route>/_components/` (private folder, per CLAUDE.md convention; see existing `app/_components/PokemonExplorer.tsx`)
- PascalCase filenames matching the component name (e.g., `PokemonCard.tsx`)
- **Named export only** for application components:
  ```ts
  export function PokemonCard(props: PokemonCardProps) { ... }
  ```
  Default exports are reserved for Next.js special files (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`).

## 9. Output format

When generating a component, output IN THIS ORDER:

1. **One-line summary** — what the component does
2. **Server or Client decision** — state which and why (one sentence)
3. **Required types / API helpers** — list types and functions imported from `@/lib`
4. **The full component code** in a single code block
5. **Usage example** — a 3-5 line snippet showing how to use it
6. **Next steps** — 1-2 bullets on what the user might want to add (variants, related routes, caching tweak)

## 10. What NOT to do

- Do not use class components
- Do not import from libraries not already in `package.json` without flagging it
- Do not add state management libraries (Zustand, Redux) unless the user explicitly asks
- Do not generate tests unless asked (keep components focused)
- Do not add a default export to application components (only Next.js special files use defaults)
- Do not duplicate Tailwind rules — point to `references/styling-conventions.md`
- Do not over-engineer: if the user asks for a simple card, do not return a 200-line component with 8 props
- Do not assume Next.js ≤ 14 patterns — read `node_modules/next/dist/docs/01-app/` first when in doubt
