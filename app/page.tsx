import type { Metadata } from "next";
import { getPokemonList } from "@/lib/pokeapi";
import { PokemonExplorer } from "./_components/PokemonExplorer";

export const metadata: Metadata = {
  title: "Pokédex",
  description: "Browse and search Pokémon from the public PokéAPI.",
};

export default async function HomePage() {
  // The PokéAPI does not expose a search endpoint, so we fetch the whole
  // catalog once (cached for an hour by the fetch wrapper) and let the
  // client component handle the search filter and 20-per-page pagination.
  const { results } = await getPokemonList(1000, 0);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Pokédex
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Browse {results.length} Pokémon. Type to filter.
        </p>
      </header>
      <PokemonExplorer pokemon={results} />
    </main>
  );
}
