@AGENTS.md

# claude-architect-lab

Lab de préparation à la certification Claude Architect. L'app affiche une liste paginée de Pokémon avec recherche et une page de détail, en consommant la PokéAPI publique (`https://pokeapi.co/api/v2/`). Pas de backend custom, pas de base de données.

## Stack installée

| Élément | Version | Notes |
| --- | --- | --- |
| Next.js | `16.2.4` | App Router uniquement. Voir `node_modules/next/dist/docs/` — l'API a changé par rapport aux versions antérieures (params Promise, `use cache`, `unstable_instant`, etc.). |
| React | `19.2.4` | Server Components par défaut, `use()` côté client pour résoudre des promesses. |
| TypeScript | `^5` | `strict: true`, `moduleResolution: "bundler"`, alias `@/*` → racine. |
| Tailwind CSS | `^4` | Config inline via `@theme` dans `app/globals.css`. Pas de `tailwind.config.*`. PostCSS via `@tailwindcss/postcss`. |
| ESLint | `^9` | Flat config (`eslint.config.mjs`) basée sur `eslint-config-next`. |

> Si tu modifies une API Next.js, lis d'abord le guide pertinent dans `node_modules/next/dist/docs/01-app/` avant d'écrire du code. Les patterns en mémoire pour Next.js ≤ 14 sont obsolètes.

## Lancer le projet

```bash
npm install
npm run dev      # dev server (par défaut http://localhost:3000)
npm run build    # build de production
npm run start    # sert le build de production
npm run lint     # eslint
```

Il n'y a pas de variables d'environnement requises (l'API PokéAPI est publique et sans clé).

## Architecture

Rendu majoritairement côté serveur (Server Components) avec streaming. Aucune route API custom : le code serveur appelle directement `fetch('https://pokeapi.co/...')`.

```
Browser ──▶ Next.js (Server Component) ──▶ pokeapi.co
                       │
                       └─▶ Stream HTML + RSC payload
```

- **Liste paginée** (`/`) : fetch côté serveur de `pokemon?limit=&offset=`. Pagination via search params (`?page=`).
- **Recherche** : input contrôlé côté client qui met à jour `?q=` ; le filtrage final se fait côté serveur sur la liste paginée (la PokéAPI n'a pas de recherche full-text — voir « Choix techniques »).
- **Détail** (`/pokemon/[name]`) : segment dynamique, fetch de `pokemon/{name}` + `pokemon-species/{name}`.

## Structure des dossiers

État cible (la plupart à créer) :

```
app/
  layout.tsx              # root layout, polices Geist (existant)
  globals.css             # Tailwind v4 + theme inline (existant)
  page.tsx                # liste paginée + recherche
  loading.tsx             # skeleton de la liste
  pokemon/
    [name]/
      page.tsx            # page détail
      loading.tsx         # skeleton détail
      not-found.tsx       # 404 ciblée
lib/
  pokeapi.ts              # helpers fetch (typés), URLs, parsing
  types.ts                # types PokéAPI partagés
components/
  PokemonCard.tsx         # carte de la liste (Server Component)
  SearchInput.tsx         # input contrôlé ('use client')
  Pagination.tsx          # liens prev/next basés sur les search params
public/                   # assets statiques (existant)
```

Conventions de localisation :
- `app/` = routing uniquement (fichiers spéciaux Next.js : `layout`, `page`, `loading`, `error`, `not-found`).
- Code applicatif (`lib/`, `components/`) à la racine, importé via l'alias `@/` (configuré dans `tsconfig.json`).
- Si un composant n'est utilisé que par une route, le colocaliser dans un dossier privé `_components/` sous la route concernée plutôt que dans `components/`.

## Conventions de code

- **Server Components par défaut.** N'ajouter `'use client'` que pour : interactivité (input, listeners), hooks React (`useState`, `useEffect`, `use`), accès aux APIs navigateur. Les fetches restent côté serveur autant que possible.
- **Fetch typé.** Tous les appels PokéAPI passent par `lib/pokeapi.ts` qui retourne des types stricts depuis `lib/types.ts`. Pas de `any`.
- **Caching.** Par défaut sous Next.js 16 les `fetch` ne sont **pas cachés** (cf. `01-getting-started/06-fetching-data.md`). Pour les ressources stables (liste, détail d'un Pokémon donné), envelopper la fonction de fetch avec la directive `'use cache'` ; pour les données qui doivent rester fraîches, laisser tel quel et streamer derrière `<Suspense>`.
- **Streaming.** Utiliser `loading.tsx` pour le skeleton du segment, et `<Suspense>` autour des sous-arbres lents pour ne pas bloquer le shell.
- **Params asynchrones.** Sous Next.js 16, `params` et `searchParams` dans `page.tsx` sont des `Promise<...>` ; il faut les `await` (ou les passer tels quels à un sous-composant qui les awaite derrière un Suspense).
- **Images.** Pour les sprites Pokémon servis depuis `raw.githubusercontent.com`, autoriser le domaine dans `next.config.ts` (`images.remotePatterns`) avant d'utiliser `next/image`.
- **TypeScript strict.** Pas de `// @ts-ignore`. Les erreurs de typage du proxy PokéAPI doivent être corrigées en amont dans `lib/types.ts`.
- **Tailwind v4.** Les couleurs / polices custom passent par `@theme` dans `globals.css` (pas de fichier de config). Les variantes dark sont gérées via `@media (prefers-color-scheme: dark)` (déjà en place).
- **Pas de fichiers de doc en plus.** Toute info utile à un agent va dans CLAUDE.md / AGENTS.md, pas dans des `.md` annexes.

## Choix techniques (et pourquoi)

- **Server Components > React Query / SWR.** L'API est publique et lente à changer ; le rendu serveur supprime le besoin d'un store côté client et améliore le LCP. SWR n'est ajouté que si une fonctionnalité strictement client le justifie.
- **Pas de route API custom (`route.ts`).** Le sujet impose « uniquement l'API publique » ; relayer la PokéAPI ajouterait une couche sans valeur (ni cache, ni auth, ni transformation utile à ce stade).
- **Recherche côté serveur, pas full-text.** PokéAPI n'expose pas d'endpoint de recherche. Stratégie : fetch d'une liste large (ex. `pokemon?limit=1000`) cachée via `'use cache'`, puis filtrage par `name.startsWith(q)` côté serveur. Évite un index custom et garde le code trivial.
- **`unstable_instant` à considérer pour `/pokemon/[name]`.** La navigation entre fiches de la liste passe par un layout partagé : c'est exactement le cas que la guide `instant-navigation.md` cible. À activer une fois la page de détail stable, **pas avant** (l'API est marquée `unstable_*` et expérimentale).
- **Pas de state management global.** L'état partagé se limite aux search params (`?page=`, `?q=`), ce qui rend l'URL la source de vérité et la page partageable.
- **Geist sans / mono.** Conservé du template `create-next-app` ; chargé via `next/font/google` (zero layout-shift, auto-optimisé).

## Pour les agents : où aller chercher

- API et conventions Next.js 16 → `node_modules/next/dist/docs/01-app/`
- Fetch / streaming → `01-getting-started/06-fetching-data.md`
- Caching (`use cache`, `cacheLife`) → `01-getting-started/08-caching.md`
- Navigation instantanée → `01-app/02-guides/instant-navigation.md`
- File conventions (`page`, `layout`, `loading`, `not-found`, dynamic segments) → `01-app/03-api-reference/03-file-conventions/`
- PokéAPI publique → `https://pokeapi.co/docs/v2`

## Project conventions (always-on)

- **Language**: TypeScript strict mode. No `any`, no `@ts-ignore`.
- **Framework**: Next.js 14 App Router. Default to Server Components.
- **Styling**: Tailwind only. No CSS modules, no inline styles.
- **API layer**: ALWAYS use `lib/api.ts`. Never call `fetch()` directly in components.
- **File naming**: PascalCase for components, kebab-case for everything else.

## Hard constraints (never violate)

- Never modify `next.config.js` or `tsconfig.json` without asking.
- Never install a new dependency without justification.
- Never bypass TypeScript types with `any` or `as unknown as`.