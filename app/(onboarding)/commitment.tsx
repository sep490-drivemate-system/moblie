import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  ScrollView,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ArrowLeft, MoreVertical, Check } from "lucide-react-native";
import CustomAlert from "@/components/CustomAlert";
import { AppColors } from "@/constants/Colors";

export default function CommitmentScreen() {
  const router = useRouter();
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    buttons: [] as Array<{
      text: string;
      onPress: () => void;
      style?: "default" | "cancel" | "destructive";
    }>,
  });

  // Commitment states
  const [commitments, setCommitments] = useState({
    validLicense: false,
    trafficLaws: false,
    noCriminalRecord: false,
    noInvestigation: false,
    healthCondition: false,
  });

  useEffect(() => {
    loadUserData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadUserData();
    }, [])
  );

  const loadUserData = async () => {
    try {
      // Check if onboarding was reset
      const onboardingCompleted = await AsyncStorage.getItem(
        "onboarding_completed"
      );
      const quizCompleted = await AsyncStorage.getItem("quiz_completed");

      // If onboarding was reset, clear all data
      if (!onboardingCompleted || !quizCompleted) {
        setCommitments({
          validLicense: false,
          trafficLaws: false,
          noCriminalRecord: false,
          noInvestigation: false,
          healthCondition: false,
        });
        await AsyncStorage.removeItem("commitment_data");
        return;
      }

      const savedCommitments = await AsyncStorage.getItem("commitment_data");

      if (savedCommitments) {
        setCommitments(JSON.parse(savedCommitments));
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const showCustomAlert = (
    title: string,
    message: string,
    buttons: Array<{
      text: string;
      onPress: () => void;
      style?: "default" | "cancel" | "destructive";
    }>
  ) => {
    setAlertConfig({
      title,
      message,
      buttons,
    });
    setShowAlert(true);
  };

  const handleCommitmentToggle = (commitment: keyof typeof commitments) => {
    const newCommitments = {
      ...commitments,
      [commitment]: !commitments[commitment],
    };
    setCommitments(newCommitments);

    // Save commitments temporarily
    AsyncStorage.setItem("commitment_data", JSON.stringify(newCommitments));
  };

  // Check if all commitments are checked
  const isFormComplete = () => {
    return Object.values(commitments).every((value) => value === true);
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleNext = async () => {
    // Validation
    if (!isFormComplete()) {
      showCustomAlert("Lỗi", "Vui lòng đồng ý với tất cả các cam kết", [
        {
          text: "OK",
          onPress: () => setShowAlert(false),
        },
      ]);
      return;
    }

    try {
      // Save data to AsyncStorage
      await AsyncStorage.setItem(
        "commitment_data",
        JSON.stringify(commitments)
      );

      // Navigate to next page
      router.push("/(onboarding)/terms-and-conditions");
    } catch (error) {
      showCustomAlert("Lỗi", "Không thể lưu cam kết", [
        {
          text: "OK",
          onPress: () => setShowAlert(false),
        },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}></View>

          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>

          <View>
            <Image
              source={require("@/assets/images/background_3.png")}
              style={styles.background_3}
            />
          </View>

          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Cam kết</Text>
          </View>

          {/* Commitments List */}
          <View style={styles.commitmentsContainer}>
            <View style={styles.commitmentItem}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => handleCommitmentToggle("validLicense")}
              >
                <View
                  style={[
                    styles.checkbox,
                    commitments.validLicense && styles.checkedBox,
                  ]}
                >
                  {commitments.validLicense && (
                    <Check color="#FFFFFF" size={16} />
                  )}
                </View>
              </TouchableOpacity>
              <Text style={styles.commitmentText}>
                Tôi có và sẽ duy trì giấy phép lái xe còn điểm và còn hiệu lực
                trong suốt quá trình hoạt động với DriveMate
              </Text>
            </View>

            <View style={styles.commitmentItem}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => handleCommitmentToggle("trafficLaws")}
              >
                <View
                  style={[
                    styles.checkbox,
                    commitments.trafficLaws && styles.checkedBox,
                  ]}
                >
                  {commitments.trafficLaws && (
                    <Check color="#FFFFFF" size={16} />
                  )}
                </View>
              </TouchableOpacity>
              <Text style={styles.commitmentText}>
                Tôi cam kết tuân thủ quy định pháp luật về giao thông đường bộ,
                đảm bảo thực hiện trách nhiệm về kiểm định phương tiện tham gia
                giao thông và chỉ điều khiển phương tiện tương ứng với loại giấy
                phép lái xe được cấp
              </Text>
            </View>

            <View style={styles.commitmentItem}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => handleCommitmentToggle("noCriminalRecord")}
              >
                <View
                  style={[
                    styles.checkbox,
                    commitments.noCriminalRecord && styles.checkedBox,
                  ]}
                >
                  {commitments.noCriminalRecord && (
                    <Check color="#FFFFFF" size={16} />
                  )}
                </View>
              </TouchableOpacity>
              <Text style={styles.commitmentText}>
                Tôi không có/ không còn án tích tại thời điểm hiện tại thời điểm
                tham gia DriveMate
              </Text>
            </View>

            <View style={styles.commitmentItem}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => handleCommitmentToggle("noInvestigation")}
              >
                <View
                  style={[
                    styles.checkbox,
                    commitments.noInvestigation && styles.checkedBox,
                  ]}
                >
                  {commitments.noInvestigation && (
                    <Check color="#FFFFFF" size={16} />
                  )}
                </View>
              </TouchableOpacity>
              <Text style={styles.commitmentText}>
                Tôi không đang trong giai đoạn bị điều tra, khởi tố, truy tố
              </Text>
            </View>

            <View style={styles.commitmentItem}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => handleCommitmentToggle("healthCondition")}
              >
                <View
                  style={[
                    styles.checkbox,
                    commitments.healthCondition && styles.checkedBox,
                  ]}
                >
                  {commitments.healthCondition && (
                    <Check color="#FFFFFF" size={16} />
                  )}
                </View>
              </TouchableOpacity>
              <Text style={styles.commitmentText}>
                Tôi cam kết đủ sức khỏe và đủ các điều kiện khác theo quy định
                để điều khiển phương tiện tham gia giao thông trên đường
              </Text>
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
              <Text style={styles.backButtonText}>Quay lại</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>Kế tiếp</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Custom Alert */}
      <CustomAlert
        visible={showAlert}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: StatusBar.currentHeight,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  progressBar: {
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  progressFill: {
    width: "56%",
    height: "100%",
    backgroundColor: AppColors.primary,
    borderRadius: 2,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  helpButton: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderColor: "#92929D",
    borderWidth: 1,
    marginRight: 10,
  },
  helpButtonText: {
    fontSize: 14,
    color: "#000",
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
  background_3: {
    width: "100%",
    height: 250,
  },
  titleContainer: {
    alignItems: "flex-start",
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#000",
  },
  commitmentsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  commitmentItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  checkboxContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  checkedBox: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  commitmentText: {
    flex: 1,
    fontSize: 16,
    color: "#000",
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    gap: 15,
    paddingHorizontal: 20,
  },
  backButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: AppColors.primary,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: "center",
  },
  nextButton: {
    flex: 1,
    backgroundColor: AppColors.primary,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.primary,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
