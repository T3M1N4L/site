// Maps color theme names to pokemon
export const colorToPokemon: Record<string, string> = {
  rosewater: 'bidoof',
  flamingo: 'jigglypuff',
  pink: 'jigglypuff',
  mauve: 'ditto',
  red: 'groudon',
  maroon: 'deoxys',
  peach: 'charizard',
  yellow: 'jirachi',
  green: 'rayquaza',
  teal: 'tyranitar',
  sky: 'suicune', // Greninja not available, using Suicune
  sapphire: 'garchomp',
  blue: 'blastoise',
  lavender: 'gengar',
};

export function getPokemonForColor(color: string): string {
  return colorToPokemon[color] || 'gengar';
}
