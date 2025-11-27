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
  Linking,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ArrowLeft,
  MoreVertical,
  Check,
  ExternalLink,
} from "lucide-react-native";
import CustomAlert from "@/components/CustomAlert";
import { useAppDispatch } from "@/lib/redux/hooks";
import { getInstructorPolicy } from "@/features/auth/authThunk";
import { Policy } from "@/models/policy/policy";

export default function TermsAndConditionsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
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
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [policyAccepted, setPolicyAccepted] = useState<{
    [id: string]: boolean;
  }>({});

  // Terms acceptance states
  const [termsAccepted, setTermsAccepted] = useState({
    privacyNotice: false,
    termsOfUse: false,
    instructorTerms: false,
    codeOfConduct: false,
  });

  useEffect(() => {
    loadUserData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadUserData();
    }, [])
  );

  useEffect(() => {
    const getPolicies = async () => {
      const response = await dispatch(
        getInstructorPolicy({ type: 2 })
      ).unwrap();
      console.log(response.value);
      setPolicies(response.value!);
      const initial = response.value!.reduce((acc: any, p: Policy) => {
        acc[p.id] = false;
        return acc;
      }, {});
      setPolicyAccepted(initial);
    };
    getPolicies();
  }, []);

  const loadUserData = async () => {
    try {
      // Check if onboarding was reset
      const onboardingCompleted = await AsyncStorage.getItem(
        "onboarding_completed"
      );
      const quizCompleted = await AsyncStorage.getItem("quiz_completed");

      // If onboarding was reset, clear all data
      if (!onboardingCompleted || !quizCompleted) {
        setTermsAccepted({
          privacyNotice: false,
          termsOfUse: false,
          instructorTerms: false,
          codeOfConduct: false,
        });
        await AsyncStorage.removeItem("terms_and_conditions_data");
        return;
      }

      const savedTerms = await AsyncStorage.getItem(
        "terms_and_conditions_data"
      );

      if (savedTerms) {
        setTermsAccepted(JSON.parse(savedTerms));
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

  // Check if all terms are accepted
  const isFormComplete = () => {
    if (policies.length === 0) return false;
    return Object.values(policyAccepted).every((v) => v);
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleNext = async () => {
    // Validation
    if (!isFormComplete()) {
      showCustomAlert("Lỗi", "Vui lòng đồng ý với tất cả các điều khoản", [
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
        "terms_and_conditions_data",
        JSON.stringify(policyAccepted)
      );

      // Navigate to next page
      router.push("/(onboarding)/waiting-confirm");
    } catch (error) {
      showCustomAlert("Lỗi", "Không thể lưu điều khoản", [
        {
          text: "OK",
          onPress: () => setShowAlert(false),
        },
      ]);
    }
  };

  const handlePolicyToggle = (id: string) => {
    const newStates = {
      ...policyAccepted,
      [id]: !policyAccepted[id],
    };
    setPolicyAccepted(newStates);
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
            <Text style={styles.title}>Điều khoản dịch vụ</Text>
          </View>

          {/* Introduction Text */}
          <View style={styles.introContainer}>
            <Text style={styles.introText}>
              Bằng việc tiếp tục, bạn đồng ý với việc xử lý dữ liệu cá nhân của
              bạn để đăng ký (bao gồm kiểm tra lý lịch, liên kết tài khoản với
              DriveMate và quản lý ví điện tử) và xác nhận rằng bạn đã đọc, hiểu
              và đồng ý với các điều khoản của DriveMate.
            </Text>
          </View>

          {/* Terms List */}
          <View style={styles.termsContainer}>
            {policies.map((policy) => (
              <TouchableOpacity
                key={policy.id}
                activeOpacity={1}
                onPress={() => handlePolicyToggle(policy.id)}
                style={{ flexDirection: "row", gap: 10 }}
              >
                <View
                  style={[
                    styles.checkbox,
                    policyAccepted[policy.id] && styles.checkedBox,
                  ]}
                >
                  {policyAccepted[policy.id] && (
                    <Check color="#FFFFFF" size={16} />
                  )}
                </View>
                <Text style={styles.linkText}>{policy.detail}</Text>
              </TouchableOpacity>
            ))}
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
    width: "63%",
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
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#000",
  },
  introContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  introText: {
    fontSize: 16,
    color: "#000",
    lineHeight: 22,
  },
  termsContainer: {
    flex: 1,
    gap: 20,
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  termItem: {
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
  linkContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  linkText: {
    flex: 1,
    fontSize: 16,
    color: "#70E000",
    lineHeight: 22,
    marginRight: 8,
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
    borderColor: "#70E000",
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
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#70E000",
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
