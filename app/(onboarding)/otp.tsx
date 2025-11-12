import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Keyboard,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { RootState } from "@/lib/redux/store";
import { useViewModel } from "@/viewmodels/shared/BaseViewModel";
import { AuthViewModel } from "@/viewmodels/auth/AuthViewModel";

export default function OTPScreen() {
  const router = useRouter();
  const [authState, authViewModel] = useViewModel(
    AuthViewModel,
    (state: RootState) => state.auth
  );
  const email = authState.registerFormData.email;
  const isLoading = authState.isLoading;
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [receivedOtp, setReceivedOtp] = useState<string>("");
  const [otpError, setOtpError] = useState<string>("");
  const [canResend, setCanResend] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: "",
    message: "",
    onConfirm: () => {},
    confirmText: "OK",
  });
  const inputRefs = useRef<TextInput[]>([]);

  // Set router to ViewModel for navigation
  useEffect(() => {
    authViewModel.setRouter(router);
  }, [router, authViewModel]);

  const showCustomAlert = useCallback((
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
  }, []);

  // Call verify-email API when component mounts
  useEffect(() => {
    const callVerifyEmail = async () => {
      if (!email) {
        showCustomAlert("Lỗi", "Không tìm thấy email. Vui lòng thử lại.", () =>
          setShowModal(false)
        );
        return;
      }

      const result = await authViewModel.handleVerifyEmail(email);
      if (result.success && result.otp) {
        // OTP has been sent successfully
        // Save the OTP from the response
        setReceivedOtp(result.otp);
        console.log("OTP sent successfully");
      } else {
        showCustomAlert(
          "Lỗi",
          result.message || "Không thể gửi mã OTP. Vui lòng thử lại.",
          () => setShowModal(false)
        );
      }
    };

    callVerifyEmail();
  }, [email, authViewModel, showCustomAlert]);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) return; // Only allow single digit

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Clear error when user starts typing
    if (otpError) {
      setOtpError("");
    }

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

  const handleVerifyOTP = async () => {
    const otpString = otp.join("");

    if (otpString.length !== 6) {
      setOtpError("Vui lòng nhập đầy đủ 6 chữ số");
      return;
    }

    // Compare with received OTP from API
    if (!receivedOtp) {
      setOtpError("Mã OTP chưa được gửi. Vui lòng thử lại.");
      return;
    }

    if (otpString === receivedOtp) {
      // Correct OTP
      setOtpError("");
      try {
        // Save OTP verification status
        await AsyncStorage.setItem("otp_verified", "true");
        // Navigate to next screen
        router.push("/(onboarding)/role-selection");
      } catch (error) {
        setOtpError("Có lỗi xảy ra. Vui lòng thử lại.");
      }
    } else {
      // Wrong OTP
      setOtpError("Mã OTP không đúng. Vui lòng kiểm tra lại.");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResendOTP = async () => {
    if (canResend && email) {
      const result = await authViewModel.handleVerifyEmail(email);
      if (result.success && result.otp) {
        // Get the new OTP from the response
        setReceivedOtp(result.otp);
        setOtp(["", "", "", "", "", ""]);
        setOtpError("");
        inputRefs.current[0]?.focus();
        showCustomAlert("Thành công", "Mã OTP mới đã được gửi", () =>
          setShowModal(false)
        );
      } else {
        showCustomAlert(
          "Lỗi",
          result.message || "Không thể gửi lại mã OTP. Vui lòng thử lại.",
          () => setShowModal(false)
        );
      }
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
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
            Chúng tôi đã gửi một mã có 6 chữ số đến email{" "}
            {email ? email.replace(/(.{2})(.*)(@.*)/, "$1***$3") : ""}
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
              style={[
                styles.otpInput,
                otpError && styles.otpInputError
              ]}
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
        
        {/* Error Message */}
        {otpError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{otpError}</Text>
          </View>
        ) : null}

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
            style={[styles.verifyButton, isLoading && styles.verifyButtonDisabled]}
            onPress={handleVerifyOTP}
            disabled={isLoading}
          >
            <Text style={styles.verifyButtonText}>
              {isLoading ? "Đang gửi..." : "Xác minh"}
            </Text>
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
    </View>
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
  otpInputError: {
    borderColor: "#FF0000",
  },
  errorContainer: {
    marginTop: -30,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  errorText: {
    color: "#FF0000",
    fontSize: 14,
    textAlign: "center",
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
  verifyButtonDisabled: {
    backgroundColor: "#CCCCCC",
    opacity: 0.6,
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
