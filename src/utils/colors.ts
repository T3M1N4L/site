export const colors: Record<string, string> = {
  rosewater: "#f5e0dc",
  flamingo: "#f2cddc",
  pink: "#f5c2e7",
  mauve: "#cba6f7",
  red: "#ff637d",
  maroon: "#eba0ac",
  peach: "#ffa56e",
  yellow: "#ffe06e",
  green: "#93ff8a",
  teal: "#54deab",
  sky: "#89dceb",
  sapphire: "#7490ec",
  blue: "#89b4fa",
  lavender: "#a057fe",
  text: "#edf1ff",
  subtext1: "#c3c8de",
  subtext0: "#afb4c8",
  overlay2: "#9399b2",
  overlay1: "#7f849c",
  overlay0: "#6c7086",
  surface2: "#585b70",
  surface1: "#45475a",
  surface0: "#0f0f13",
  base: "#000000",
  mantle: "#040404",
  crust: "#000000",
};

export const getNextInObj = <T extends Object>(
  obj: T,
  key: keyof T,
): keyof T => {
  const keys = Object.keys(obj);
  const index = keys.indexOf(String(key));
  if (index === -1) return keys[0] as keyof T;
  return keys[(index + 1) % keys.length] as keyof T;
};
