"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { PokemonListItem } from "@/lib/types";

const PAGE_SIZE = 20;
const SPRITE_BASE =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

function spriteUrl(id: number) {
  return `${SPRITE_BASE}/${id}.png`;
}

function formatName(name: string) {
  return name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function PokemonExplorer({ pokemon }: { pokemon: PokemonListItem[] }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pokemon;
    return pokemon.filter((p) => p.name.includes(q));
  }, [pokemon, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const start = (safePage - 1) * PAGE_SIZE;
  const visible = filtered.slice(start, start + PAGE_SIZE);

  function onQueryChange(value: string) {
    setQuery(value);
    setPage(1);
  }

  return (
    <>
      <div className="mb-6">
        <label htmlFor="pokemon-search" className="sr-only">
          Search Pokémon
        </label>
        <input
          id="pokemon-search"
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search Pokémon by name…"
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-400 dark:focus:ring-zinc-800"
        />
        <p className="mt-2 text-xs text-zinc-500">
          {filtered.length} result{filtered.length === 1 ? "" : "s"}
        </p>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-md border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
          No Pokémon match “{query}”.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {visible.map((p) => (
            <li key={p.id}>
              <Link
                href={`/pokemon/${p.name}`}
                className="group flex flex-col items-center rounded-lg border border-zinc-200 bg-zinc-100 p-4 transition hover:-translate-y-0.5 hover:border-yellow-400 hover:bg-yellow-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-violet-400 dark:hover:bg-violet-500"
              >
                <Image
                  src={spriteUrl(p.id)}
                  alt={p.name}
                  width={96}
                  height={96}
                  unoptimized
                  className="h-24 w-24 object-contain transition group-hover:scale-110"
                />
                <span className="mt-2 text-xs uppercase tracking-wider text-zinc-400">
                  #{p.id.toString().padStart(4, "0")}
                </span>
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {formatName(p.name)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {pageCount > 1 && (
        <nav
          aria-label="Pagination"
          className="mt-8 flex items-center justify-between gap-4"
        >
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            ← Previous
          </button>
          <span className="text-sm text-zinc-500">
            Page {safePage} of {pageCount}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            disabled={safePage === pageCount}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Next →
          </button>
        </nav>
      )}
    </>
  );
}
