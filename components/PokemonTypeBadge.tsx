const TYPE_COLORS: Record<string, string> = {
  normal: "bg-zinc-400",
  fire: "bg-orange-500",
  water: "bg-blue-500",
  electric: "bg-yellow-400",
  grass: "bg-green-500",
  ice: "bg-cyan-400",
  fighting: "bg-red-700",
  poison: "bg-purple-500",
  ground: "bg-amber-600",
  flying: "bg-indigo-400",
  psychic: "bg-pink-500",
  bug: "bg-lime-500",
  rock: "bg-yellow-700",
  ghost: "bg-violet-700",
  dragon: "bg-indigo-700",
  dark: "bg-zinc-800",
  steel: "bg-zinc-500",
  fairy: "bg-pink-300",
};

export function PokemonTypeBadge({ type }: { type: string }) {
  const color = TYPE_COLORS[type] ?? "bg-zinc-500";
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white ${color}`}
    >
      {type}
    </span>
  );
}
