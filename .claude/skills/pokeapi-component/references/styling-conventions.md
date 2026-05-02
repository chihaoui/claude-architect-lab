# Tailwind Styling Conventions

Aligned with the project's actual conventions (see `CLAUDE.md`). Tailwind v4, theme inline in `app/globals.css`, no `tailwind.config.*`.

## Color palette
- Neutrals: `zinc-*` only (never `gray-*`, `slate-*`, `neutral-*`)
- Text:
  - Primary: `text-zinc-900 dark:text-zinc-100`
  - Secondary: `text-zinc-500` (neutral, no dark variant needed)
  - Muted / labels: `text-zinc-400`
- Surfaces: `bg-white dark:bg-zinc-900` or `bg-zinc-100 dark:bg-zinc-900` (secondary)
- Borders: `border-zinc-200 dark:border-zinc-800` (subtle), `border-zinc-300 dark:border-zinc-700` (more visible)
- Accents: situational. No fixed primary color. For any custom color outside the `zinc` palette, declare a variable in `@theme inline` (`app/globals.css`) rather than `bg-[#xxxxxx]`.

## Border radius
- `rounded-md` — inputs, buttons
- `rounded-lg` — cards
- `rounded-full` — badges, pills (e.g. `PokemonTypeBadge`)

## Cards
```
rounded-lg border border-zinc-200 bg-zinc-100 p-4 transition
hover:-translate-y-0.5 hover:shadow-md
dark:border-zinc-800 dark:bg-zinc-900
```

## Dark mode
- Driven by `@media (prefers-color-scheme: dark)` — no class toggle, no `darkMode: 'class'`.
- **Always** declare the `class dark:class` pair side-by-side on the same element.
- Don't group dark-mode classes separately at the end of the className string mentally — keep each pair visually adjacent when possible.

## Responsiveness
- Mobile-first
- Breakpoints: `sm:` (640px), `md:` (768px), `lg:` (1024px)

## Focus states
Standard focus pattern for inputs and interactive elements:
```
outline-none focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-800 focus:border-zinc-500
```

## Meta-labels / utility typography
For secondary labels (Pokémon ID, type names, "Hidden"…):
```
text-xs uppercase tracking-wider
```

## Accessibility
- Always include `alt` for images
- Always `aria-label` for icon-only buttons
- Hover **and** focus states for all interactive elements
