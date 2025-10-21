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

export default function CommitmentScreen() {
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(false);
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
        setIsSaved(false);
        await AsyncStorage.removeItem("commitment_data");
        return;
      }

      const savedCommitments = await AsyncStorage.getItem("commitment_data");

      if (savedCommitments) {
        setCommitments(JSON.parse(savedCommitments));
        setIsSaved(true);
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
    // Reset saved state when user changes data
    if (isSaved) {
      setIsSaved(false);
    }

    setCommitments((prev) => ({
      ...prev,
      [commitment]: !prev[commitment],
    }));
  };

  // Check if all commitments are checked
  const isFormComplete = () => {
    return Object.values(commitments).every((value) => value === true);
  };

  const handleSave = async () => {
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
      await AsyncStorage.setItem(
        "commitment_data",
        JSON.stringify(commitments)
      );
      setIsSaved(true);

      showCustomAlert("Thành công", "Cam kết đã được lưu", [
        {
          text: "OK",
          onPress: () => setShowAlert(false),
        },
      ]);
    } catch (error) {
      showCustomAlert("Lỗi", "Không thể lưu cam kết", [
        {
          text: "OK",
          onPress: () => setShowAlert(false),
        },
      ]);
    }
  };

  const handleNext = () => {
    router.push("/(onboarding)/commitment");
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
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <ArrowLeft color="#000" size={24} />
            </TouchableOpacity>

            <View style={styles.headerButtons}>
              <TouchableOpacity style={styles.helpButton}>
                <Text style={styles.helpButtonText}>Cần hỗ trợ ?</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.notificationButton}>
                <View style={styles.notificationDot} />
                <MoreVertical color="#000" size={24} />
              </TouchableOpacity>
            </View>
          </View>

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
            <TouchableOpacity
              style={[
                styles.saveButton,
                !isFormComplete() && styles.disabledButton,
                isSaved && styles.savedButton,
              ]}
              onPress={handleSave}
              disabled={!isFormComplete() || isSaved}
            >
              <Text
                style={[
                  styles.saveButtonText,
                  isSaved && styles.savedButtonText,
                ]}
              >
                Lưu
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.nextButton, !isSaved && styles.disabledNextButton]}
              onPress={handleNext}
              disabled={!isSaved}
            >
              <Text
                style={[
                  styles.nextButtonText,
                  !isSaved && styles.disabledNextButtonText,
                ]}
              >
                Kế tiếp
              </Text>
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
  backButton: {
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
    width: "50%",
    height: "100%",
    backgroundColor: "#70E000",
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
    backgroundColor: "#70E000",
    borderColor: "#70E000",
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
  saveButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: "center",
  },
  nextButton: {
    flex: 1,
    backgroundColor: "#70E000",
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#F0F0F0",
    borderColor: "#E0E0E0",
  },
  savedButton: {
    backgroundColor: "#E0E0E0",
    borderColor: "#E0E0E0",
  },
  savedButtonText: {
    color: "#92929D",
  },
  disabledNextButton: {
    backgroundColor: "#B8E6B8",
  },
  disabledNextButtonText: {
    color: "#FFFFFF",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
