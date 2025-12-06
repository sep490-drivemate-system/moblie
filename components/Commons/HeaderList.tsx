import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  ColorValue,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft } from "lucide-react-native";
import { AppColors } from "@/constants/Colors";
import { RelativePathString, router } from "expo-router";

export interface HeaderListProps {
  actionReturnScreen?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  title: string;
  description?: string;
  colors?: readonly [ColorValue, ColorValue, ...ColorValue[]];
  showCurve?: boolean;
  gradientStart?: { x: number; y: number };
  gradientEnd?: { x: number; y: number };
  style?: ViewStyle;
}

export default function HeaderList({
  actionReturnScreen,
  showBackButton,
  onBackPress,
  title,
  description,
  colors = [AppColors.primary, AppColors.gradientStart, AppColors.gradientEnd],
  showCurve = true,
  gradientStart = { x: 0, y: 0 },
  gradientEnd = { x: 1, y: 1 },
  style,
}: HeaderListProps) {
  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else if (actionReturnScreen) {
      router.push({
        pathname: actionReturnScreen as any,
      });
    } else {
      router.back();
    }
  };

  const shouldShowBackButton =
    showBackButton !== undefined ? showBackButton : !!actionReturnScreen;

  return (
    <LinearGradient
      colors={colors}
      style={[styles.header, style]}
      start={gradientStart}
      end={gradientEnd}
    >
      <View style={styles.headerContent}>
        {shouldShowBackButton && (
          <TouchableOpacity
            activeOpacity={0.75}
            style={styles.backButton}
            onPress={handleBackPress}
          >
            <ArrowLeft size={18} color="#ffffff" />
          </TouchableOpacity>
        )}
        <View style={styles.headerTextContainer}>
          <Text
            style={[
              styles.headerTitle,
              !description && styles.headerTitleNoDescription,
            ]}
          >
            {title}
          </Text>
          {description && (
            <Text style={styles.headerDescription}>{description}</Text>
          )}
        </View>
      </View>
      {showCurve && <View style={styles.headerCurve} />}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    position: "relative",
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  headerTitleNoDescription: {
    marginBottom: 0,
  },
  headerDescription: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 20,
    paddingBottom: 10,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  headerStats: {
    flexDirection: "row",
    gap: 20,
  },
  statItem: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 60,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  statLabel: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 2,
  },
  headerCurve: {
    position: "absolute",
    bottom: -1,
    left: 0,
    right: 0,
    height: 30,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
});
