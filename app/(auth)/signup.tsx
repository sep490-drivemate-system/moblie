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

export default function SignUpScreen() {
  const router = useRouter();
  const [authState, authViewModel] = useViewModel(
    AuthViewModel,
    (state: RootState) => state.auth
  );

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);

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

  if (authState.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#70E000" />
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
                source={require("@/assets/images/logo_drivemate_green.png")}
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
                    {authViewModel
                      .getRegisterFormErrors()
                      .password?.split("\n")
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
                      authViewModel.getRegisterFormErrors().confirmPassword &&
                        styles.inputError,
                    ]}
                    value={authViewModel.getRegisterFormData().confirmPassword}
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
                {authViewModel.getRegisterFormErrors().confirmPassword && (
                  <Text style={styles.errorText}>
                    {authViewModel.getRegisterFormErrors().confirmPassword}
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
                    authViewModel.getRegisterFormErrors().phone &&
                      styles.inputError,
                  ]}
                  value={authViewModel.getRegisterFormData().phone}
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
                {authViewModel.getRegisterFormErrors().phone && (
                  <Text style={styles.errorText}>
                    {authViewModel.getRegisterFormErrors().phone}
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
                    !authViewModel.getRegisterFormData().acceptTerms as boolean
                  )
                }
              >
                <View
                  style={[
                    styles.checkbox,
                    authViewModel.getRegisterFormData().acceptTerms &&
                      styles.checkboxChecked,
                  ]}
                >
                  {authViewModel.getRegisterFormData().acceptTerms && (
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
                  !authViewModel.isRegisterFormValid() &&
                    styles.primaryButtonDisabled,
                ]}
                onPress={authViewModel.handleRegister}
                disabled={!authViewModel.isRegisterFormValid()}
              >
                <Text
                  style={[
                    styles.primaryButtonText,
                    !authViewModel.isRegisterFormValid() &&
                      styles.primaryButtonTextDisabled,
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
    color: "#70E000",
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
    backgroundColor: "#70E000",
    borderColor: "#70E000",
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
    color: "#70E000",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  buttonContainer: {
    paddingHorizontal: 20,
  },
  primaryButton: {
    backgroundColor: "#70E000",
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
