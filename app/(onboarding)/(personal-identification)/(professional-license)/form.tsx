import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ArrowLeft,
  MoreVertical,
  Edit2Icon,
  Trash2,
  ChevronDown,
} from "lucide-react-native";
import CustomAlert from "@/components/CustomAlert";
import { AuthViewModel } from "@/viewmodels/auth/AuthViewModel";
import { useViewModel } from "@/viewmodels/shared/BaseViewModel";
import { RootState } from "@/lib/redux/store";
import { SafeAreaView } from "react-native-safe-area-context";
import { convertImageFile } from "@/utils/utils";
import { AppColors } from "@/constants/Colors";

export default function FormScreen() {
  const [authState, authViewModel] = useViewModel(
    AuthViewModel,
    (state: RootState) => state.auth
  );
  const router = useRouter();
  const [tempImageUri, setTempImageUri] = useState<string | null>(null);
  const [showDeleteMode, setShowDeleteMode] = useState(false);
  const [showVehicleClassDropdown, setShowVehicleClassDropdown] =
    useState(false);
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
  const [vehicleClass, setVehicleClass] = useState<string>("");

  // Vehicle class options (same as license classes)
  const vehicleClasses = [
    "B",
    "C",
    "C1",
    "D1",
    "D2",
    "D",
    "BE",
    "C1E",
    "D1E",
    "D2E",
    "DE",
  ];

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
      // Load temp image if exists
      const tempImage = await AsyncStorage.getItem("temp_certificate");
      if (tempImage) {
        setTempImageUri(tempImage);
        authViewModel.updateRegisterInstructorFormData(
          "TeachingLicenseFront",
          convertImageFile(tempImage)
        );
      } else {
        setTempImageUri(null);
        authViewModel.updateRegisterInstructorFormData(
          "TeachingLicenseFront",
          null
        );
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleImagePress = () => {
    if (tempImageUri) {
      setShowDeleteMode(true);
    }
  };

  const handleImageUpload = () => {
    router.push(
      `/(onboarding)/(personal-identification)/(professional-license)/upload-guide`
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

  const handleVehicleClassSelect = (vehicleClass: string) => {
    setVehicleClass(vehicleClass);
    setShowVehicleClassDropdown(false);
  };

  // Check if all fields are filled
  const isFormComplete = () => {
    return tempImageUri && vehicleClass.trim() !== "";
  };

  // BYPASS: Temporary function to skip professional license validation
  const handleNextBypass = () => {
    console.log("Bypassing professional license form validation");
    // Navigate to next step in onboarding flow
    router.push(
      "/(onboarding)/(personal-identification)/(criminal-record)/form"
    );
  };

  const handleNext = () => {
    // Validation for image
    if (!tempImageUri) {
      showCustomAlert(
        "Lỗi",
        "Vui lòng tải lên chứng chỉ hành nghề giảng dạy lái xe trước khi tiếp tục",
        [
          {
            text: "OK",
            onPress: () => setShowAlert(false),
          },
        ]
      );
      return;
    }

    if (!vehicleClass.trim()) {
      showCustomAlert(
        "Lỗi",
        "Vui lòng chọn hạng xe đào tạo giảng dạy trước khi tiếp tục",
        [
          {
            text: "OK",
            onPress: () => setShowAlert(false),
          },
        ]
      );
      return;
    }

    // All validations passed, navigate to next page
    router.push(
      "/(onboarding)/(personal-identification)/(criminal-record)/form"
    );
  };

  // Auto exit delete mode after 3 seconds
  useEffect(() => {
    if (showDeleteMode) {
      const timer = setTimeout(() => {
        setShowDeleteMode(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showDeleteMode]);

  const handleDeleteImage = () => {
    showCustomAlert(
      "Xóa ảnh chứng chỉ",
      "Bạn có chắc chắn muốn xóa ảnh chứng chỉ hành nghề giảng dạy lái xe?",
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
              setTempImageUri(null);
              authViewModel.updateRegisterInstructorFormData(
                "TeachingLicenseFront",
                null
              );
              await AsyncStorage.removeItem("temp_certificate");
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
            <Text style={styles.title}>Chứng chỉ hành nghề</Text>
          </View>

          {/* Image Upload Section */}
          <View style={styles.imageSection}>
            <View style={styles.imageContainer}>
              <Text style={styles.imageLabel}>
                Chứng chỉ hành nghề giảng dạy lái xe{" "}
                <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.imageUploadArea}>
                {tempImageUri ? (
                  <TouchableOpacity
                    style={styles.imageWrapper}
                    onPress={() => handleImagePress()}
                  >
                    <Image
                      source={{ uri: tempImageUri! }}
                      style={[
                        styles.uploadedImage,
                        showDeleteMode && styles.dimmedImage,
                      ]}
                    />
                    {showDeleteMode && (
                      <View style={styles.deleteOverlay}>
                        <TouchableOpacity
                          style={styles.trashButton}
                          onPress={() => handleDeleteImage()}
                        >
                          <Trash2 color="#FFFFFF" size={24} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.uploadPlaceholder}
                    onPress={() => handleImageUpload()}
                  >
                    <Text style={styles.uploadText}>Tải ảnh lên</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleImageUpload()}
                >
                  <Edit2Icon color={AppColors.primary} size={16} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Hạng xe đào tạo giảng dạy <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.dropdownContainer}
                onPress={() =>
                  setShowVehicleClassDropdown(!showVehicleClassDropdown)
                }
              >
                <Text
                  style={[
                    styles.dropdownText,
                    !vehicleClass && styles.placeholderText,
                  ]}
                >
                  {vehicleClass || "Chọn hạng xe đào tạo giảng dạy"}
                </Text>
                <ChevronDown
                  color="#92929D"
                  size={20}
                  style={[
                    styles.dropdownIcon,
                    showVehicleClassDropdown && styles.dropdownIconRotated,
                  ]}
                />
              </TouchableOpacity>
              {showVehicleClassDropdown && (
                <View style={styles.dropdownList}>
                  <ScrollView
                    showsVerticalScrollIndicator={true}
                    nestedScrollEnabled={true}
                    style={styles.dropdownScrollView}
                  >
                    {vehicleClasses.map((vehicleClass) => (
                      <TouchableOpacity
                        key={vehicleClass}
                        style={styles.dropdownItem}
                        onPress={() => {
                          handleVehicleClassSelect(vehicleClass);
                          authViewModel.updateRegisterInstructorFormData(
                            "TeachingTier",
                            vehicleClass
                          );
                        }}
                      >
                        <Text style={styles.dropdownItemText}>
                          {vehicleClass}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
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
    width: "64%",
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
    color: "#FF0000",
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
  saveButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
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
  disabledButton: {
    backgroundColor: "#F0F0F0",
    borderColor: "#E0E0E0",
  },
  savedButton: {
    backgroundColor: "#E0E0E0",
    borderColor: "#E0E0E0",
  },
  savedButtonText: {
    color: "#92929D",
  },
  disabledNextButton: {
    backgroundColor: "#B8E6B8",
  },
  disabledNextButtonText: {
    color: "#FFFFFF",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  dropdownContainer: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownText: {
    fontSize: 16,
    color: "#000",
  },
  placeholderText: {
    color: "#92929D",
  },
  dropdownIcon: {
    transform: [{ rotate: "0deg" }],
  },
  dropdownIconRotated: {
    transform: [{ rotate: "180deg" }],
  },
  dropdownList: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    zIndex: 9999,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    maxHeight: 200,
  },
  dropdownScrollView: {
    maxHeight: 180,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#000",
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.primary,
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
});
