import CustomAlert from "@/components/CustomAlert";
import { RootState } from "@/lib/redux/store";
import { uploadImage } from "@/utils/utils";
import { AuthViewModel } from "@/viewmodels/auth/AuthViewModel";
import { useViewModel } from "@/viewmodels/shared/BaseViewModel";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { ChevronDown, Edit2Icon, Trash2 } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function FormScreen() {
  const router = useRouter();
  const [authState, authViewModel] = useViewModel(
    AuthViewModel,
    (state: RootState) => state.auth
  );
  useEffect(() => {
    authViewModel.setRouter(router);
  }, [authViewModel, router]);
  const [frontImageUri, setFrontImageUri] = useState<string | null>(null);
  const [backImageUri, setBackImageUri] = useState<string | null>(null);
  const [tempFrontImageUri, setTempFrontImageUri] = useState<string | null>(
    null
  );
  const [tempBackImageUri, setTempBackImageUri] = useState<string | null>(null);
  const [showDeleteMode, setShowDeleteMode] = useState(false);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [isExtractingOCR, setIsExtractingOCR] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    buttons: [] as Array<{
      text: string;
      onPress: () => void;
      style?: "default" | "cancel" | "destructive";
    }>,
  });
  const lastProcessedFrontImageRef = useRef<string | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    fullname: "",
    gender: "",
    birthDate: "",
  });

  function formatDateInput(value: string) {
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
  }

  function parseDate(dateStr: string) {
    const [dayStr, monthStr, yearStr] = dateStr.split("/");
    if (!dayStr || !monthStr || !yearStr) {
      return null;
    }
    const day = Number(dayStr);
    const month = Number(monthStr);
    const year = Number(yearStr);
    if (
      Number.isNaN(day) ||
      Number.isNaN(month) ||
      Number.isNaN(year) ||
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > 31
    ) {
      return null;
    }
    const date = new Date(year, month - 1, day);
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }
    return date;
  }

  function formatDateForState(dateStr: string) {
    const parsed = parseDate(dateStr);
    if (!parsed) {
      return "";
    }
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    const day = String(parsed.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function formatDateForDisplay(dateStr: string) {
    if (!dateStr) {
      return "";
    }
    const isoRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!isoRegex.test(dateStr)) {
      return dateStr;
    }
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  }

  const syncFormDataToViewModel = useCallback(
    (data: typeof formData) => {
      authViewModel.updateRegisterInstructorFormData("FullName", data.fullname);
      authViewModel.updateRegisterInstructorFormData("Gender", data.gender);
      authViewModel.updateRegisterInstructorFormData(
        "BirthDate",
        formatDateForState(data.birthDate)
      );
    },
    [authViewModel]
  );

  useEffect(() => {
    const instructorData = authState.registerInstructorFormData;
    setFormData((prev) => {
      const hasLocalData =
        prev.fullname.trim() !== "" ||
        prev.gender.trim() !== "" ||
        prev.birthDate.trim() !== "";

      if (hasLocalData) {
        return prev;
      }

      return {
        fullname: instructorData.FullName || "",
        gender: instructorData.Gender || "",
        birthDate: formatDateForDisplay(instructorData.BirthDate || ""),
      };
    });
  }, [authState.registerInstructorFormData]);

  const loadUserData = useCallback(async () => {
    try {
      // Load temp images if exist
      const tempFront = await AsyncStorage.getItem("temp_id_front");
      const tempBack = await AsyncStorage.getItem("temp_id_back");
      
      if (tempFront) {
        setTempFrontImageUri(tempFront);
        
        // Only call upload API if the image has changed
        if (lastProcessedFrontImageRef.current !== tempFront) {
          lastProcessedFrontImageRef.current = tempFront;
          setIsExtractingOCR(true);
          try {
            const response = await uploadImage(tempFront);
            if (response && response.data && Array.isArray(response.data) && response.data.length > 0) {
              const ocrData = response.data[0];
              console.log("OCR response", response);
              
              // Prepare updated form data
              const updated: typeof formData = { ...formData };
              
              // Extract and set FullName
              if (ocrData.name) {
                updated.fullname = ocrData.name;
              }
              
              // Extract and set Gender (convert NAM -> Male, NỮ -> Female)
              if (ocrData.sex) {
                const sexUpper = ocrData.sex.toUpperCase();
                if (sexUpper === "NAM") {
                  updated.gender = "Male";
                } else if (sexUpper === "NỮ" || sexUpper === "NU") {
                  updated.gender = "Female";
                }
              }
              
              // Extract and set BirthDate (format is already DD/MM/YYYY)
              if (ocrData.dob) {
                updated.birthDate = ocrData.dob;
              }
              
              // Update form data state
              setFormData(updated);
              
              // Save to AsyncStorage
              AsyncStorage.setItem("id_card_data", JSON.stringify(updated));
              
              // Sync to ViewModel after state update (not in render phase)
              syncFormDataToViewModel(updated);
            }
          } catch (error) {
            console.error("Error extracting OCR data:", error);
          } finally {
            setIsExtractingOCR(false);
          }
        }
      } else {
        // Reset the ref if no front image
        lastProcessedFrontImageRef.current = null;
      }
      
      if (tempBack) {
        setTempBackImageUri(tempBack);
        console.log("tempBack", tempBack);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  }, [authViewModel]);

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
      (type === "front" && (tempFrontImageUri || frontImageUri)) ||
      (type === "back" && (tempBackImageUri || backImageUri))
    ) {
      setShowDeleteMode(true);
    }
  };

  const handleImageUpload = (type: "front" | "back") => {
    router.push(
      `/(onboarding)/(personal-identification)/(id-card)/upload-guide?type=${type}`
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

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    let newFormData;
    if (field === "birthDate") {
      const formattedValue = formatDateInput(value);
      newFormData = {
        ...formData,
        [field]: formattedValue,
      };
    } else if (field === "fullname") {
      const sanitizedValue = value.replace(/\d/g, "");
      newFormData = {
        ...formData,
        [field]: sanitizedValue,
      };
    } else {
      newFormData = {
        ...formData,
        [field]: value,
      };
    }
    setFormData(newFormData);
    syncFormDataToViewModel(newFormData);

    AsyncStorage.setItem("id_card_data", JSON.stringify(newFormData));
  };

  const handleGenderSelect = (gender: string) => {
    const newFormData = {
      ...formData,
      gender: gender,
    };
    setFormData(newFormData);
    setShowGenderDropdown(false);
    syncFormDataToViewModel(newFormData);

    // Save form data temporarily
    AsyncStorage.setItem("id_card_data", JSON.stringify(newFormData));
  };

  // Check if all fields are filled
  const isFormComplete = () => {
    return (
      (tempFrontImageUri || frontImageUri) &&
      (tempBackImageUri || backImageUri) &&
      formData.fullname.trim() !== "" &&
      formData.gender.trim() !== "" &&
      formData.birthDate.trim() !== ""
    );
  };

  const handleGoBack = () => {
    router.back();
  };

  // BYPASS: Temporary function to skip to next step
  const handleNextBypass = () => {
    router.push("/(onboarding)/(personal-identification)/(license)/form");
  };

  const handleNext = () => {
    // Validation
    // if (!tempFrontImageUri && !frontImageUri) {
    //   showCustomAlert("Lỗi", "Vui lòng tải lên ảnh mặt trước thẻ căn cước", [
    //     {
    //       text: "OK",
    //       onPress: () => setShowAlert(false),
    //     },
    //   ]);
    //   return;
    // }

    // if (!tempBackImageUri && !backImageUri) {
    //   showCustomAlert("Lỗi", "Vui lòng tải lên ảnh mặt sau thẻ căn cước", [
    //     {
    //       text: "OK",
    //       onPress: () => setShowAlert(false),
    //     },
    //   ]);
    //   return;
    // }

    if (!formData.fullname.trim()) {
      showCustomAlert("Lỗi", "Vui lòng nhập họ và tên", [
        {
          text: "OK",
          onPress: () => setShowAlert(false),
        },
      ]);
      return;
    }

    if (!formData.gender.trim()) {
      showCustomAlert("Lỗi", "Vui lòng chọn giới tính", [
        {
          text: "OK",
          onPress: () => setShowAlert(false),
        },
      ]);
      return;
    }

    if (!formData.birthDate.trim()) {
      showCustomAlert("Lỗi", "Vui lòng nhập ngày sinh", [
        {
          text: "OK",
          onPress: () => setShowAlert(false),
        },
      ]);
      return;
    }
    const birthDate = parseDate(formData.birthDate);
    if (!birthDate) {
      showCustomAlert("Lỗi", "Ngày sinh không hợp lệ", [
        {
          text: "OK",
          onPress: () => setShowAlert(false),
        },
      ]);
      return;
    }
    if (birthDate.getTime() > new Date().getTime()) {
      showCustomAlert("Lỗi", "Ngày sinh không được lớn hơn ngày hiện tại", [
        {
          text: "OK",
          onPress: () => setShowAlert(false),
        },
      ]);
      return;
    }
    router.push("/(onboarding)/(personal-identification)/(license)/form");
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
      "Xóa ảnh thẻ căn cước",
      `Bạn có chắc chắn muốn xóa ảnh mặt ${
        type === "front" ? "trước" : "sau"
      } thẻ căn cước?`,
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
                setFrontImageUri(null);
                lastProcessedFrontImageRef.current = null; // Reset ref when deleting front image
                await AsyncStorage.removeItem("temp_id_front");
                await AsyncStorage.removeItem("id_front");
              } else {
                setTempBackImageUri(null);
                setBackImageUri(null);
                await AsyncStorage.removeItem("temp_id_back");
                await AsyncStorage.removeItem("id_back");
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
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
            <Text style={styles.title}>Thẻ căn cước</Text>
          </View>

          {/* Image Upload Sections */}
          <View style={styles.imageSection}>
            {/* Front Image */}
            <View style={styles.imageContainer}>
              <Text style={styles.imageLabel}>
                Ảnh mặt trước <Text style={styles.required}>*</Text>
                {isExtractingOCR && (
                  <Text style={styles.ocrStatus}>
                    {" "}
                    (Đang trích xuất thông tin...)
                  </Text>
                )}
              </Text>
              <View style={styles.imageUploadArea}>
                {isExtractingOCR ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#70E000" />
                    <Text style={styles.loadingText}>Đang xử lý ảnh...</Text>
                  </View>
                ) : tempFrontImageUri || frontImageUri ? (
                  <TouchableOpacity
                    style={styles.imageWrapper}
                    onPress={() => handleImagePress("front")}
                  >
                    <Image
                      source={{ uri: (tempFrontImageUri || frontImageUri)! }}
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
                {!isExtractingOCR && (
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleImageUpload("front")}
                  >
                    <Edit2Icon color="#70E000" size={16} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Back Image */}
            <View style={styles.imageContainer}>
              <Text style={styles.imageLabel}>
                Ảnh mặt sau <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.imageUploadArea}>
                {tempBackImageUri || backImageUri ? (
                  <TouchableOpacity
                    style={styles.imageWrapper}
                    onPress={() => handleImagePress("back")}
                  >
                    <Image
                      source={{ uri: (tempBackImageUri || backImageUri)! }}
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
                Họ và tên<Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={formData.fullname}
                onChangeText={(value) => handleInputChange("fullname", value)}
                placeholder="Nhập họ và tên"
                placeholderTextColor="#92929D"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Giới tính <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                activeOpacity={1}
                style={styles.dropdownContainer}
                onPress={() => setShowGenderDropdown(!showGenderDropdown)}
              >
                <Text
                  style={[
                    styles.dropdownText,
                    !formData.gender && styles.placeholderText,
                  ]}
                >
                  {formData.gender === "Male" ? "Nam" : formData.gender === "Female" ? "Nữ" : "Chọn giới tính"}
                </Text>
                <ChevronDown
                  color="#92929D"
                  size={20}
                  style={[
                    styles.dropdownIcon,
                    showGenderDropdown && styles.dropdownIconRotated,
                  ]}
                />
              </TouchableOpacity>
              {showGenderDropdown && (
                <View style={styles.dropdownList}>
                  <TouchableOpacity
                    activeOpacity={1}
                    style={styles.dropdownItem}
                    onPress={() => handleGenderSelect("Male")}
                  >
                    <Text style={styles.dropdownItemText}>Nam</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={1}
                    style={styles.dropdownItem}
                    onPress={() => handleGenderSelect("Female")}
                  >
                    <Text style={styles.dropdownItemText}>Nữ</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Ngày sinh <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={formData.birthDate}
                onChangeText={(value) => handleInputChange("birthDate", value)}
                placeholder="DD/MM/YYYY"
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
    width: "14%",
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
  textArea: {
    height: 80,
    textAlignVertical: "top",
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
  ocrStatus: {
    fontSize: 14,
    color: "#70E000",
    fontStyle: "italic",
  },
  loadingContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#70E000",
  },
});
