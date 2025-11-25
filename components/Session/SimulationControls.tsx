import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Play, PauseCircle } from "lucide-react-native";
import { AppColors } from "@/constants/Colors";

interface SimulationControlsProps {
  isSimulating: boolean;
  simulationProgress: number;
  currentPosition?: {
    latitude: number;
    longitude: number;
    heading: number;
    speed: number;
  } | null;
  onStart: () => void;
  onStop: () => void;
}

export default function SimulationControls({
  isSimulating,
  simulationProgress,
  currentPosition,
  onStart,
  onStop,
}: SimulationControlsProps) {
  return (
    <View style={styles.simulationControls}>
      <TouchableOpacity
        style={[
          styles.simulationButton,
          isSimulating ? styles.stopButton : styles.startButton,
        ]}
        onPress={isSimulating ? onStop : onStart}
      >
        {isSimulating ? (
          <PauseCircle size={20} color="#fff" strokeWidth={2} />
        ) : (
          <Play size={20} color="#fff" strokeWidth={2} />
        )}
        <Text style={styles.simulationButtonText}>
          {isSimulating ? "Dừng giả lập" : "Bắt đầu giả lập"}
        </Text>
      </TouchableOpacity>

      {isSimulating && (
        <View style={styles.simulationInfo}>
          <Text style={styles.simulationInfoText}>
            Tiến độ: {simulationProgress.toFixed(1)}%
          </Text>
          {currentPosition && (
            <>
              <Text style={styles.simulationInfoText}>
                Tốc độ: {currentPosition.speed.toFixed(1)} km/h
              </Text>
              <Text style={styles.simulationInfoText}>
                Hướng: {currentPosition.heading.toFixed(0)}°
              </Text>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  simulationControls: {
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  simulationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  startButton: {
    backgroundColor: AppColors.primary,
  },
  stopButton: {
    backgroundColor: "#ef4444",
  },
  simulationButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  simulationInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    gap: 6,
  },
  simulationInfoText: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "600",
  },
});




