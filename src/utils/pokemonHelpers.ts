export function formatPokemonId(id: number): string {
  return `#${String(id).padStart(3, '0')}`;
}

export function formatPokemonName(name: string): string {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function formatHeight(height: number): string {
  // PokeAPI height is in decimetres
  const meters = height / 10;
  const feet = Math.floor(meters * 3.281);
  const inches = Math.round((meters * 3.281 - feet) * 12);
  return `${meters.toFixed(1)} m (${feet}'${inches}")`;
}

export function formatWeight(weight: number): string {
  // PokeAPI weight is in hectograms
  const kg = weight / 10;
  const lbs = (kg * 2.205).toFixed(1);
  return `${kg.toFixed(1)} kg (${lbs} lbs)`;
}

export function extractIdFromUrl(url: string): number {
  const parts = url.replace(/\/$/, '').split('/');
  return parseInt(parts[parts.length - 1], 10);
}

export function getSpriteUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

export function getStatLabel(statName: string): string {
  const labels: Record<string, string> = {
    hp: 'HP',
    attack: 'ATK',
    defense: 'DEF',
    'special-attack': 'SP.ATK',
    'special-defense': 'SP.DEF',
    speed: 'SPD',
  };
  return labels[statName] ?? statName.toUpperCase();
}

export function getStatMax(statName: string): number {
  // Known stat caps in the main series
  const maxes: Record<string, number> = {
    hp: 255,
    attack: 190,
    defense: 230,
    'special-attack': 194,
    'special-defense': 230,
    speed: 200,
  };
  return maxes[statName] ?? 255;
}
