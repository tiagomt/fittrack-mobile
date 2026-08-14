import React from "react";
import { Pressable, StyleSheet, Text, View, type PressableProps, type TextStyle, type ViewStyle } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";

export function Surface({ children, style, accent }: { children: React.ReactNode; style?: ViewStyle | ViewStyle[]; accent?: boolean }) {
  const colors = useColors();
  return <View style={[styles.surface, { backgroundColor: colors.surface, borderColor: colors.border }, accent && { borderColor: colors.primary, borderWidth: 1.5 }, style]}>{children}</View>;
}

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  const colors = useColors();
  return <View style={styles.sectionHeader}>
    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
    {action && onAction ? <Pressable onPress={onAction} style={({ pressed }) => [styles.headerAction, { opacity: pressed ? 0.65 : 1 }]}><Text style={[styles.headerActionText, { color: colors.primary }]}>{action}</Text></Pressable> : null}
  </View>;
}

export function PrimaryButton({ children, onPress, icon, variant = "primary", style, ...props }: PressableProps & { children: React.ReactNode; icon?: string; variant?: "primary" | "secondary" | "ghost" | "danger"; style?: ViewStyle }) {
  const colors = useColors();
  const background = variant === "primary" ? colors.primary : variant === "danger" ? colors.error : variant === "secondary" ? colors.background : "transparent";
  const foreground = variant === "primary" || variant === "danger" ? "#ffffff" : colors.primary;
  return <Pressable {...props} onPress={onPress} style={({ pressed }) => [styles.button, { backgroundColor: background, borderColor: variant === "secondary" ? colors.border : background, opacity: pressed ? 0.82 : 1 }, variant === "ghost" && styles.ghostButton, style]}>
    {icon ? <IconSymbol name={icon as any} size={18} color={foreground} /> : null}
    <Text style={[styles.buttonText, { color: foreground }]}>{children}</Text>
  </Pressable>;
}

export function ProgressBar({ value, color }: { value: number; color?: string }) {
  const colors = useColors();
  return <View style={[styles.progressTrack, { backgroundColor: colors.border }]}><View style={[styles.progressFill, { width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: color ?? colors.primary }]} /></View>;
}

export function StatusBadge({ label, tone = "muted" }: { label: string; tone?: "success" | "warning" | "error" | "muted" | "primary" }) {
  const colors = useColors();
  const map = { success: colors.success, warning: colors.warning, error: colors.error, muted: colors.muted, primary: colors.primary };
  return <View style={[styles.badge, { backgroundColor: `${map[tone]}18` }]}><View style={[styles.badgeDot, { backgroundColor: map[tone] }]} /><Text style={[styles.badgeText, { color: map[tone] }]}>{label}</Text></View>;
}

export function EmptyState({ icon, title, description }: { icon: string; title: string; description: string }) {
  const colors = useColors();
  return <View style={styles.emptyState}><View style={[styles.emptyIcon, { backgroundColor: `${colors.primary}16` }]}><IconSymbol name={icon as any} size={28} color={colors.primary} /></View><Text style={[styles.emptyTitle, { color: colors.foreground }]}>{title}</Text><Text style={[styles.emptyDescription, { color: colors.muted }]}>{description}</Text></View>;
}

export const typography: Record<string, TextStyle> = StyleSheet.create({
  title: { fontSize: 32, lineHeight: 38, fontWeight: "800", letterSpacing: -0.6 },
  subtitle: { fontSize: 15, lineHeight: 21 },
  cardTitle: { fontSize: 17, lineHeight: 22, fontWeight: "700" },
  body: { fontSize: 14, lineHeight: 20 },
  caption: { fontSize: 12, lineHeight: 17, fontWeight: "600" },
});

const styles = StyleSheet.create({
  surface: { borderRadius: 22, borderWidth: 1, padding: 16 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  sectionTitle: { fontSize: 18, lineHeight: 24, fontWeight: "800" },
  headerAction: { paddingVertical: 4, paddingHorizontal: 2 },
  headerActionText: { fontSize: 13, fontWeight: "700" },
  button: { minHeight: 48, borderRadius: 15, borderWidth: 1, paddingHorizontal: 18, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  ghostButton: { borderWidth: 0, paddingHorizontal: 10 },
  buttonText: { fontSize: 15, fontWeight: "800" },
  progressTrack: { height: 8, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 4 },
  badge: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 11, fontWeight: "800" },
  emptyState: { alignItems: "center", paddingVertical: 34, paddingHorizontal: 20 },
  emptyIcon: { width: 64, height: 64, borderRadius: 20, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontWeight: "800", textAlign: "center" },
  emptyDescription: { fontSize: 14, lineHeight: 20, textAlign: "center", marginTop: 6 },
});
