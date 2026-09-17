import { memo } from "react";
import Svg, { Circle, Ellipse, Path, Polygon, Rect } from "react-native-svg";

import { BLANK } from "@/game/palette";
import type { Picture, Region } from "@/game/pictures";
import { theme } from "@/theme";

const STROKE = theme.color.ink;
const STROKE_W = 3;

type Props = {
  picture: Picture;
  fills: Record<string, string>;
  onTapRegion: (id: string) => void;
  width: number;
  height: number;
};

function RegionShape({
  region,
  fill,
  onPress,
}: {
  region: Region;
  fill: string;
  onPress: () => void;
}) {
  const common = {
    fill,
    stroke: STROKE,
    strokeWidth: STROKE_W,
    strokeLinejoin: "round" as const,
    transform: region.transform,
    // react-native-svg's web prepare() unconditionally does
    // `clean.onClick = props.onPress` — passing onClick directly (to dodge
    // its legacy Touchable mixin) gets overwritten with undefined. Passing
    // onPress lets it convert to a real onClick itself; onPressIn keeps the
    // faster touch-down response on native.
    onPress,
    onPressIn: onPress,
  };

  switch (region.kind) {
    case "circle":
      return <Circle cx={region.cx} cy={region.cy} r={region.r} {...common} />;
    case "ellipse":
      return (
        <Ellipse
          cx={region.cx}
          cy={region.cy}
          rx={region.rx}
          ry={region.ry}
          {...common}
        />
      );
    case "rect":
      return (
        <Rect
          x={region.x}
          y={region.y}
          width={region.width}
          height={region.height}
          rx={region.rx ?? 0}
          {...common}
        />
      );
    case "polygon":
      return <Polygon points={region.points} {...common} />;
    case "path":
      return <Path d={region.d} {...common} />;
  }
}

function ColoringCanvasBase({
  picture,
  fills,
  onTapRegion,
  width,
  height,
}: Props) {
  return (
    <Svg width={width} height={height} viewBox={picture.viewBox}>
      {picture.regions.map((region) => (
        <RegionShape
          key={region.id}
          region={region}
          fill={fills[region.id] ?? BLANK}
          onPress={() => onTapRegion(region.id)}
        />
      ))}
      {picture.decorations.map((d, i) => (
        <Path
          key={`deco-${i}`}
          d={d.d}
          fill="none"
          stroke={STROKE}
          strokeWidth={STROKE_W}
          strokeLinecap="round"
        />
      ))}
    </Svg>
  );
}

export const ColoringCanvas = memo(ColoringCanvasBase);
