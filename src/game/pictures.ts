/**
 * Coloring pictures. Each picture is drawn on a 200x200 viewBox.
 * `regions` are tappable/fillable. `decorations` are stroke-only detail
 * (smile, antennae) that never counts toward completion.
 *
 * Add a picture: append here. No screen file needed — the coloring
 * screen renders any picture by id via /games/coloring/[picture].
 */

export type Region =
  | { id: string; kind: "circle"; cx: number; cy: number; r: number }
  | {
      id: string;
      kind: "ellipse";
      cx: number;
      cy: number;
      rx: number;
      ry: number;
      rotation?: number;
    }
  | {
      id: string;
      kind: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
      rx?: number;
    }
  | { id: string; kind: "polygon"; points: string }
  | { id: string; kind: "path"; d: string };

export type Decoration = { d: string };

export type Picture = {
  id: string;
  title: string;
  emoji: string;
  viewBox: string;
  regions: Region[];
  decorations?: Decoration[];
};

const flower: Picture = {
  id: "flower",
  title: "Flower",
  emoji: "🌸",
  viewBox: "0 0 200 200",
  regions: [
    { id: "petal-1", kind: "ellipse", cx: 100, cy: 43, rx: 16, ry: 28, rotation: 0 },
    { id: "petal-2", kind: "ellipse", cx: 136, cy: 64, rx: 16, ry: 28, rotation: 60 },
    { id: "petal-3", kind: "ellipse", cx: 136, cy: 106, rx: 16, ry: 28, rotation: 120 },
    { id: "petal-4", kind: "ellipse", cx: 100, cy: 127, rx: 16, ry: 28, rotation: 0 },
    { id: "petal-5", kind: "ellipse", cx: 64, cy: 106, rx: 16, ry: 28, rotation: 60 },
    { id: "petal-6", kind: "ellipse", cx: 64, cy: 64, rx: 16, ry: 28, rotation: 120 },
    { id: "center", kind: "circle", cx: 100, cy: 85, r: 20 },
    { id: "stem", kind: "rect", x: 94, y: 104, width: 12, height: 82 },
    { id: "leaf-left", kind: "ellipse", cx: 72, cy: 150, rx: 22, ry: 12, rotation: -30 },
    { id: "leaf-right", kind: "ellipse", cx: 128, cy: 165, rx: 22, ry: 12, rotation: 30 },
  ],
};

const fish: Picture = {
  id: "fish",
  title: "Fish",
  emoji: "🐠",
  viewBox: "0 0 200 200",
  regions: [
    { id: "body", kind: "ellipse", cx: 95, cy: 100, rx: 60, ry: 40 },
    { id: "tail", kind: "polygon", points: "150,100 196,64 196,136" },
    { id: "fin-top", kind: "polygon", points: "78,62 112,62 95,34" },
    { id: "fin-bottom", kind: "polygon", points: "78,138 112,138 95,166" },
    { id: "eye", kind: "circle", cx: 64, cy: 88, r: 9 },
    { id: "bubble-1", kind: "circle", cx: 40, cy: 54, r: 8 },
    { id: "bubble-2", kind: "circle", cx: 24, cy: 36, r: 6 },
    { id: "bubble-3", kind: "circle", cx: 48, cy: 30, r: 6 },
  ],
  decorations: [{ d: "M 44 110 q 14 12 30 1" }],
};

const house: Picture = {
  id: "house",
  title: "House",
  emoji: "🏠",
  viewBox: "0 0 200 200",
  regions: [
    { id: "grass", kind: "rect", x: 0, y: 168, width: 200, height: 32 },
    { id: "roof", kind: "polygon", points: "38,92 100,38 162,92" },
    { id: "wall", kind: "rect", x: 52, y: 92, width: 96, height: 78 },
    { id: "door", kind: "rect", x: 88, y: 120, width: 26, height: 50, rx: 3 },
    { id: "window-left", kind: "rect", x: 60, y: 104, width: 22, height: 22, rx: 2 },
    { id: "window-right", kind: "rect", x: 120, y: 104, width: 22, height: 22, rx: 2 },
    { id: "sun", kind: "circle", cx: 170, cy: 32, r: 18 },
    { id: "cloud-1", kind: "ellipse", cx: 44, cy: 36, rx: 26, ry: 12 },
    { id: "cloud-2", kind: "ellipse", cx: 28, cy: 66, rx: 20, ry: 10 },
  ],
};

const butterfly: Picture = {
  id: "butterfly",
  title: "Butterfly",
  emoji: "🦋",
  viewBox: "0 0 200 200",
  regions: [
    { id: "wing-top-left", kind: "ellipse", cx: 66, cy: 74, rx: 34, ry: 30 },
    { id: "wing-top-right", kind: "ellipse", cx: 134, cy: 74, rx: 34, ry: 30 },
    { id: "wing-bottom-left", kind: "ellipse", cx: 72, cy: 128, rx: 26, ry: 24 },
    { id: "wing-bottom-right", kind: "ellipse", cx: 128, cy: 128, rx: 26, ry: 24 },
    { id: "spot-left", kind: "circle", cx: 60, cy: 72, r: 9 },
    { id: "spot-right", kind: "circle", cx: 140, cy: 72, r: 9 },
    { id: "body", kind: "ellipse", cx: 100, cy: 100, rx: 8, ry: 44 },
    { id: "head", kind: "circle", cx: 100, cy: 52, r: 9 },
  ],
  decorations: [
    { d: "M 100 46 q -14 -12 -22 -20" },
    { d: "M 100 46 q 14 -12 22 -20" },
  ],
};

const rocket: Picture = {
  id: "rocket",
  title: "Rocket",
  emoji: "🚀",
  viewBox: "0 0 200 200",
  regions: [
    { id: "nose", kind: "polygon", points: "100,14 128,70 72,70" },
    { id: "body", kind: "rect", x: 72, y: 70, width: 56, height: 80, rx: 6 },
    { id: "window", kind: "circle", cx: 100, cy: 100, r: 15 },
    { id: "fin-left", kind: "polygon", points: "72,118 44,166 72,150" },
    { id: "fin-right", kind: "polygon", points: "128,118 156,166 128,150" },
    { id: "flame", kind: "polygon", points: "82,150 118,150 100,196" },
    { id: "star-1", kind: "circle", cx: 34, cy: 44, r: 7 },
    { id: "star-2", kind: "circle", cx: 166, cy: 54, r: 7 },
    { id: "star-3", kind: "circle", cx: 30, cy: 120, r: 6 },
  ],
};

export const PICTURES: Picture[] = [flower, fish, house, butterfly, rocket];

export function getPicture(id: string | undefined): Picture | undefined {
  return PICTURES.find((p) => p.id === id);
}
