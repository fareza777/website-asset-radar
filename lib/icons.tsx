import type { SVGProps } from "react";
import type { IconWeight } from "@phosphor-icons/react";
import { iconSpriteUrl } from "./generated/icons";

export type IconProps = SVGProps<SVGSVGElement> & {
  size?: number | string;
  weight?: IconWeight;
  mirrored?: boolean;
  alt?: string;
};

// The exact Phosphor shapes live in one cacheable SVG instead of every page's
// HTML and React payload. All supported weights and accessibility props remain.
function createIcon(name: string) {
  return function Icon({
    size = 24,
    weight = "regular",
    color = "currentColor",
    mirrored,
    alt,
    children,
    style,
    ...props
  }: IconProps) {
    const label = props["aria-label"] ?? alt;
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 256 256"
        fill={color}
        focusable="false"
        aria-hidden={label || props["aria-labelledby"] ? undefined : true}
        aria-label={label}
        role={label ? "img" : undefined}
        style={
          mirrored
            ? {
                ...style,
                transform: [style?.transform, "scaleX(-1)"]
                  .filter(Boolean)
                  .join(" "),
              }
            : style
        }
        {...props}
      >
        {alt && <title>{alt}</title>}
        <use href={iconSpriteUrl + "#" + name + "-" + weight} />
        {children}
      </svg>
    );
  };
}

export const ArrowCounterClockwise = /* @__PURE__ */ createIcon(
  "ArrowCounterClockwise",
);
export const ArrowDown = /* @__PURE__ */ createIcon("ArrowDown");
export const ArrowLeft = /* @__PURE__ */ createIcon("ArrowLeft");
export const ArrowRight = /* @__PURE__ */ createIcon("ArrowRight");
export const ArrowUpRight = /* @__PURE__ */ createIcon("ArrowUpRight");
export const Broadcast = /* @__PURE__ */ createIcon("Broadcast");
export const CalendarBlank = /* @__PURE__ */ createIcon("CalendarBlank");
export const CaretDown = /* @__PURE__ */ createIcon("CaretDown");
export const CaretRight = /* @__PURE__ */ createIcon("CaretRight");
export const Check = /* @__PURE__ */ createIcon("Check");
export const CheckCircle = /* @__PURE__ */ createIcon("CheckCircle");
export const Clock = /* @__PURE__ */ createIcon("Clock");
export const Cube = /* @__PURE__ */ createIcon("Cube");
export const Fire = /* @__PURE__ */ createIcon("Fire");
export const FolderSimple = /* @__PURE__ */ createIcon("FolderSimple");
export const GameController = /* @__PURE__ */ createIcon("GameController");
export const Heart = /* @__PURE__ */ createIcon("Heart");
export const Hourglass = /* @__PURE__ */ createIcon("Hourglass");
export const ImageSquare = /* @__PURE__ */ createIcon("ImageSquare");
export const Info = /* @__PURE__ */ createIcon("Info");
export const Layout = /* @__PURE__ */ createIcon("Layout");
export const Leaf = /* @__PURE__ */ createIcon("Leaf");
export const LinkSimple = /* @__PURE__ */ createIcon("LinkSimple");
export const List = /* @__PURE__ */ createIcon("List");
export const MagnifyingGlass = /* @__PURE__ */ createIcon("MagnifyingGlass");
export const Pause = /* @__PURE__ */ createIcon("Pause");
export const Play = /* @__PURE__ */ createIcon("Play");
export const Plus = /* @__PURE__ */ createIcon("Plus");
export const SealCheck = /* @__PURE__ */ createIcon("SealCheck");
export const ShieldCheck = /* @__PURE__ */ createIcon("ShieldCheck");
export const SlidersHorizontal =
  /* @__PURE__ */ createIcon("SlidersHorizontal");
export const Sparkle = /* @__PURE__ */ createIcon("Sparkle");
export const SquaresFour = /* @__PURE__ */ createIcon("SquaresFour");
export const Stack = /* @__PURE__ */ createIcon("Stack");
export const Star = /* @__PURE__ */ createIcon("Star");
export const Sword = /* @__PURE__ */ createIcon("Sword");
export const Tag = /* @__PURE__ */ createIcon("Tag");
export const Target = /* @__PURE__ */ createIcon("Target");
export const Trash = /* @__PURE__ */ createIcon("Trash");
export const WarningCircle = /* @__PURE__ */ createIcon("WarningCircle");
export const Waveform = /* @__PURE__ */ createIcon("Waveform");
export const X = /* @__PURE__ */ createIcon("X");
