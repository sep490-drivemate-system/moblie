import { RootState } from "@/lib/redux/store";
import { AuthViewModel } from "@/viewmodels/auth/AuthViewModel";
import { useViewModel } from "@/viewmodels/shared/BaseViewModel";
import { useRouter } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import CustomAlert from "@/components/CustomAlert";
import { ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppColors } from "@/constants/Colors";

export default function SignUpScreen() {
  const router = useRouter();
  const [authState, authViewModel] = useViewModel(
    AuthViewModel,
    (state: RootState) => state.auth
  );

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);

  // Helper function to validate form using current state
  const isFormValid = () => {
    const { registerFormData, registerFormErrors } = authState;

    // Validate all fields
    const validateEmail = (email: string) => {
      if (!email.trim()) return "Email không được để trống";
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) return "Email không đúng định dạng";
      return undefined;
    };

    const validatePassword = (password: string) => {
      if (!password) return "Mật khẩu không được để trống";
      const errors: string[] = [];
      if (password.length < 6) errors.push("Mật khẩu phải có ít nhất 6 ký tự");
      if (!/[A-Z]/.test(password))
        errors.push("Mật khẩu phải có ít nhất 1 ký tự hoa");
      if (!/[0-9]/.test(password))
        errors.push("Mật khẩu phải có ít nhất 1 ký tự số");
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
        errors.push("Mật khẩu phải có ít nhất 1 ký tự đặc biệt");
      return errors.length > 0 ? errors.join("\n") : undefined;
    };

    const validateConfirmPassword = (
      confirmPassword: string,
      password: string
    ) => {
      if (!confirmPassword) return "Vui lòng nhập lại mật khẩu";
      if (confirmPassword !== password) return "Mật khẩu nhập lại không khớp";
      return undefined;
    };

    const validatePhone = (phone: string) => {
      if (!phone.trim()) return "Số điện thoại không được để trống";
      if (phone.length !== 10) return "Số điện thoại phải có đủ 10 chữ số";
      return undefined;
    };

    const emailError = validateEmail(registerFormData.email);
    const passwordError = validatePassword(registerFormData.password);
    const confirmPasswordError = validateConfirmPassword(
      registerFormData.confirmPassword,
      registerFormData.password
    );
    const phoneError = validatePhone(registerFormData.phone);

    // Check if there are any errors
    const hasErrors = !!(
      emailError ||
      passwordError ||
      confirmPasswordError ||
      phoneError
    );

    // Check acceptTerms
    const termsAccepted = registerFormData.acceptTerms;

    return !hasErrors && termsAccepted;
  };

  // Set router to ViewModel for navigation
  useEffect(() => {
    authViewModel.setRouter(router);
  }, [router, authViewModel]);

  // Hiển thị modal lỗi khi có errorMessage
  useEffect(() => {
    if (authState.errorMessage) {
      setShowErrorAlert(true);
      console.log("authState.errorMessage", authState.errorMessage);
    }
  }, [authState.errorMessage]);

  useEffect(() => {
    const resetOnboardingData = async () => {
      try {
        // Danh sách tất cả các keys cần xóa trong quá trình onboarding
        const keysToRemove = [
          // Role và onboarding status
          "user_role",
          "onboarding_completed",
          "quiz_completed",
          "car_added",
          "otp_verified",

          // Form data
          "terms_and_conditions_data",
          "emergency_contact_data",
          "commitment_data",

          // Personal Identification - Avatar
          "temp_user_avatar",
          "user_avatar",

          // Personal Identification - ID Card
          "temp_id_front",
          "temp_id_back",
          "id_front",
          "id_back",
          "id_card_data",

          // Personal Identification - License
          "temp_license_front",
          "temp_license_back",
          "license_front",
          "license_back",
          "license_data",

          // Personal Identification - Professional License/Certificate
          "temp_certificate",
          "certificate",
          "certificate_data",

          // Personal Identification - Healthcare Certificate
          "temp_healthcare_certificate",
          "healthcare_certificate",
          "healthcare_certificate_data",

          // Personal Identification - Criminal Record
          "temp_criminal_record",
          "criminal_record",
          "criminal_record_data",

          // Car - Registration
          "temp_car_registration_front",
          "temp_car_registration_back",
          "car_registration_front",
          "car_registration_back",
          "car_registration_data",

          // Car - Insurance
          "temp_car_insurance_front",
          "temp_car_insurance_back",
          "car_insurance_front",
          "car_insurance_back",
          "car_insurance_data",

          // Car - Inspection Certificate
          "temp_car_inspection_certificate_front",
          "temp_car_inspection_certificate_back",
          "car_inspection_certificate_front",
          "car_inspection_certificate_back",
          "car_inspection_certificate_data",

          // Car - Verification Images
          "temp_car_verification_front",
          "temp_car_verification_back",
          "temp_car_verification_side",
          "temp_car_verification_interior",
        ];

        // Xóa tất cả các keys
        await Promise.all(
          keysToRemove.map((key) => AsyncStorage.removeItem(key))
        );

        console.log("Onboarding data has been reset successfully");
      } catch (error) {
        console.error("Error resetting onboarding data:", error);
      }
    };

    resetOnboardingData();
  }, []);

  if (authState.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={AppColors.primary} />
        <Text style={styles.loadingText}>Đang xử lý...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="default" />
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* {authViewModel.getErrorMessage() && (
          <View style={styles.errorModalOverlay} pointerEvents="none">
            <View style={styles.errorModal}>
              <Text style={styles.errorModalTitle}>Không thể đăng ký</Text>
              <Text style={styles.errorModalMessage}>
                {authViewModel.getErrorMessage()}
              </Text>
            </View>
          </View>
        )} */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Image
                source={require("@/assets/images/logo_whitebg.png")}
                style={styles.logo}
              />
            </View>

            {/* Title */}
            <View style={styles.titleContainer}>
              <View style={styles.titleSectionLeft}>
                <Text style={styles.title}>
                  Đăng ký để trở thành một phần của{" "}
                  <Text style={styles.titleHighlight}>DRIVEMATE</Text>
                </Text>
                <Text style={styles.titleDescription}>
                  Vui lòng cho chúng tôi biết về bạn
                </Text>
              </View>
              <Image
                style={styles.icon1}
                source={require("@/assets/images/icon1.png")}
              />
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Email <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    authState.registerFormErrors.email && styles.inputError,
                  ]}
                  value={authState.registerFormData.email}
                  onChangeText={(value) =>
                    authViewModel.updateRegisterFormData("email", value)
                  }
                  placeholder="Nhập email"
                  placeholderTextColor="#92929D"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {authState.registerFormErrors.email && (
                  <Text style={styles.errorText}>
                    {authState.registerFormErrors.email}
                  </Text>
                )}
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Mật khẩu <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[
                      styles.passwordInput,
                      authState.registerFormErrors.password &&
                        styles.inputError,
                    ]}
                    value={authState.registerFormData.password}
                    onChangeText={(value) =>
                      authViewModel.updateRegisterFormData("password", value)
                    }
                    placeholder="Nhập mật khẩu"
                    placeholderTextColor="#92929D"
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color="#92929D" />
                    ) : (
                      <Eye size={20} color="#92929D" />
                    )}
                  </TouchableOpacity>
                </View>
                {authState.registerFormErrors.password && (
                  <View style={styles.errorContainer}>
                    {authState.registerFormErrors.password
                      ?.split("\n")
                      .map((error, index) => (
                        <Text key={index} style={styles.errorText}>
                          {error}
                        </Text>
                      ))}
                  </View>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Nhập lại mật khẩu <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[
                      styles.passwordInput,
                      authState.registerFormErrors.confirmPassword &&
                        styles.inputError,
                    ]}
                    value={authState.registerFormData.confirmPassword}
                    onChangeText={(value) =>
                      authViewModel.updateRegisterFormData(
                        "confirmPassword",
                        value
                      )
                    }
                    placeholder="Nhập lại mật khẩu"
                    placeholderTextColor="#92929D"
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} color="#92929D" />
                    ) : (
                      <Eye size={20} color="#92929D" />
                    )}
                  </TouchableOpacity>
                </View>
                {authState.registerFormErrors.confirmPassword && (
                  <Text style={styles.errorText}>
                    {authState.registerFormErrors.confirmPassword}
                  </Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Số điện thoại <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    authState.registerFormErrors.phone && styles.inputError,
                  ]}
                  value={authState.registerFormData.phone}
                  onChangeText={(value) => {
                    const numericValue = value.replace(/\D/g, "");
                    authViewModel.updateRegisterFormData("phone", numericValue);
                  }}
                  placeholder="Nhập số điện thoại"
                  placeholderTextColor="#92929D"
                  keyboardType="phone-pad"
                  autoCorrect={false}
                  maxLength={10}
                />
                {authState.registerFormErrors.phone && (
                  <Text style={styles.errorText}>
                    {authState.registerFormErrors.phone}
                  </Text>
                )}
              </View>
            </View>

            {/* Terms */}
            <View style={styles.termsContainer}>
              <TouchableOpacity
                activeOpacity={1}
                style={styles.checkboxContainer}
                onPress={() =>
                  authViewModel.updateRegisterFormData(
                    "acceptTerms",
                    !authState.registerFormData.acceptTerms as boolean
                  )
                }
              >
                <View
                  style={[
                    styles.checkbox,
                    authState.registerFormData.acceptTerms &&
                      styles.checkboxChecked,
                  ]}
                >
                  {authState.registerFormData.acceptTerms && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
                <Text style={styles.termsText}>
                  Bằng cách tiếp tục, tôi đồng ý với việc DriveMate có thể thu
                  thập, sử dụng và tiết lộ thông tin do tôi cung cấp theo{" "}
                  <Text style={styles.termsLink}>
                    Thông báo về quyền riêng tư
                  </Text>
                  . Tôi cũng xác nhận đã đọc, hiểu rõ và hoàn toàn tuân thủ các{" "}
                  <Text style={styles.termsLink}>Điều khoản và điều kiện</Text>.
                </Text>
              </TouchableOpacity>
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  !isFormValid() && styles.primaryButtonDisabled,
                ]}
                onPress={authViewModel.handleRegister}
                disabled={!isFormValid()}
              >
                <Text
                  style={[
                    styles.primaryButtonText,
                    !isFormValid() && styles.primaryButtonTextDisabled,
                  ]}
                >
                  Tiếp theo
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Error Alert Modal */}
      <CustomAlert
        visible={showErrorAlert}
        title="Lỗi"
        message={authState.errorMessage!}
        buttons={[
          {
            text: "OK",
            style: "default",
            onPress: () => {
              setShowErrorAlert(false);
              authViewModel.clearError();
            },
          },
        ]}
      />
    </>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 50,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerButtons: {
    flexDirection: "row",
  },
  logo: {
    width: 150,
    height: 40,
    resizeMode: "cover",
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
  titleContainer: {
    paddingVertical: 30,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
  },
  titleSectionLeft: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "500",
    color: "black",
  },
  titleHighlight: {
    color: AppColors.primary,
    fontWeight: "bold",
    fontSize: 22,
  },
  titleDescription: {
    color: "#92929D",
  },
  icon1: {
    width: 100,
    height: 100,
  },
  formContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  errorModalOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    zIndex: 10,
  },
  errorModal: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: "#FF8080",
  },
  errorModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#B00020",
    textAlign: "center",
    marginBottom: 8,
  },
  errorModalMessage: {
    fontSize: 15,
    lineHeight: 22,
    color: "#5B0000",
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#000",
    marginBottom: 8,
    fontWeight: "500",
  },
  required: {
    color: "#FF0000",
    fontSize: 16,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#000",
    borderWidth: 1,
    borderColor: "#92929D",
  },
  inputError: {
    borderColor: "#FF0000",
  },
  errorContainer: {
    marginTop: 4,
    marginLeft: 4,
  },
  errorText: {
    color: "#FF0000",
    fontSize: 12,
    marginTop: 2,
  },
  passwordContainer: {
    position: "relative",
  },
  passwordInput: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingRight: 50,
    fontSize: 16,
    color: "#000",
    borderWidth: 1,
    borderColor: "#92929D",
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
    top: 14,
    padding: 4,
  },
  termsContainer: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#92929D",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  checkmark: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  termsText: {
    fontSize: 14,
    color: "#92929D",
    lineHeight: 20,
    flex: 1,
  },
  termsLink: {
    color: AppColors.primary,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  buttonContainer: {
    paddingHorizontal: 20,
  },
  primaryButton: {
    backgroundColor: AppColors.primary,
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: "center",
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  primaryButtonDisabled: {
    backgroundColor: "#CCCCCC",
  },
  primaryButtonTextDisabled: {
    color: "#999999",
  },
  multilineInput: {
    minHeight: 50,
    paddingTop: 14,
    paddingBottom: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingTop: StatusBar.currentHeight,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#92929D",
  },
});
