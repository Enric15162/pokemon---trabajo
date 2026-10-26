export const MASTER_POKEMON_IDS = Array.from({ length: 20 }, (_, i) => i + 1);

export function shuffleArray(items) {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export function sanitizeCollection(items = []) {
  if (!Array.isArray(items)) {
    console.error('No se pudo sanitizar la colección: se esperaba una lista de Pokémon.');
    return [];
  }

  const byId = new Map();

  items.forEach((pokemon) => {
    if (!pokemon || !pokemon.id) return;
    if (!byId.has(pokemon.id)) {
      byId.set(pokemon.id, {
        ...pokemon,
        uniqueKey: pokemon.uniqueKey || `${pokemon.id}-${Date.now()}-${Math.random()}`
      });
    }
  });

  return Array.from(byId.values());
}

export async function fetchPokemonById(id) {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  if (!response.ok) {
    throw new Error(`PokéAPI respondió con el estado ${response.status}.`);
  }

  const data = await response.json();
  const getStat = (name) => data.stats.find((stat) => stat.stat.name === name)?.base_stat ?? 0;
  const image = data.sprites.other?.['official-artwork']?.front_default || data.sprites.front_default;
  const type = data.types[0]?.type?.name;

  if (!image || !type) {
    throw new Error(`La respuesta de PokéAPI para ${data.name} está incompleta.`);
  }

  const hp = getStat('hp');
  const attack = getStat('attack');
  const defense = getStat('defense');
  const speed = getStat('speed');

  return {
    uniqueKey: `${data.id}-${Date.now()}-${Math.random()}`,
    id: data.id,
    name: data.name,
    image,
    type,
    hp,
    attack,
    defense,
    speed,
    totalPower: hp + attack + defense + speed
  };
}

export async function fetchRandomPokemon(excludeIds = []) {
  const availableIds = MASTER_POKEMON_IDS.filter((id) => !excludeIds.includes(id));

  if (availableIds.length === 0) {
    throw new Error('No hay Pokémon disponibles para elegir como rival.');
  }

  const randomId = availableIds[Math.floor(Math.random() * availableIds.length)];
  return await fetchPokemonById(randomId);
}

export async function fetchUniquePokemonBatch(count, excludeIds = []) {
  const availableIds = shuffleArray(
    MASTER_POKEMON_IDS.filter((id) => !excludeIds.includes(id))
  ).slice(0, count);

  return Promise.all(availableIds.map((id) => fetchPokemonById(id)));
}