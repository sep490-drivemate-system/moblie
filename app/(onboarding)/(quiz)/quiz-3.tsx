import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, MoreVertical } from "lucide-react-native";

export default function Quiz3Screen() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleNo = () => {
    router.back();
  };

  const handleYes = () => {
    router.push("/(onboarding)/(personal-identification)/(avatar)/avatar");
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
              <MoreVertical color="#000" size={24} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>3/3</Text>
        </View>

        {/* Content */}
        <View style={styles.contentArea}>
          <Text style={styles.title}>Bạn đã có lý lịch tư pháp chưa?</Text>

          {/* Car Illustration */}
          <Image
            source={require("@/assets/images/icon2.png")}
            style={styles.icon2}
          />

          <View style={styles.requirementsBox}>
            <Text style={styles.requirementItem}>
              • Lý lịch tư pháp còn hạn ít nhất 10 tháng kể từ ngày cấp
            </Text>
            <Text style={styles.requirementItem}>
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
  },
  headerButtons: {
    flexDirection: "row",
  },
  notificationButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
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
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 30,
  },
  icon2: {
    width: 250,
    height: 200,
    marginBottom: 20,
  },
  requirementsBox: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 20,
    width: "100%",
  },
  requirementItem: {
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
    backgroundColor: "#70E000",
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
