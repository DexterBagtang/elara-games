import { Text, type TextProps } from "react-native";

import { theme } from "@/theme";

const variants = {
  /** page brand mark */
  display: { fontFamily: theme.font.bold, fontSize: 30, color: theme.color.grape },
  /** screen / card heading */
  title: { fontFamily: theme.font.semibold, fontSize: 22, color: theme.color.ink },
  /** button + card label */
  label: { fontFamily: theme.font.semibold, fontSize: 18, color: theme.color.ink },
  /** quiet helper text (for the grown-up) */
  hint: { fontFamily: theme.font.medium, fontSize: 13, color: theme.color.inkSoft },
  /** celebration */
  huge: { fontFamily: theme.font.bold, fontSize: 52, color: theme.color.grape },
} as const;

export function Txt({
  variant = "label",
  style,
  ...props
}: TextProps & { variant?: keyof typeof variants }) {
  return <Text style={[variants[variant], style]} {...props} />;
}
