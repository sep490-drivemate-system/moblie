import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert,
  StatusBar,
  Image,
  ScrollView,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MoreVertical, Eye, EyeOff } from "lucide-react-native";

export default function SignUpScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    retypePassword: "",
    phone: "",
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRetypePassword, setShowRetypePassword] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: "",
    message: "",
    onConfirm: () => {},
    confirmText: "OK",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const showCustomAlert = (
    title: string,
    message: string,
    onConfirm: () => void,
    confirmText: string = "OK"
  ) => {
    setModalConfig({
      title,
      message,
      onConfirm,
      confirmText,
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.firstName.trim()) {
      showCustomAlert("Lỗi", "Vui lòng nhập tên", () => setShowModal(false));
      return;
    }
    if (!formData.lastName.trim()) {
      showCustomAlert("Lỗi", "Vui lòng nhập họ", () => setShowModal(false));
      return;
    }
    if (!formData.email.trim()) {
      showCustomAlert("Lỗi", "Vui lòng nhập email", () => setShowModal(false));
      return;
    }
    if (!formData.password.trim()) {
      showCustomAlert("Lỗi", "Vui lòng nhập mật khẩu", () =>
        setShowModal(false)
      );
      return;
    }
    if (formData.password !== formData.retypePassword) {
      showCustomAlert("Lỗi", "Mật khẩu nhập lại không khớp", () =>
        setShowModal(false)
      );
      return;
    }
    if (!formData.phone.trim()) {
      showCustomAlert("Lỗi", "Vui lòng nhập số điện thoại", () =>
        setShowModal(false)
      );
      return;
    }
    if (!acceptTerms) {
      showCustomAlert("Lỗi", "Vui lòng chấp nhận điều khoản sử dụng", () =>
        setShowModal(false)
      );
      return;
    }

    try {
      // Simulate saving user info
      // In a real app, you would call your API here
      const userInfo = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        googleSignedIn: true,
      };

      // Save user info to AsyncStorage
      await AsyncStorage.setItem("user_info", JSON.stringify(userInfo));

      showCustomAlert(
        "Thành công",
        "Thông tin đã được lưu thành công! Vui lòng xác minh OTP.",
        () => {
          setShowModal(false);
          router.push("/(onboarding)/otp");
        }
      );
    } catch (error) {
      showCustomAlert(
        "Lỗi",
        "Có lỗi xảy ra khi lưu thông tin. Vui lòng thử lại.",
        () => setShowModal(false)
      );
    }
  };

  const handleBackToIntro = () => {
    router.back();
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
            <Image
              source={require("@/assets/images/logo_drivemate_green.png")}
              style={styles.logo}
            />
            <View style={styles.headerButtons}>
              <TouchableOpacity style={styles.helpButton}>
                <Text>Cần hỗ trợ ?</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.notificationButton}>
                <MoreVertical color="#000" size={24} />
              </TouchableOpacity>
            </View>
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
                style={styles.input}
                value={formData.email}
                onChangeText={(value) => handleInputChange("email", value)}
                placeholder="Nhập email"
                placeholderTextColor="#92929D"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Tên <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={formData.firstName}
                onChangeText={(value) => handleInputChange("firstName", value)}
                placeholder="Nhập tên"
                placeholderTextColor="#92929D"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Họ <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={formData.lastName}
                onChangeText={(value) => handleInputChange("lastName", value)}
                placeholder="Nhập họ"
                placeholderTextColor="#92929D"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Mật khẩu <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={formData.password}
                  onChangeText={(value) => handleInputChange("password", value)}
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
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Nhập lại mật khẩu <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={formData.retypePassword}
                  onChangeText={(value) =>
                    handleInputChange("retypePassword", value)
                  }
                  placeholder="Nhập lại mật khẩu"
                  placeholderTextColor="#92929D"
                  secureTextEntry={!showRetypePassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowRetypePassword(!showRetypePassword)}
                >
                  {showRetypePassword ? (
                    <EyeOff size={20} color="#92929D" />
                  ) : (
                    <Eye size={20} color="#92929D" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Số điện thoại <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(value) => handleInputChange("phone", value)}
                placeholder="Nhập số điện thoại"
                placeholderTextColor="#92929D"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Terms */}
          <View style={styles.termsContainer}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setAcceptTerms(!acceptTerms)}
            >
              <View
                style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}
              >
                {acceptTerms && <Text style={styles.checkmark}>✓</Text>}
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
              style={styles.primaryButton}
              onPress={handleSubmit}
            >
              <Text style={styles.primaryButtonText}>Tiếp theo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Custom Alert Modal */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{modalConfig.title}</Text>
            <Text style={styles.modalMessage}>{modalConfig.message}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={modalConfig.onConfirm}
            >
              <Text style={styles.modalButtonText}>
                {modalConfig.confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 24,
    marginHorizontal: 20,
    minWidth: 280,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 12,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 16,
    color: "#92929D",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: "#70E000",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
