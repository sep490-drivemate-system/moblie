import React, { useState, useEffect } from "react";
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
import { AppColors } from "@/constants/Colors";

interface LicenseClass {
  id: string;
  title: string;
}

export default function Quiz2Screen() {
  const router = useRouter();
  const [licenseClass, setLicenseClass] = useState<LicenseClass | null>(null);

  useEffect(() => {
    loadLicenseClass();
  }, []);

  const loadLicenseClass = async () => {
    try {
      const savedClass = await AsyncStorage.getItem("license_class");
      if (savedClass) {
        setLicenseClass(JSON.parse(savedClass));
      }
    } catch (error) {
      console.error("Error loading license class:", error);
    }
  };

  const getLicenseSpecificText = () => {
    // Always return "B" as default
    return "B";
  };

  const handleBack = () => {
    router.back();
  };

  const handleNo = () => {
    router.back();
  };

  const handleYes = () => {
    router.push("/(onboarding)/(quiz)/quiz-3");
  };

  const licenseSpecificText = getLicenseSpecificText();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}></View>

        {/* Progress */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>2/3</Text>
        </View>

        {/* Content */}
        <View style={styles.contentArea}>
          <Text style={styles.title}>
            Bạn có đáp ứng được yêu cầu sau đây không?
          </Text>

          <View style={styles.requirementsBox}>
            <Text style={styles.requirementItem}>
              • Công dân Việt Nam trong độ tuổi: Nam từ 18 đến 65 tuổi, Nữ từ 18
              đến 65 tuổi; và có khả năng đọc viết
            </Text>
            <Text style={styles.requirementItem}>
              • Có GPLX hạng B trở lên và còn hạn
            </Text>
            <Text style={styles.requirementItem}>
              • Có chứng chỉ hành nghề giảng dạy lái xe
            </Text>
            <Text style={styles.requirementItem}>
              • Có giấy khám sức khỏe đáp ứng hạng B trở lên
            </Text>
            <Text style={styles.requirementItem}>
              • Có kết quả xét nghiệm heroin âm tính
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
    alignItems: "flex-start",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 30,
  },
  requirementsBox: {
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
    borderColor: AppColors.primary,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: "center",
  },
  noButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.primary,
  },
  yesButton: {
    flex: 1,
    backgroundColor: AppColors.primary,
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
