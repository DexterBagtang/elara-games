/** Shared types for coloring pictures. See pictures.ts / pictures.data.ts. */

export type Region = { id: string; transform?: string } & (
  | { kind: "path"; d: string }
  | { kind: "circle"; cx: number; cy: number; r: number }
  | { kind: "ellipse"; cx: number; cy: number; rx: number; ry: number }
  | { kind: "rect"; x: number; y: number; width: number; height: number; rx?: number }
  | { kind: "polygon"; points: string }
);

export type Decoration = { d: string };

export type Picture = {
  id: string;
  title: string;
  emoji: string;
  viewBox: string;
  regions: Region[];
  decorations: Decoration[];
};
