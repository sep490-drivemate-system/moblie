import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert,
  StatusBar,
  Modal,
  Keyboard,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ArrowLeft } from "lucide-react-native";

export default function OTPScreen() {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [canResend, setCanResend] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: "",
    message: "",
    onConfirm: () => {},
    confirmText: "OK",
  });
  const inputRefs = useRef<TextInput[]>([]);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) return; // Only allow single digit

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Hide keyboard when all 6 digits are filled
    if (newOtp.every(digit => digit !== "")) {
      Keyboard.dismiss();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
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

  const handleVerifyOTP = async () => {
    const otpString = otp.join("");

    if (otpString.length !== 6) {
      showCustomAlert("Lỗi", "Vui lòng nhập đầy đủ 6 chữ số", () =>
        setShowModal(false)
      );
      return;
    }

    // Simulate OTP verification
    // In a real app, you would call your API here
    if (otpString === "123456") {
      // Correct OTP
      try {
        // Save OTP verification status
        await AsyncStorage.setItem("otp_verified", "true");

        showCustomAlert("Thành công", "Xác minh OTP thành công!", () => {
          setShowModal(false);
          router.push("/(onboarding)/role-selection");
        });
      } catch (error) {
        showCustomAlert("Lỗi", "Có lỗi xảy ra. Vui lòng thử lại.", () =>
          setShowModal(false)
        );
      }
    } else {
      // Wrong OTP
      showCustomAlert(
        "Lỗi",
        "Mã OTP không đúng. Vui lòng kiểm tra lại.",
        () => {
          setShowModal(false);
          setOtp(["", "", "", "", "", ""]);
          inputRefs.current[0]?.focus();
        },
        "Thử lại"
      );
    }
  };

  const handleResendOTP = () => {
    if (canResend) {
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      showCustomAlert("Thành công", "Mã OTP mới đã được gửi", () =>
        setShowModal(false)
      );
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text>
              <ArrowLeft />
            </Text>
          </TouchableOpacity>
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Xác minh tài khoản với mã OTP</Text>
          <Text style={styles.description}>
            Chúng tôi đã gửi một mã có 6 chữ số đến số điện thoại
            nga***@gmail.com
          </Text>
        </View>

        {/* OTP Input Fields */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                if (ref) inputRefs.current[index] = ref;
              }}
              style={styles.otpInput}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={({ nativeEvent }) =>
                handleKeyPress(nativeEvent.key, index)
              }
              keyboardType="numeric"
              maxLength={1}
              textAlign="center"
              selectTextOnFocus
            />
          ))}
        </View>

        {/* Resend Code */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Bạn không nhận được mã ?</Text>
          {canResend && (
            <TouchableOpacity onPress={handleResendOTP}>
              <Text style={styles.resendButton}>Gửi lại mã</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Verify Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.verifyButton}
            onPress={handleVerifyOTP}
          >
            <Text style={styles.verifyButtonText}>Xác minh</Text>
          </TouchableOpacity>
        </View>
      </View>

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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
    marginTop: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: "#92929D",
    lineHeight: 24,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  otpInput: {
    width: 45,
    height: 45,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    backgroundColor: "#FFFFFF",
  },
  resendContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  resendText: {
    fontSize: 16,
    color: "#92929D",
    marginBottom: 10,
  },
  resendButton: {
    fontSize: 16,
    color: "#70E000",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  buttonContainer: {
    marginTop: "auto",
    marginBottom: 30,
  },
  verifyButton: {
    backgroundColor: "#70E000",
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: "center",
  },
  verifyButtonText: {
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
