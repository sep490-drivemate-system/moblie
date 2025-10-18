import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ArrowLeft, MoreVertical } from "lucide-react-native";

export default function Quiz4Screen() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleNo = () => {
    router.back();
  };

  const handleYes = async () => {
    try {
      // Mark quiz as completed
      await AsyncStorage.setItem("quiz_completed", "true");

      // Navigate to avatar page
      router.push("/(onboarding)/(personal-identification)/(avatar)/avatar");
    } catch (error) {
      console.error("Error saving quiz completion:", error);
      router.push("/(onboarding)/(personal-identification)/(avatar)/avatar");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ArrowLeft color="#000" size={24} />
          </TouchableOpacity>
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.helpButton}>
              <Text>Cần hỗ trợ ?</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.notificationButton}>
              <View style={styles.notificationDot} />
              <MoreVertical color="#000" size={24} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>4/4</Text>
        </View>

        {/* Content */}
        <View style={styles.contentArea}>
          <Text style={styles.title}>Bạn đã có lý lịch tư pháp chưa?</Text>

          <View style={styles.infoBox}>
            <Text style={styles.infoItem}>
              • Lý lịch tư pháp còn hạn ít nhất 10 tháng kể từ ngày cấp
            </Text>
            <Text style={styles.infoItem}>
              • Bạn có thể đăng ký bằng giấy hẹn lý lịch tư pháp hoặc biên lai
              bưu điện
            </Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.noButton} onPress={handleNo}>
            <Text style={styles.noButtonText}>Không</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.yesButton} onPress={handleYes}>
            <Text style={styles.yesButtonText}>Có, tiếp tục</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: StatusBar.currentHeight,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerButtons: {
    flexDirection: "row",
  },
  notificationButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    position: "relative",
  },
  notificationDot: {
    position: "absolute",
    top: 8,
    right: 12,
    width: 8,
    height: 8,
    backgroundColor: "#FF0000",
    borderRadius: 4,
  },
  helpButton: {
    justifyContent: "center",
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderColor: "#92929D",
    borderWidth: 1,
  },
  progressContainer: {
    marginBottom: 30,
  },
  progressText: {
    fontSize: 16,
    color: "#92929D",
  },
  contentArea: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 30,
    textAlign: "left",
  },
  infoBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: "100%",
  },
  infoItem: {
    fontSize: 16,
    color: "#000",
    lineHeight: 22,
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    gap: 15,
  },
  noButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: "center",
  },
  noButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  yesButton: {
    flex: 1,
    backgroundColor: "#026AA7",
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: "center",
  },
  yesButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
