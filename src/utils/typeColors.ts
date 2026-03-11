export const POKEMON_TYPE_DATA: Record<string, { c: string, bg: string, soft: string, label: string }> = {
  fire: { c: "#E8622A", bg: "#2E1508", soft: "#F5A06A", label: "Fire" },
  water: { c: "#3B8FD4", bg: "#081E30", soft: "#82C0EE", label: "Water" },
  grass: { c: "#3BAD5C", bg: "#0A2214", soft: "#7DD69A", label: "Grass" },
  electric: { c: "#DDB321", bg: "#2A2004", soft: "#F5D76E", label: "Electric" },
  psychic: { c: "#D4517A", bg: "#28091A", soft: "#EE92B0", label: "Psychic" },
  ice: { c: "#3AAFC0", bg: "#05202A", soft: "#7DD8E6", label: "Ice" },
  dragon: { c: "#6B5DD6", bg: "#130F2E", soft: "#A89AEE", label: "Dragon" },
  dark: { c: "#705090", bg: "#120A1C", soft: "#AA88C8", label: "Dark" },
  fairy: { c: "#CC6699", bg: "#280F1F", soft: "#EEB0CC", label: "Fairy" },
  fighting: { c: "#CC5533", bg: "#280A05", soft: "#E89A7A", label: "Fighting" },
  poison: { c: "#9944BB", bg: "#1C0828", soft: "#CC88DD", label: "Poison" },
  ground: { c: "#BB8833", bg: "#221608", soft: "#DDBB77", label: "Ground" },
  rock: { c: "#997755", bg: "#1A1008", soft: "#BBA088", label: "Rock" },
  ghost: { c: "#6655AA", bg: "#100E22", soft: "#AA99CC", label: "Ghost" },
  bug: { c: "#669922", bg: "#101C04", soft: "#99CC55", label: "Bug" },
  steel: { c: "#7788AA", bg: "#101622", soft: "#AABBCC", label: "Steel" },
  flying: { c: "#5577CC", bg: "#0A1030", soft: "#88AAEE", label: "Flying" },
  normal: { c: "#888870", bg: "#181810", soft: "#BBBBAA", label: "Normal" },
};

export const TYPE_COLORS: Record<string, string> = Object.keys(POKEMON_TYPE_DATA).reduce((acc, key) => {
  acc[key] = POKEMON_TYPE_DATA[key].c;
  return acc;
}, {} as Record<string, string>);

export function getTypeColor(type: string): string {
  return POKEMON_TYPE_DATA[type.toLowerCase()]?.c ?? '#888870';
}

export function getTypeData(type: string) {
  return POKEMON_TYPE_DATA[type.toLowerCase()] ?? POKEMON_TYPE_DATA.normal;
}

export const POKEMON_TYPES = Object.keys(POKEMON_TYPE_DATA);
