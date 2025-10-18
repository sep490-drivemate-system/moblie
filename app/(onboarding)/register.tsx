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
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CountryCodeSelector from "./country-code-selector";
import { MoreVertical } from "lucide-react-native";

export default function RegisterScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    countryCode: "+84", // Default to Vietnam
  });
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.firstName.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên");
      return;
    }
    if (!formData.lastName.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập họ");
      return;
    }
    if (!formData.phone.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập số điện thoại");
      return;
    }
    if (!acceptTerms) {
      Alert.alert("Lỗi", "Vui lòng chấp nhận điều khoản sử dụng");
      return;
    }

    try {
      // Simulate saving user info
      // In a real app, you would call your API here
      const userInfo = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: `${formData.countryCode}${formData.phone}`,
        googleSignedIn: true,
      };

      // Save user info to AsyncStorage
      await AsyncStorage.setItem("user_info", JSON.stringify(userInfo));

      Alert.alert(
        "Thành công",
        "Thông tin đã được lưu thành công! Vui lòng xác minh OTP.",
        [
          {
            text: "OK",
            onPress: () => router.push("/(onboarding)/otp"),
          },
        ]
      );
    } catch (error) {
      Alert.alert("Lỗi", "Có lỗi xảy ra khi lưu thông tin. Vui lòng thử lại.");
    }
  };

  const handleBackToIntro = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={require("@/assets/images/logo_blue.png")}
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
            <Text style={styles.label}>Tên</Text>
            <TextInput
              style={styles.input}
              value={formData.firstName}
              onChangeText={(value) => handleInputChange("firstName", value)}
              placeholder="Nhập tên"
              placeholderTextColor="#92929D"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Họ</Text>
            <TextInput
              style={styles.input}
              value={formData.lastName}
              onChangeText={(value) => handleInputChange("lastName", value)}
              placeholder="Nhập họ"
              placeholderTextColor="#92929D"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Số điện thoại</Text>
            <View style={styles.phoneInputContainer}>
              <CountryCodeSelector
                style={styles.codeInput}
                selectedCode={formData.countryCode}
                onCodeChange={(code) => handleInputChange("countryCode", code)}
              />
              <TextInput
                style={styles.phoneInput}
                value={formData.phone}
                onChangeText={(value) => handleInputChange("phone", value)}
                placeholder="Nhập số điện thoại"
                placeholderTextColor="#92929D"
                keyboardType="phone-pad"
              />
            </View>
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
              Bằng cách tiếp tục, tôi đồng ý với việc DriveMate có thể thu thập,
              sử dụng và tiết lộ thông tin do tôi cung cấp theo{" "}
              <Text style={styles.termsLink}>Thông báo về quyền riêng tư</Text>.
              Tôi cũng xác nhận đã đọc, hiểu rõ và hoàn toàn tuân thủ các{" "}
              <Text style={styles.termsLink}>Điều khoản và điều kiện</Text>.
            </Text>
          </TouchableOpacity>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit}>
            <Text style={styles.primaryButtonText}>Tiếp theo</Text>
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
    color: "#026AA7",
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
    color: "#92929D",
    marginBottom: 8,
    fontWeight: "500",
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
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  codeInput: {
    borderWidth: 1,
    borderColor: "#92929D",
    color: "red",
    fontSize: 16,
  },
  phoneInput: {
    flex: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#000",
    borderWidth: 1,
    borderColor: "#92929D",
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
    borderColor: "#026AA7",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: "#026AA7",
    borderColor: "#4CAF50",
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
    color: "#026AA7",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  buttonContainer: {
    paddingHorizontal: 20,
  },
  primaryButton: {
    backgroundColor: "#026AA7",
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: "center",
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
});
