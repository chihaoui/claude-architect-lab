import { cacheLife } from "next/cache";
import type {
  Pokemon,
  PokemonListItem,
  PokemonListPage,
  PokemonListResponse,
  PokemonSpecies,
} from "./types";

const BASE_URL = "https://pokeapi.co/api/v2";

// HTTP-level failure from the PokéAPI (non-2xx response).
export class PokeApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly url: string,
  ) {
    super(message);
    this.name = "PokeApiError";
  }
}

// Malformed payload from the PokéAPI (e.g. unexpected resource URL shape).
// Distinct from PokeApiError so callers can filter on `instanceof` without
// having to invent sentinel status codes.
export class PokeApiParseError extends Error {
  constructor(
    message: string,
    readonly url: string,
  ) {
    super(message);
    this.name = "PokeApiParseError";
  }
}

async function pokeFetch<T>(path: string): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new PokeApiError(
      `PokéAPI request failed (${res.status} ${res.statusText})`,
      res.status,
      url,
    );
  }

  return (await res.json()) as T;
}

// Each list `result` carries a URL like ".../pokemon/25/" — the numeric id is
// useful for routing and for fetching sprites without an extra request.
function idFromResourceUrl(url: string): number {
  const match = url.match(/\/(\d+)\/?$/);
  if (!match) {
    throw new PokeApiParseError(`Unexpected resource URL: ${url}`, url);
  }
  return Number(match[1]);
}

export async function getPokemonList(
  limit = 20,
  offset = 0,
): Promise<PokemonListPage> {
  "use cache";
  // Pokémon list only grows when a new generation ships (years apart).
  cacheLife("days");

  const data = await pokeFetch<PokemonListResponse>(
    `/pokemon?limit=${limit}&offset=${offset}`,
  );

  return {
    count: data.count,
    next: data.next,
    previous: data.previous,
    results: data.results.map<PokemonListItem>((r) => ({
      ...r,
      id: idFromResourceUrl(r.url),
    })),
  };
}

export async function getPokemonByName(name: string): Promise<Pokemon> {
  "use cache";
  cacheLife("days");

  const slug = encodeURIComponent(name.trim().toLowerCase());
  return pokeFetch<Pokemon>(`/pokemon/${slug}`);
}

export async function getPokemonSpeciesByName(
  name: string,
): Promise<PokemonSpecies> {
  "use cache";
  cacheLife("days");

  const slug = encodeURIComponent(name.trim().toLowerCase());
  return pokeFetch<PokemonSpecies>(`/pokemon-species/${slug}`);
}
