import React, { useState, useRef, useMemo, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Modal,
  InteractionManager,
  Keyboard,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ArrowLeft } from "lucide-react-native";
import { useAppSelector } from "@/lib/redux/hooks";
import { RootState } from "@/lib/redux/store";

const maskEmail = (email: string): string => {
  if (!email) return "";
  const [localPart, domain] = email.split("@");
  if (!domain) {
    return email;
  }

  const visibleChars = Math.min(3, localPart.length);
  const hiddenChars = Math.max(localPart.length - visibleChars, 0);
  const maskedLocal =
    localPart.slice(0, visibleChars) + "*".repeat(hiddenChars || 3);

  return `${maskedLocal}@${domain}`;
};

export default function OTPScreen() {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: "",
    message: "",
    onConfirm: () => { },
    confirmText: "OK",
  });
  const inputRefs = useRef<TextInput[]>([]);
  const registerEmail = useAppSelector(
    (state: RootState) => state.auth.registerFormData.email
  );

  const maskedEmail = useMemo(() => maskEmail(registerEmail), [registerEmail]);

  const focusInputByIndex = useCallback((index: number) => {
    if (index < 0 || index >= otp.length) return;
    requestAnimationFrame(() => {
      inputRefs.current[index]?.focus();
    });
  }, [otp.length]);

  useFocusEffect(
    useCallback(() => {
      let timeoutId: ReturnType<typeof setTimeout> | undefined;
      const interaction = InteractionManager.runAfterInteractions(() => {
        timeoutId = setTimeout(() => {
          focusInputByIndex(0);
        }, 50);
      });

      return () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        interaction.cancel();
      };
    }, [focusInputByIndex])
  );

  useEffect(() => {
    const firstEmptyIndex = otp.findIndex((digit) => digit === "");
    if (firstEmptyIndex === -1) {
      Keyboard.dismiss();
      return;
    }

    focusInputByIndex(firstEmptyIndex);
  }, [otp, focusInputByIndex]);

  const handleOtpChange = (value: string, index: number) => {
    const sanitizedValue = value.replace(/[^\d]/g, "").slice(-1);
    setOtp((prev) => {
      const next = [...prev];
      next[index] = sanitizedValue;
      return next;
    });
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

    router.push("/(onboarding)/role-selection");
    const otpString = otp.join("");

    // if (otpString.length !== 6) {
    //   showCustomAlert("Lỗi", "Vui lòng nhập đầy đủ 6 chữ số", () =>
    //     setShowModal(false)
    //   );
    //   return;
    // }


    // if (otpString === "123456") {
    //   // Correct OTP
    //   try {
    //     // Save OTP verification status
    //     await AsyncStorage.setItem("otp_verified", "true");

    //     showCustomAlert("Thành công", "Xác minh OTP thành công!", () => {
    //       setShowModal(false);
    //       router.push("/(onboarding)/role-selection");
    //     });
    //   } catch (error) {
    //     showCustomAlert("Lỗi", "Có lỗi xảy ra. Vui lòng thử lại.", () =>
    //       setShowModal(false)
    //     );
    //   }
    // } else {
    //   // Wrong OTP
    //   showCustomAlert(
    //     "Lỗi",
    //     "Mã OTP không đúng. Vui lòng kiểm tra lại.",
    //     () => {
    //       setShowModal(false);
    //       setOtp(["", "", "", "", "", ""]);
    //       inputRefs.current[0]?.focus();
    //     },
    //     "Thử lại"
    //   );
    // }
  };

  const handleResendOTP = () => {
    setOtp(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
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
            Chúng tôi đã gửi một mã có 6 chữ số đến email{" "}
            <Text style={styles.highlightedEmail}>
              {maskedEmail || "đã đăng ký"}
            </Text>
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
              autoFocus={index === 0}
            />
          ))}
        </View>

        {/* Resend Code */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Bạn không nhận được mã ?</Text>
          <TouchableOpacity onPress={handleResendOTP}>
            <Text style={styles.resendButton}>Gửi lại mã</Text>
          </TouchableOpacity>
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
  highlightedEmail: {
    color: "#000",
    fontWeight: "600",
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
  timerText: {
    fontSize: 16,
    color: "#70E000",
    fontWeight: "600",
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
