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
import { ArrowLeft, MoreVertical } from "lucide-react-native";

export default function Quiz1Screen() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleNo = () => {
    // Navigate back or show different flow
    router.back();
  };

  const handleYes = () => {
    router.push("/(onboarding)/(quiz)/quiz-2");
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

        {/* Content */}
        <View style={styles.contentArea}>
          <Text style={styles.subtitle}>Trước khi tiến hành đăng ký...</Text>

          <Text style={styles.title}>
            Đây là ứng dụng dành cho Người hướng dẫn đăng ký hoạt động với
            Drivemate. Bạn có muốn đăng ký trở thành Người hướng dẫn?
          </Text>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Nếu đối tác đã từng hoạt động với Drivemate, cần sử dụng đúng
              email đã đăng ký tài khoản.
            </Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.noButton} onPress={handleNo}>
            <Text style={styles.noButtonText}>Quay lại</Text>
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
    marginBottom: 40,
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
  },
  helpButton: {
    justifyContent: "center",
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderColor: "#92929D",
    borderWidth: 1,
  },
  contentArea: {
    flex: 1,
    alignItems: "flex-start",
  },
  subtitle: {
    fontSize: 16,
    color: "#92929D",
    marginBottom: 20,
    textAlign: "left",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
    lineHeight: 28,
    marginBottom: 30,
  },
  infoBox: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
    borderRadius: 5,
    padding: 20,
    marginTop: 20,
  },
  infoText: {
    fontSize: 16,
    color: "#000",
    lineHeight: 20,
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
