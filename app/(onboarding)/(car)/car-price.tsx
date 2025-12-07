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
import { useRouter } from "expo-router";
import CustomAlert from "@/components/CustomAlert";
import { useViewModel } from "@/viewmodels/shared/BaseViewModel";
import { AddCarViewModel } from "@/viewmodels/car/AddCarViewModel";
import { RootState } from "@/lib/redux/store";
import { AppColors } from "@/constants/Colors";
import { useSelector } from "react-redux";
import { updateCarRegistrationForm } from "@/features/car/carSlice";

export default function CarPriceScreen() {
  const router = useRouter();
  const [carState, viewModel] = useViewModel<RootState["car"], AddCarViewModel>(
    AddCarViewModel,
    (state) => state.car
  );
  const [price, setPrice] = useState<string>("");
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    loadSavedPrice();
  }, []);

  const loadSavedPrice = async () => {
    try {
      // Try to load from Redux first
      const hourlyPrice = carState.carRegistrationForm.HourlyPrice;
      if (hourlyPrice && hourlyPrice > 0) {
        setPrice(hourlyPrice.toString());
        return;
      }
    } catch (error) {
      console.error("Error loading saved price:", error);
    }
  };
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    buttons: [] as Array<{
      text: string;
      onPress: () => void;
      style?: "default" | "cancel" | "destructive";
    }>,
  });

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

  const handleGoBack = () => {
    router.push("/(onboarding)/(car)/(car-verification-image)/form");
  };

  const handleNext = async () => {
    const normalized = price.replace(/\D/g, "");
    if (!normalized) {
      showCustomAlert("Lỗi", "Vui lòng nhập số tiền mong muốn cho thuê", [
        {
          text: "OK",
          onPress: () => setShowAlert(false),
        },
      ]);
      return;
    }

    const priceNum = parseFloat(normalized);
    if (isNaN(priceNum) || priceNum <= 0) {
      showCustomAlert(
        "Lỗi",
        "Số tiền không hợp lệ. Vui lòng nhập số tiền lớn hơn 0",
        [
          {
            text: "OK",
            onPress: () => setShowAlert(false),
          },
        ]
      );
      return;
    }

    try {
      viewModel.updateCarRegistrationFormField("HourlyPrice", priceNum);
      // Navigate to the specified form page
      router.push("/(onboarding)/(car)/(car-verification-image)/form");
    } catch (error) {
      showCustomAlert("Lỗi", "Không thể lưu giá thuê xe", [
        {
          text: "OK",
          onPress: () => setShowAlert(false),
        },
      ]);
    }
  };

  const handlePriceChange = async (value: string) => {
    // Keep only digits
    const onlyDigits = value.replace(/\D/g, "");
    setPrice(onlyDigits);

    // Save to ViewModel and Redux as user types
    if (onlyDigits) {
      try {
        viewModel.updateCarRegistrationFormField(
          "HourlyPrice",
          parseFloat(onlyDigits) || 0
        );
      } catch (error) {
        console.error("Error saving price:", error);
      }
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
            <Text style={styles.title}>Định giá thuê xe theo giờ</Text>
          </View>

          {/* Price input */}
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Số tiền mong muốn cho thuê / giờ (VNĐ){" "}
                <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={price}
                onChangeText={handlePriceChange}
                placeholder="Nhập số tiền (VD: 150000)"
                placeholderTextColor="#92929D"
                keyboardType="numeric"
                maxLength={10}
              />
            </View>
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
  progressBar: {
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  progressFill: {
    width: "80%",
    height: "100%",
    backgroundColor: AppColors.primary,
    borderRadius: 2,
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
  },
  formContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
    position: "relative",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  required: {
    color: AppColors.red,
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#000",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 250,
    gap: 15,
    paddingHorizontal: 20,
  },
  backButton: {
    flex: 1,
    backgroundColor: AppColors.white,
    borderWidth: 1,
    borderColor: AppColors.primary,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: "center",
  },
  nextButton: {
    flex: 1,
    backgroundColor: AppColors.primary,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.primary,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.white,
  },
});
