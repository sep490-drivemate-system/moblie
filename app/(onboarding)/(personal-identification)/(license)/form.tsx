import CustomAlert from "@/components/CustomAlert";
import { RootState } from "@/lib/redux/store";
import { convertImageFile, uploadImageDLC } from "@/utils/utils";
import { AuthViewModel } from "@/viewmodels/auth/AuthViewModel";
import { useViewModel } from "@/viewmodels/shared/BaseViewModel";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import {
  ChevronDown,
  Edit2Icon,
  Trash2
} from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function FormScreen() {
  const [authState, authViewModel] = useViewModel(
    AuthViewModel,
    (state: RootState) => state.auth
  );
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [tempFrontImageUri, setTempFrontImageUri] = useState<string | null>(
    null
  );
  const [tempBackImageUri, setTempBackImageUri] = useState<string | null>(null);
  const [showDeleteMode, setShowDeleteMode] = useState(false);
  const [showLicenseClassDropdown, setShowLicenseClassDropdown] =
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

  const [licenseClass, setLicenseClass] = useState<string>("");
  const [isExtractingLicense, setIsExtractingLicense] = useState(false);
  const lastProcessedFrontImageRef = useRef<string | null>(null);

  // License class options
  const licenseClasses = ["B", "C", "C1", "D1", "D2", "D", "BE", "C1E", "D1E", "D2E", "DE"];

  const loadUserData = useCallback(async () => {
    try {
      // Load saved license class from form data if exists
      const savedLicenseClass = authState.registerInstructorFormData.DrivingLicenseTier;
      if (savedLicenseClass && licenseClasses.includes(savedLicenseClass)) {
        setLicenseClass(savedLicenseClass);
      }
      
      // Load temp images if exist
      const tempFront = await AsyncStorage.getItem("temp_license_front");
      const tempBack = await AsyncStorage.getItem("temp_license_back");
      
      if (tempFront) {
        setTempFrontImageUri(tempFront);
        authViewModel.updateRegisterInstructorFormData(
          "DrivingLicenseFront",
          convertImageFile(tempFront)
        );
        
        // Only call upload API if the image has changed
        if (lastProcessedFrontImageRef.current !== tempFront) {
          lastProcessedFrontImageRef.current = tempFront;
          setIsExtractingLicense(true);
          try {
            const response = await uploadImageDLC(tempFront);
            if (response && response.data && Array.isArray(response.data) && response.data.length > 0) {
              console.log("License OCR response", response);
              
              // Extract license class from response.data[0].class
              const extractedClass = response.data[0].class;
              if (extractedClass && licenseClasses.includes(extractedClass)) {
                setLicenseClass(extractedClass);
                authViewModel.updateRegisterInstructorFormData("DrivingLicenseTier", extractedClass);
              } else if (extractedClass) {
                // If class exists but not in the predefined list, still set it
                setLicenseClass(extractedClass);
                authViewModel.updateRegisterInstructorFormData("DrivingLicenseTier", extractedClass);
                console.log("License class extracted:", extractedClass);
              }
            }
          } catch (error) {
            console.error("Error extracting license data:", error);
          } finally {
            setIsExtractingLicense(false);
          }
        }
      } else {
        // Reset the ref if no front image
        lastProcessedFrontImageRef.current = null;
      }
      
      if (tempBack) {
        setTempBackImageUri(tempBack);
        authViewModel.updateRegisterInstructorFormData(
          "DrivingLicenseBack",
          convertImageFile(tempBack)
        );
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      setIsExtractingLicense(false);
    }
  }, [authState.registerInstructorFormData.DrivingLicenseTier]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  useFocusEffect(
    React.useCallback(() => {
      loadUserData();
    }, [loadUserData])
  );

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
      `/(onboarding)/(personal-identification)/(license)/upload-guide?type=${type}`
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

  const handleLicenseClassSelect = (licenseClass: string) => {
    setLicenseClass(licenseClass);
    setShowLicenseClassDropdown(false);
  };

  const handleNext = () => {
    // Validation for images
    if (!tempFrontImageUri) {
      showCustomAlert(
        "Lỗi",
        "Vui lòng tải lên ảnh mặt trước giấy phép lái xe trước khi tiếp tục",
        [
          {
            text: "OK",
            onPress: () => setShowAlert(false),
          },
        ]
      );
      return;
    }

    if (!tempBackImageUri) {
      showCustomAlert(
        "Lỗi",
        "Vui lòng tải lên ảnh mặt sau giấy phép lái xe trước khi tiếp tục",
        [
          {
            text: "OK",
            onPress: () => setShowAlert(false),
          },
        ]
      );
      return;
    }

    if (!licenseClass.trim()) {
      showCustomAlert(
        "Lỗi",
        "Vui lòng chọn hạng giấy phép lái xe trước khi tiếp tục",
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
      "/(onboarding)/(personal-identification)/(professional-license)/form"
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

  const handleDeleteImage = (type: "front" | "back") => {
    showCustomAlert(
      "Xóa ảnh giấy phép lái xe",
      `Bạn có chắc chắn muốn xóa ảnh mặt ${
        type === "front" ? "trước" : "sau"
      } giấy phép lái xe?`,
      [
        {
          text: "Hủy", // Cancel button text
          style: "cancel",
          onPress: () => {
            setShowAlert(false);
            setShowDeleteMode(false);
          },
        },
        {
          text: "Xóa", // Delete button text
          style: "destructive",
          onPress: async () => {
            try {
              if (type === "front") {
                setTempFrontImageUri(null);
                await AsyncStorage.removeItem("temp_license_front");
                lastProcessedFrontImageRef.current = null;
                // Reset license class when front image is deleted
                setLicenseClass("");
                authViewModel.updateRegisterInstructorFormData("DrivingLicenseTier", "");
              } else {
                setTempBackImageUri(null);
                await AsyncStorage.removeItem("temp_license_back");
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

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
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
            <Text style={styles.title}>Giấy phép lái xe</Text>
          </View>

          {/* Image Upload Sections */}
          <View style={styles.imageSection}>
            {/* Front Image */}
            <View style={styles.imageContainer}>
              <Text style={styles.imageLabel}>
                Ảnh mặt trước <Text style={styles.required}>*</Text>
                {isExtractingLicense && (
                  <Text style={styles.extractingText}> (Đang xử lý...)</Text>
                )}
              </Text>
              <View style={styles.imageUploadArea}>
                {tempFrontImageUri ? (
                  <TouchableOpacity
                    style={styles.imageWrapper}
                    onPress={() => handleImagePress("front")}
                    disabled={isExtractingLicense}
                  >
                    <Image
                      source={{ uri: tempFrontImageUri! }}
                      style={[
                        styles.uploadedImage,
                        showDeleteMode && styles.dimmedImage,
                        isExtractingLicense && styles.dimmedImage,
                      ]}
                    />
                    {isExtractingLicense && (
                      <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#70E000" />
                        <Text style={styles.loadingText}>Đang trích xuất thông tin...</Text>
                      </View>
                    )}
                    {showDeleteMode && !isExtractingLicense && (
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
                  disabled={isExtractingLicense}
                >
                  <Edit2Icon color="#70E000" size={16} />
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
                  <Edit2Icon color="#70E000" size={16} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Hạng giấy phép lái xe <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.dropdownContainer}
                onPress={() =>
                  setShowLicenseClassDropdown(!showLicenseClassDropdown)
                }
              >
                <Text
                  style={[
                    styles.dropdownText,
                    !licenseClass && styles.placeholderText,
                  ]}
                >
                  {licenseClass || "Chọn hạng giấy phép lái xe"}
                </Text>
                <ChevronDown
                  color="#92929D"
                  size={20}
                  style={[
                    styles.dropdownIcon,
                    showLicenseClassDropdown && styles.dropdownIconRotated,
                  ]}
                />
              </TouchableOpacity>
              {showLicenseClassDropdown && (
                <ScrollView
                  style={[
                    styles.dropdownList,
                    { 
                      marginBottom: insets.bottom,
                      maxHeight: 200 - insets.bottom
                    }
                  ]}
                  contentContainerStyle={{
                    paddingBottom: Math.max(insets.bottom, 8)
                  }}
                  nestedScrollEnabled={true}
                  showsVerticalScrollIndicator={true}
                >
                  {licenseClasses.map((licenseClass) => (
                    <TouchableOpacity
                      key={licenseClass}
                      style={styles.dropdownItem}
                      onPress={() => {
                        handleLicenseClassSelect(licenseClass);
                        authViewModel.updateRegisterInstructorFormData(
                          "DrivingLicenseTier",
                          licenseClass
                        );
                      }}
                    >
                      <Text style={styles.dropdownItemText}>
                        {licenseClass}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
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
    </View>
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
    width: "21%",
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
  extractingText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#70E000",
    fontStyle: "italic",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 6,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#70E000",
    fontWeight: "600",
  },
  imageUploadArea: {
    position: "relative",
    borderWidth: 2,
    borderColor: "#70E000",
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
    color: "#70E000",
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
    borderColor: "#70E000",
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
    backgroundColor: "#70E000",
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
    zIndex: 1000,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    maxHeight: 200,
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
  backButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#70E000",
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#70E000",
  },
});
