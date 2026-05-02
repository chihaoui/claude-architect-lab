// Types for the public PokéAPI v2 (https://pokeapi.co/docs/v2).
// Only the fields actually consumed by this app are modeled — extend as needed.

export interface NamedAPIResource {
  name: string;
  url: string;
}

// GET /pokemon?limit=&offset=
export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: NamedAPIResource[];
}

// A single entry as returned in a list, augmented after extraction
// with the numeric id derived from `url` for routing/keying.
export interface PokemonListItem extends NamedAPIResource {
  id: number;
}

// Return shape of `getPokemonList` — same as PokemonListResponse but with
// `results` enriched with the numeric id.
export interface PokemonListPage {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonListItem[];
}

export interface PokemonSpritesOther {
  "official-artwork"?: {
    front_default: string | null;
    front_shiny: string | null;
  };
  home?: {
    front_default: string | null;
    front_shiny: string | null;
  };
  dream_world?: {
    front_default: string | null;
  };
}

export interface PokemonSprites {
  front_default: string | null;
  front_shiny: string | null;
  back_default: string | null;
  back_shiny: string | null;
  other?: PokemonSpritesOther;
}

export interface PokemonType {
  slot: number;
  type: NamedAPIResource;
}

export interface PokemonAbility {
  slot: number;
  is_hidden: boolean;
  ability: NamedAPIResource;
}

export interface PokemonStat {
  base_stat: number;
  effort: number;
  stat: NamedAPIResource;
}

export interface PokemonSpeciesFlavorTextEntry {
  flavor_text: string;
  language: NamedAPIResource;
  version: NamedAPIResource;
}

export interface PokemonSpeciesLocalizedName {
  name: string;
  language: NamedAPIResource;
}

export interface PokemonSpeciesGenus {
  genus: string;
  language: NamedAPIResource;
}

// GET /pokemon-species/{name|id}
export interface PokemonSpecies {
  id: number;
  name: string;
  flavor_text_entries: PokemonSpeciesFlavorTextEntry[];
  names: PokemonSpeciesLocalizedName[];
  genera: PokemonSpeciesGenus[];
}

// GET /pokemon/{name|id}
export interface Pokemon {
  id: number;
  name: string;
  height: number; // decimetres
  weight: number; // hectograms
  base_experience: number | null;
  order: number;
  sprites: PokemonSprites;
  types: PokemonType[];
  abilities: PokemonAbility[];
  stats: PokemonStat[];
  species: NamedAPIResource;
}
