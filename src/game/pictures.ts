/**
 * Coloring pictures.
 *
 * The data lives in `assets/coloring/*.svg` (the editable source of truth) and
 * is compiled to `pictures.data.ts` by `npm run gen:pictures`.
 *
 * Add a picture: drop `assets/coloring/<id>.svg` in, give every colorable
 * shape an `id`, then run `npm run gen:pictures`. No screen file needed —
 * `/games/coloring/[picture]` renders any picture by id.
 */
export type { Region, Decoration, Picture } from "./pictures.types";

import { PICTURES } from "./pictures.data";

export { PICTURES };

export function getPicture(id: string | undefined) {
  return PICTURES.find((p) => p.id === id);
}
