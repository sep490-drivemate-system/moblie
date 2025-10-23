import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  TextInput,
  ScrollView,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ArrowLeft, MoreVertical } from "lucide-react-native";
import CustomAlert from "@/components/CustomAlert";

export default function FormScreen() {
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

  // Form data
  const [formData, setFormData] = useState({
    instructorPrice: "",
    carPrice: "",
  });

  // Check if user added car or skipped
  const [hasAddedCar, setHasAddedCar] = useState(false);

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
      // Check if user added car or skipped
      const carAdded = await AsyncStorage.getItem("car_added");
      setHasAddedCar(carAdded === "true");

      // Load saved form data
      const savedFormData = await AsyncStorage.getItem("car_services_data");
      if (savedFormData) {
        setFormData(JSON.parse(savedFormData));
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

  const handleInputChange = (field: string, value: string) => {
    const newFormData = {
      ...formData,
      [field]: value,
    };
    setFormData(newFormData);

    // Save form data temporarily
    AsyncStorage.setItem("car_services_data", JSON.stringify(newFormData));
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleNext = async () => {
    // Validation for instructor price
    if (!formData.instructorPrice?.trim()) {
      showCustomAlert("Lỗi", "Vui lòng nhập giá gói thuê người hướng dẫn", [
        {
          text: "OK",
          onPress: () => setShowAlert(false),
        },
      ]);
      return;
    }

    // Validation for car price (only if user added car)
    if (hasAddedCar && !formData.carPrice?.trim()) {
      showCustomAlert("Lỗi", "Vui lòng nhập giá xe", [
        {
          text: "OK",
          onPress: () => setShowAlert(false),
        },
      ]);
      return;
    }

    try {
      // Save data to AsyncStorage
      await AsyncStorage.setItem("car_services_data", JSON.stringify(formData));

      // Navigate to next page
      router.push("/(onboarding)/waiting-confirm");
    } catch (error) {
      showCustomAlert("Lỗi", "Không thể lưu thông tin giá dịch vụ", [
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
              source={require("@/assets/images/background_1.png")}
              style={styles.background_1}
            />
          </View>

          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Giá gói dịch vụ</Text>
            <Text style={styles.description}>
              • Giá xe sẽ được cộng với giá Gói thuê người hướng dẫn sẽ ra mức
              giá Gói thuê trọn gói niêm yết cho mỗi giờ mà bạn muốn hiển thị
              với khách hàng (tay lái mới).
            </Text>
            <Text style={styles.description}>
              {" "}
              •Tỷ giá quy đổi:{" "}
              <Text style={styles.highlightText}>1.000 đồng = 1.000GF</Text>.
            </Text>
          </View>

          <View style={styles.serviceSection}>
            <View style={styles.serviceContainer}>
              <Text style={styles.serviceLabel}>
                Giá gói thuê người hướng dẫn / Giờ
                <Text style={styles.required}> *</Text>
              </Text>
              <TextInput
                keyboardType="numeric"
                value={formData.instructorPrice}
                onChangeText={(value) =>
                  handleInputChange("instructorPrice", value)
                }
                placeholder="Nhập giá"
                placeholderTextColor="#92929D"
                style={[styles.serviceInput]}
              />
            </View>
            {hasAddedCar && (
              <View style={styles.serviceContainer}>
                <Text style={styles.serviceLabel}>
                  Giá xe / giờ<Text style={styles.required}> *</Text>
                </Text>
                <TextInput
                  keyboardType="numeric"
                  value={formData.carPrice}
                  onChangeText={(value) => handleInputChange("carPrice", value)}
                  placeholder="Nhập giá"
                  placeholderTextColor="#92929D"
                  style={[styles.serviceInput]}
                />
              </View>
            )}
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
              <Text style={styles.backButtonText}>Quay lại</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>Gửi</Text>
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
    width: "100%",
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
  background_1: {
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
    paddingBottom: 20,
  },
  description: {
    fontSize: 16,
  },
  serviceSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  serviceContainer: {
    marginBottom: 20,
  },
  serviceLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 10,
  },
  serviceInput: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#000",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  highlightText: {
    color: "#70E000",
    fontWeight: "bold",
  },
  required: {
    color: "#FF0000",
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
