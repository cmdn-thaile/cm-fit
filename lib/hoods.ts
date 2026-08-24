export interface Hood {
  id: string;
  name: string;
  image: string;
}

export const HOODS: Hood[] = [
  { id: "bear", name: "Gấu nâu", image: "/hoods/bear.png" },
  { id: "panda", name: "Gấu trúc", image: "/hoods/panda.png" },
];

export function getHoodById(id: string): Hood | undefined {
  return HOODS.find((h) => h.id === id);
}

export const DEFAULT_HOOD = "bear";
