import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cacheLife } from "next/cache";
import { Suspense } from "react";
import {
  getPokemonByName,
  getPokemonSpeciesByName,
  PokeApiError,
} from "@/lib/pokeapi";
import type { Pokemon, PokemonSpecies } from "@/lib/types";
import { PokemonTypeBadge } from "@/components/PokemonTypeBadge";

type StatMeta = {
  label: string;
  bar: string;
  text: string;
  icon: React.ReactNode;
};

const ICON_PROPS = {
  width: 14,
  height: 14,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const STAT_META: Record<string, StatMeta> = {
  hp: {
    label: "HP",
    bar: "bg-red-500",
    text: "text-red-500",
    icon: (
      <svg {...ICON_PROPS} aria-hidden>
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  attack: {
    label: "Attack",
    bar: "bg-orange-500",
    text: "text-orange-500",
    icon: (
      <svg {...ICON_PROPS} aria-hidden>
        <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
        <line x1="13" y1="19" x2="19" y2="13" />
        <line x1="16" y1="16" x2="20" y2="20" />
      </svg>
    ),
  },
  defense: {
    label: "Defense",
    bar: "bg-blue-500",
    text: "text-blue-500",
    icon: (
      <svg {...ICON_PROPS} aria-hidden>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  "special-attack": {
    label: "Sp. Atk",
    bar: "bg-purple-500",
    text: "text-purple-500",
    icon: (
      <svg {...ICON_PROPS} aria-hidden>
        <path d="m12 3-1.9 5.8L4 10l5.8 1.9L12 18l1.9-5.8L20 10l-5.8-1.9L12 3z" />
      </svg>
    ),
  },
  "special-defense": {
    label: "Sp. Def",
    bar: "bg-teal-500",
    text: "text-teal-500",
    icon: (
      <svg {...ICON_PROPS} aria-hidden>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  speed: {
    label: "Speed",
    bar: "bg-yellow-500",
    text: "text-yellow-500",
    icon: (
      <svg {...ICON_PROPS} aria-hidden>
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
};

const MAX_BASE_STAT = 255;

function formatName(name: string) {
  return name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

async function loadPokemon(name: string): Promise<Pokemon> {
  try {
    return await getPokemonByName(name);
  } catch (err) {
    if (err instanceof PokeApiError && err.status === 404) {
      notFound();
    }
    throw err;
  }
}

async function loadSpecies(name: string): Promise<PokemonSpecies | null> {
  try {
    return await getPokemonSpeciesByName(name);
  } catch (err) {
    // Some pokémon forms have no matching species entry; degrade gracefully.
    if (err instanceof PokeApiError && err.status === 404) return null;
    throw err;
  }
}

function pickEnglishFlavorText(species: PokemonSpecies): string | null {
  const entry = species.flavor_text_entries.find(
    (e) => e.language.name === "en",
  );
  if (!entry) return null;
  // PokéAPI flavor texts contain form-feed (\f) and newline characters used
  // for cartridge text wrapping; collapse them to plain spaces.
  return entry.flavor_text.replace(/[\f\n\r]+/g, " ").trim();
}

function pickJapaneseName(species: PokemonSpecies): string | null {
  const entry =
    species.names.find((n) => n.language.name === "ja-Hrkt") ??
    species.names.find((n) => n.language.name === "ja");
  return entry?.name ?? null;
}

function pickEnglishGenus(species: PokemonSpecies): string | null {
  return (
    species.genera.find((g) => g.language.name === "en")?.genus ?? null
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}): Promise<Metadata> {
  "use cache";
  cacheLife("days");
  const { name } = await params;
  return { title: `${formatName(name)} – Pokédex` };
}

export default function PokemonDetailPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <PokemonDetailContent params={params} />
    </Suspense>
  );
}

function DetailSkeleton() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <div className="h-4 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="mt-6 h-60 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-900" />
    </main>
  );
}

async function PokemonDetailContent({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const pokemon = await loadPokemon(name);
  const species = await loadSpecies(pokemon.species.name);

  const sprite =
    pokemon.sprites.other?.["official-artwork"]?.front_default ??
    pokemon.sprites.front_default;

  const flavorText = species ? pickEnglishFlavorText(species) : null;
  const japaneseName = species ? pickJapaneseName(species) : null;
  const genus = species ? pickEnglishGenus(species) : null;

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <Link
        href="/"
        className="text-sm text-zinc-500 transition hover:text-zinc-900 dark:hover:text-zinc-100"
      >
        ← Back to Pokédex
      </Link>

      <header className="mt-4 flex flex-col items-center gap-6 sm:flex-row sm:items-stretch sm:gap-8">
        {sprite && (
          <div className="flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-200 p-4 dark:from-zinc-800 dark:to-zinc-900">
            <Image
              src={sprite}
              alt={pokemon.name}
              width={240}
              height={240}
              priority
              unoptimized
              className="h-48 w-48 object-contain sm:h-60 sm:w-60"
            />
          </div>
        )}
        <article
          aria-label="Fiche d'identité"
          className="flex flex-1 flex-col justify-center rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-sm sm:text-left dark:border-zinc-800 dark:bg-zinc-950"
        >
          <p className="text-xs font-mono uppercase tracking-wider text-zinc-400">
            N° {pokemon.id.toString().padStart(4, "0")}
          </p>
          <h1 className="mt-1 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {formatName(pokemon.name)}
          </h1>
          {(japaneseName || genus) && (
            <p className="mt-1 text-sm text-zinc-500">
              {japaneseName && (
                <span lang="ja" className="font-medium text-zinc-700 dark:text-zinc-300">
                  {japaneseName}
                </span>
              )}
              {japaneseName && genus && <span className="mx-2">·</span>}
              {genus && <span>{genus}</span>}
            </p>
          )}
          <ul className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
            {pokemon.types.map(({ type }) => (
              <li key={type.name}>
                <PokemonTypeBadge type={type.name} />
              </li>
            ))}
          </ul>
          <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-zinc-200 pt-4 text-center dark:border-zinc-800">
            <div>
              <dt className="text-[10px] uppercase tracking-wider text-zinc-400">
                Height
              </dt>
              <dd className="mt-0.5 font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {(pokemon.height / 10).toFixed(1)} m
              </dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-wider text-zinc-400">
                Weight
              </dt>
              <dd className="mt-0.5 font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {(pokemon.weight / 10).toFixed(1)} kg
              </dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-wider text-zinc-400">
                Base XP
              </dt>
              <dd className="mt-0.5 font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {pokemon.base_experience ?? "—"}
              </dd>
            </div>
          </dl>
        </article>
      </header>

      {flavorText && (
        <p className="mt-8 max-w-2xl text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
          {flavorText}
        </p>
      )}

      <section className="mt-10 grid gap-10 md:grid-cols-2">
        <div>
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Stats
          </h2>
          <ul className="space-y-3">
            {pokemon.stats.map((s) => {
              const meta = STAT_META[s.stat.name];
              const label = meta?.label ?? formatName(s.stat.name);
              const pct = Math.min(100, (s.base_stat / MAX_BASE_STAT) * 100);
              return (
                <li key={s.stat.name}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span
                      className={`flex items-center gap-1.5 font-medium ${
                        meta?.text ?? "text-zinc-600 dark:text-zinc-400"
                      }`}
                    >
                      {meta?.icon}
                      {label}
                    </span>
                    <span className="font-mono text-zinc-600 dark:text-zinc-400">
                      {s.base_stat}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                    <div
                      className={`h-full rounded-full ${
                        meta?.bar ?? "bg-zinc-900 dark:bg-zinc-100"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Abilities
          </h2>
          <ul className="space-y-2">
            {pokemon.abilities.map(({ ability, is_hidden }) => (
              <li
                key={ability.name}
                className="flex items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {formatName(ability.name)}
                </span>
                {is_hidden && (
                  <span className="text-xs uppercase tracking-wider text-zinc-400">
                    Hidden
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
