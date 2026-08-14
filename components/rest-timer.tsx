import React, { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Surface } from "@/components/fittrack-ui";
import { useColors } from "@/hooks/use-colors";

export function RestTimer({ initialSeconds = 90 }: { initialSeconds?: number }) {
  const colors = useColors();
  const [seconds, setSeconds] = useState(initialSeconds);
  const [running, setRunning] = useState(false);
  const formatted = useMemo(() => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`, [seconds]);

  useEffect(() => {
    if (!running) return;
    activateKeepAwakeAsync("fittrack-rest").catch(() => undefined);
    const interval = setInterval(() => setSeconds((value) => {
      if (value <= 1) {
        clearInterval(interval);
        setRunning(false);
        Alert.alert("Descanso finalizado", "Hora de voltar para a próxima série.");
        return 0;
      }
      return value - 1;
    }), 1000);
    return () => { clearInterval(interval); deactivateKeepAwake("fittrack-rest").catch(() => undefined); };
  }, [running]);

  const reset = () => { setRunning(false); setSeconds(initialSeconds); };
  return <Surface style={styles.card}>
    <View style={styles.header}><View style={[styles.icon, { backgroundColor: `${colors.warning}18` }]}><IconSymbol name="timer" size={20} color={colors.warning} /></View><View style={styles.copy}><Text style={[styles.title, { color: colors.foreground }]}>Descanso entre séries</Text><Text style={[styles.subtitle, { color: colors.muted }]}>Controle seu ritmo sem sair da tela</Text></View><Text style={[styles.time, { color: colors.foreground }]}>{formatted}</Text></View>
    <View style={styles.controls}><Pressable onPress={() => setSeconds((value) => Math.max(15, value - 15))} style={({ pressed }) => [styles.adjust, { borderColor: colors.border, opacity: pressed ? 0.65 : 1 }]}><Text style={[styles.adjustText, { color: colors.muted }]}>−15s</Text></Pressable><Pressable onPress={() => { if (seconds === 0) setSeconds(initialSeconds); setRunning((value) => !value); }} style={({ pressed }) => [styles.playButton, { backgroundColor: running ? colors.warning : colors.primary, opacity: pressed ? 0.8 : 1 }]}><IconSymbol name={running ? "pause.fill" : "play.fill"} size={18} color="#ffffff" /><Text style={styles.playText}>{running ? "Pausar" : "Iniciar"}</Text></Pressable><Pressable onPress={() => setSeconds((value) => value + 15)} style={({ pressed }) => [styles.adjust, { borderColor: colors.border, opacity: pressed ? 0.65 : 1 }]}><Text style={[styles.adjustText, { color: colors.muted }]}>+15s</Text></Pressable><Pressable onPress={reset} style={({ pressed }) => [styles.resetButton, { opacity: pressed ? 0.65 : 1 }]}><IconSymbol name="arrow.clockwise" size={17} color={colors.muted} /></Pressable></View>
  </Surface>;
}

const styles = StyleSheet.create({
  card: { padding: 15, borderRadius: 19, gap: 15 },
  header: { flexDirection: "row", alignItems: "center", gap: 10 },
  icon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  copy: { flex: 1 },
  title: { fontSize: 14, fontWeight: "900" },
  subtitle: { fontSize: 11, marginTop: 3 },
  time: { fontSize: 22, fontWeight: "900", letterSpacing: 1 },
  controls: { flexDirection: "row", alignItems: "center", gap: 8 },
  adjust: { minHeight: 40, borderRadius: 12, borderWidth: 1, paddingHorizontal: 11, alignItems: "center", justifyContent: "center" },
  adjustText: { fontSize: 11, fontWeight: "900" },
  playButton: { flex: 1, minHeight: 43, borderRadius: 13, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },
  playText: { color: "#ffffff", fontSize: 13, fontWeight: "900" },
  resetButton: { width: 34, height: 40, alignItems: "center", justifyContent: "center" },
});
