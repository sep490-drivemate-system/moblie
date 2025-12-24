import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ArrowLeft,
  MoreVertical,
  Edit2Icon,
  Trash2,
} from "lucide-react-native";
import CustomAlert from "@/components/CustomAlert";
import { useViewModel } from "@/viewmodels/shared/BaseViewModel";
import { RootState } from "@/lib/redux/store";
import { AddCarViewModel } from "@/viewmodels/car/AddCarViewModel";
import { convertImageFile } from "@/utils/utils";
import { useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppColors } from "@/constants/Colors";

export default function FormScreen() {
  const router = useRouter();
  const [tempFrontImageUri, setTempFrontImageUri] = useState<string | null>(
    null
  );
  const [tempBackImageUri, setTempBackImageUri] = useState<string | null>(null);
  const [showDeleteMode, setShowDeleteMode] = useState(false);
  const [insuranceEndDate, setInsuranceEndDate] = useState<string>("");
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
  const carState = useSelector((state: RootState) => state.car);
  const [_, viewModel] = useViewModel<RootState["car"], AddCarViewModel>(
    AddCarViewModel,
    (state) => state.car
  );

  // Convert date from yyyy-mm-dd to dd/mm/yyyy
  const convertDateFromReduxFormat = (dateString: string): string => {
    if (!dateString) return "";
    try {
      const [year, month, day] = dateString.split("-");
      if (year && month && day) {
        return `${day}/${month}/${year}`;
      }
    } catch (error) {
      console.error("Error converting date from Redux format:", error);
    }
    return "";
  };

  // Convert date from dd/mm/yyyy to yyyy-mm-dd
  const convertDateToReduxFormat = (dateString: string): string => {
    if (!dateString) return "";
    try {
      const [day, month, year] = dateString.split("/");
      if (
        day &&
        month &&
        year &&
        day.length === 2 &&
        month.length === 2 &&
        year.length === 4
      ) {
        return `${year}-${month}-${day}`;
      }
    } catch (error) {
      console.error("Error converting date to Redux format:", error);
    }
    return "";
  };

  // Format date input as user types (dd/mm/yyyy)
  const formatDateInput = (value: string) => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, "");

    // Format as DD/MM/YYYY
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    } else {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(
        4,
        8
      )}`;
    }
  };

  const loadUserData = async () => {
    try {
      // Load temp images if exist
      const tempFrontImage = await AsyncStorage.getItem(
        "temp_car_insurance_front"
      );
      const tempBackImage = await AsyncStorage.getItem(
        "temp_car_insurance_back"
      );
      if (tempFrontImage) {
        setTempFrontImageUri(tempFrontImage);
        viewModel.updateCarRegistrationFormField(
          "InsuranceFront",
          convertImageFile(tempFrontImage)
        );
      }
      if (tempBackImage) {
        setTempBackImageUri(tempBackImage);
        viewModel.updateCarRegistrationFormField(
          "InsuranceBack",
          convertImageFile(tempBackImage)
        );
      }

      // Load insurance end date from Redux
      if (carState?.carRegistrationForm?.InsuranceEndTime) {
        const displayDate = convertDateFromReduxFormat(
          carState.carRegistrationForm.InsuranceEndTime
        );
        setInsuranceEndDate(displayDate);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleImagePress = (type: "front" | "back") => {
    if (
      (type === "front" && tempFrontImageUri) ||
      (type === "back" && tempBackImageUri)
    ) {
      setShowDeleteMode(true);
    }
  };

  const handleImageUpload = (type: "front" | "back") => {
    router.push(
      `/(onboarding)/(car)/(car-insurance)/upload-guide?type=${type}`
    );
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

  const handleGoBack = () => {
    router.back();
  };

  const handleDateChange = (value: string) => {
    const formatted = formatDateInput(value);
    setInsuranceEndDate(formatted);

    // Convert to yyyy-mm-dd and update Redux
    const reduxFormat = convertDateToReduxFormat(formatted);
    if (reduxFormat) {
      viewModel.updateCarRegistrationFormField("InsuranceEndTime", reduxFormat);
    }
  };

  const handleNext = async () => {
    // Validation
    if (!tempFrontImageUri) {
      showCustomAlert("Lỗi", "Vui lòng tải lên ảnh mặt trước bảo hiểm xe", [
        {
          text: "OK",
          onPress: () => setShowAlert(false),
        },
      ]);
      return;
    }

    if (!tempBackImageUri) {
      showCustomAlert("Lỗi", "Vui lòng tải lên ảnh mặt sau bảo hiểm xe", [
        {
          text: "OK",
          onPress: () => setShowAlert(false),
        },
      ]);
      return;
    }

    // Validate date format
    if (!insuranceEndDate || insuranceEndDate.length !== 10) {
      showCustomAlert(
        "Lỗi",
        "Vui lòng nhập ngày hết hạn bảo hiểm (dd/mm/yyyy)",
        [
          {
            text: "OK",
            onPress: () => setShowAlert(false),
          },
        ]
      );
      return;
    }

    const reduxFormat = convertDateToReduxFormat(insuranceEndDate);
    if (!reduxFormat) {
      showCustomAlert(
        "Lỗi",
        "Ngày không hợp lệ. Vui lòng nhập đúng định dạng dd/mm/yyyy",
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
      // Ensure date is saved to Redux before proceeding
      viewModel.updateCarRegistrationFormField("InsuranceEndTime", reduxFormat);

      await AsyncStorage.removeItem("temp_car_insurance_front");
      await AsyncStorage.removeItem("temp_car_insurance_back");
      router.push("/(onboarding)/(car)/(car-inspection-certificate)/form");
    } catch (error) {
      showCustomAlert("Lỗi", "Không thể lưu thông tin bảo hiểm xe", [
        {
          text: "OK",
          onPress: () => setShowAlert(false),
        },
      ]);
    }
  };

  const handleDeleteImage = (type: "front" | "back") => {
    showCustomAlert(
      `Xóa ảnh mặt ${type === "front" ? "trước" : "sau"} bảo hiểm xe`,
      `Bạn có chắc chắn muốn xóa ảnh mặt ${
        type === "front" ? "trước" : "sau"
      } bảo hiểm xe?`,
      [
        {
          text: "Hủy",
          style: "cancel",
          onPress: () => {
            setShowAlert(false);
            setShowDeleteMode(false);
          },
        },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              if (type === "front") {
                setTempFrontImageUri(null);
                await AsyncStorage.removeItem("temp_car_insurance_front");
                viewModel.updateCarRegistrationFormField(
                  "InsuranceFront",
                  null
                );
              } else {
                setTempBackImageUri(null);
                await AsyncStorage.removeItem("temp_car_insurance_back");
                viewModel.updateCarRegistrationFormField("InsuranceBack", null);
              }
              setShowDeleteMode(false);
              setShowAlert(false);

              showCustomAlert("Thành công", "Ảnh đã được xóa", [
                {
                  text: "OK",
                  onPress: () => setShowAlert(false),
                },
              ]);
            } catch (error) {
              showCustomAlert("Lỗi", "Không thể xóa ảnh", [
                {
                  text: "OK",
                  onPress: () => setShowAlert(false),
                },
              ]);
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    loadUserData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadUserData();
    }, [])
  );

  // Auto exit delete mode after 3 seconds
  useEffect(() => {
    if (showDeleteMode) {
      const timer = setTimeout(() => {
        setShowDeleteMode(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showDeleteMode]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
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
              <Text style={styles.title}>Bảo hiểm xe</Text>
            </View>

            {/* Image Upload Sections */}
            <View style={styles.imageSection}>
              {/* Front Image */}
              <View style={styles.imageContainer}>
                <Text style={styles.imageLabel}>
                  Ảnh mặt trước <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.imageUploadArea}>
                  {tempFrontImageUri ? (
                    <TouchableOpacity
                      style={styles.imageWrapper}
                      onPress={() => handleImagePress("front")}
                    >
                      <Image
                        source={{ uri: tempFrontImageUri! }}
                        style={[
                          styles.uploadedImage,
                          showDeleteMode && styles.dimmedImage,
                        ]}
                      />
                      {showDeleteMode && (
                        <View style={styles.deleteOverlay}>
                          <TouchableOpacity
                            style={styles.trashButton}
                            onPress={() => handleDeleteImage("front")}
                          >
                            <Trash2 color="#FFFFFF" size={24} />
                          </TouchableOpacity>
                        </View>
                      )}
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.uploadPlaceholder}
                      onPress={() => handleImageUpload("front")}
                    >
                      <Text style={styles.uploadText}>Tải ảnh lên</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleImageUpload("front")}
                  >
                    <Edit2Icon color={AppColors.primary} size={16} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Back Image */}
              <View style={styles.imageContainer}>
                <Text style={styles.imageLabel}>
                  Ảnh mặt sau <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.imageUploadArea}>
                  {tempBackImageUri ? (
                    <TouchableOpacity
                      style={styles.imageWrapper}
                      onPress={() => handleImagePress("back")}
                    >
                      <Image
                        source={{ uri: tempBackImageUri! }}
                        style={[
                          styles.uploadedImage,
                          showDeleteMode && styles.dimmedImage,
                        ]}
                      />
                      {showDeleteMode && (
                        <View style={styles.deleteOverlay}>
                          <TouchableOpacity
                            style={styles.trashButton}
                            onPress={() => handleDeleteImage("back")}
                          >
                            <Trash2 color="#FFFFFF" size={24} />
                          </TouchableOpacity>
                        </View>
                      )}
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.uploadPlaceholder}
                      onPress={() => handleImageUpload("back")}
                    >
                      <Text style={styles.uploadText}>Tải ảnh lên</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleImageUpload("back")}
                  >
                    <Edit2Icon color={AppColors.primary} size={16} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Date Input Section */}
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Ngày hết hạn bảo hiểm <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="dd/mm/yyyy"
                  placeholderTextColor="#92929D"
                  value={insuranceEndDate}
                  onChangeText={handleDateChange}
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                activeOpacity={1}
                style={styles.backButton}
                onPress={handleGoBack}
              >
                <Text style={styles.backButtonText}>Quay lại</Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={1} style={styles.nextButton} onPress={handleNext}>
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
    </KeyboardAvoidingView>
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
    width: "40%",
    height: "100%",
    backgroundColor: AppColors.primary,
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
  },
  imageSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  imageContainer: {
    marginBottom: 20,
  },
  imageLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 10,
  },
  required: {
    color: AppColors.red,
  },
  imageUploadArea: {
    position: "relative",
    borderWidth: 2,
    borderColor: AppColors.primary,
    borderStyle: "dashed",
    borderRadius: 8,
    height: 150,
    justifyContent: "center",
    alignItems: "center",
  },
  imageWrapper: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  uploadedImage: {
    width: "100%",
    height: "100%",
    borderRadius: 6,
  },
  dimmedImage: {
    opacity: 0.5,
  },
  deleteOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 6,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  trashButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FF4444",
    justifyContent: "center",
    alignItems: "center",
  },
  uploadPlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  uploadText: {
    fontSize: 16,
    color: AppColors.primary,
    fontWeight: "600",
  },
  editButton: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderColor: AppColors.primary,
    borderWidth: 1,
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
    marginBottom: 30,
    gap: 15,
    paddingHorizontal: 20,
  },
  backButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
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
