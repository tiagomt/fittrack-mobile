// Fallback para usar MaterialIcons no Android e na web; no iOS o mapa mantém nomes familiares de SF Symbols.
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type MaterialIconName = ComponentProps<typeof MaterialIcons>["name"];
type IconMapping = Record<string, MaterialIconName>;
export type IconSymbolName = keyof typeof MAPPING;

const MAPPING: IconMapping = {
  "house.fill": "home",
  calendar: "calendar-today",
  "figure.strengthtraining.traditional": "fitness-center",
  "chart.bar.fill": "bar-chart",
  "gearshape.fill": "settings",
  plus: "add",
  "plus.circle.fill": "add-circle",
  "checkmark.circle.fill": "check-circle",
  "circle": "radio-button-unchecked",
  "play.fill": "play-arrow",
  "pause.fill": "pause",
  "stop.fill": "stop",
  "timer": "timer",
  bell: "notifications-none",
  "bell.fill": "notifications",
  "bell.slash": "notifications-off",
  pencil: "edit",
  trash: "delete-outline",
  "chevron.up": "keyboard-arrow-up",
  "chevron.down": "keyboard-arrow-down",
  "chevron.right": "chevron-right",
  "chevron.left": "chevron-left",
  "arrow.clockwise": "refresh",
  "doc.on.doc": "content-copy",
  "ellipsis.circle": "more-horiz",
  "info.circle": "info-outline",
  "xmark": "close",
  magnifyingglass: "search",
  "clock": "schedule",
  "flame.fill": "local-fire-department",
  "trophy.fill": "emoji-events",
  "square.and.arrow.up": "ios-share",
  "checkmark": "check",
  "arrow.right": "arrow-forward",
};

export function IconSymbol({ name, size = 24, color, style }: { name: IconSymbolName; size?: number; color: string | OpaqueColorValue; style?: StyleProp<TextStyle>; weight?: SymbolWeight }) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
