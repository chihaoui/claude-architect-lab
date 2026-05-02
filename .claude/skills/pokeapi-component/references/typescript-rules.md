# TypeScript Rules for Components

## Props
- Always define a `<ComponentName>Props` interface
- Use `readonly` for props not mutated
- No `any`, no `unknown` without narrowing
- No `// @ts-ignore` / `// @ts-expect-error` — fix the upstream type instead

## Type imports
Use `import type` for types-only imports (project uses `verbatimModuleSyntax`-friendly style):
```ts
import type { Pokemon, PokemonListItem } from "@/lib/types";
```

## Exports
- **Named export only** for application components:
  ```ts
  export function PokemonCard(props: PokemonCardProps) { ... }
  ```
- Default exports are reserved for Next.js special files (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`).

## Error narrowing
The API layer throws `PokeApiError` with a `status` field. Narrow it before reacting (e.g. for 404 → `notFound()`):
```ts
import { PokeApiError } from "@/lib/api";
import { notFound } from "next/navigation";

try {
  return await getPokemonByName(name);
} catch (err) {
  if (err instanceof PokeApiError && err.status === 404) notFound();
  throw err;
}
```

## Examples
```ts
interface PokemonCardProps {
  readonly pokemon: PokemonListItem;
  readonly priority?: boolean;
}
```
