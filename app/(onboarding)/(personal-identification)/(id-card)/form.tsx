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
import {
  ArrowLeft,
  MoreVertical,
  Edit2Icon,
  Trash2,
  ChevronDown,
} from "lucide-react-native";
import CustomAlert from "@/components/CustomAlert";

export default function FormScreen() {
  const router = useRouter();
  const [frontImageUri, setFrontImageUri] = useState<string | null>(null);
  const [backImageUri, setBackImageUri] = useState<string | null>(null);
  const [tempFrontImageUri, setTempFrontImageUri] = useState<string | null>(
    null
  );
  const [tempBackImageUri, setTempBackImageUri] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [showDeleteMode, setShowDeleteMode] = useState(false);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
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
    idNumber: "",
    issueDate: "",
    expiryDate: "",
    issuePlace: "",
    address: "",
    gender: "",
    birthDate: "",
  });

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
      // Check if onboarding was reset
      const onboardingCompleted = await AsyncStorage.getItem(
        "onboarding_completed"
      );
      const quizCompleted = await AsyncStorage.getItem("quiz_completed");

      // If onboarding was reset, clear all data
      if (!onboardingCompleted || !quizCompleted) {
        setFrontImageUri(null);
        setBackImageUri(null);
        setTempFrontImageUri(null);
        setTempBackImageUri(null);
        setIsSaved(false);
        await AsyncStorage.removeItem("temp_id_front");
        await AsyncStorage.removeItem("temp_id_back");
        await AsyncStorage.removeItem("id_card_data");
        return;
      }

      const savedFrontImage = await AsyncStorage.getItem("id_front");
      const savedBackImage = await AsyncStorage.getItem("id_back");
      const savedFormData = await AsyncStorage.getItem("id_card_data");

      if (savedFrontImage) {
        setFrontImageUri(savedFrontImage);
      }
      if (savedBackImage) {
        setBackImageUri(savedBackImage);
      }
      if (savedFormData) {
        setFormData(JSON.parse(savedFormData));
      }

      // Load temp images if exist
      const tempFront = await AsyncStorage.getItem("temp_id_front");
      const tempBack = await AsyncStorage.getItem("temp_id_back");
      if (tempFront) {
        setTempFrontImageUri(tempFront);
      }
      if (tempBack) {
        setTempBackImageUri(tempBack);
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
      (type === "front" && (tempFrontImageUri || frontImageUri)) ||
      (type === "back" && (tempBackImageUri || backImageUri))
    ) {
      setShowDeleteMode(true);
    }
  };

  const handleImageUpload = (type: "front" | "back") => {
    // Reset saved state when user changes image
    if (isSaved) {
      setIsSaved(false);
    }

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

  const handleInputChange = (field: string, value: string) => {
    // Reset saved state when user changes data
    if (isSaved) {
      setIsSaved(false);
    }

    // Apply date formatting for date fields
    if (
      field === "issueDate" ||
      field === "expiryDate" ||
      field === "birthDate"
    ) {
      const formattedValue = formatDateInput(value);
      setFormData((prev) => ({
        ...prev,
        [field]: formattedValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleGenderSelect = (gender: string) => {
    // Reset saved state when user changes gender
    if (isSaved) {
      setIsSaved(false);
    }

    setFormData((prev) => ({
      ...prev,
      gender: gender,
    }));
    setShowGenderDropdown(false);
  };

  // Check if all fields are filled
  const isFormComplete = () => {
    return (
      (tempFrontImageUri || frontImageUri) &&
      (tempBackImageUri || backImageUri) &&
      formData.idNumber.trim() !== "" &&
      formData.issueDate.trim() !== "" &&
      formData.expiryDate.trim() !== "" &&
      formData.issuePlace.trim() !== "" &&
      formData.address.trim() !== "" &&
      formData.gender.trim() !== "" &&
      formData.birthDate.trim() !== ""
    );
  };

  const handleSave = async () => {
    // Validation
    if (!tempFrontImageUri && !frontImageUri) {
      showCustomAlert("Lỗi", "Vui lòng tải lên ảnh mặt trước thẻ căn cước", [
        {
          text: "OK",
          onPress: () => setShowAlert(false),
        },
      ]);
      return;
    }

    if (!tempBackImageUri && !backImageUri) {
      showCustomAlert("Lỗi", "Vui lòng tải lên ảnh mặt sau thẻ căn cước", [
        {
          text: "OK",
          onPress: () => setShowAlert(false),
        },
      ]);
      return;
    }

    if (!formData.idNumber.trim()) {
      showCustomAlert("Lỗi", "Vui lòng nhập số căn cước công dân", [
        {
          text: "OK",
          onPress: () => setShowAlert(false),
        },
      ]);
      return;
    }

    if (!formData.issueDate.trim()) {
      showCustomAlert("Lỗi", "Vui lòng nhập ngày cấp", [
        {
          text: "OK",
          onPress: () => setShowAlert(false),
        },
      ]);
      return;
    }

    if (!formData.expiryDate.trim()) {
      showCustomAlert("Lỗi", "Vui lòng nhập ngày hết hạn", [
        {
          text: "OK",
          onPress: () => setShowAlert(false),
        },
      ]);
      return;
    }

    if (!formData.issuePlace.trim()) {
      showCustomAlert("Lỗi", "Vui lòng nhập nơi cấp", [
        {
          text: "OK",
          onPress: () => setShowAlert(false),
        },
      ]);
      return;
    }

    if (!formData.address.trim()) {
      showCustomAlert("Lỗi", "Vui lòng nhập địa chỉ thường trú", [
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

    try {
      const currentFrontImage = tempFrontImageUri || frontImageUri;
      const currentBackImage = tempBackImageUri || backImageUri;

      await AsyncStorage.setItem("id_front", currentFrontImage!);
      await AsyncStorage.setItem("id_back", currentBackImage!);
      await AsyncStorage.setItem("id_card_data", JSON.stringify(formData));

      setFrontImageUri(currentFrontImage);
      setBackImageUri(currentBackImage);
      setTempFrontImageUri(null);
      setTempBackImageUri(null);
      await AsyncStorage.removeItem("temp_id_front");
      await AsyncStorage.removeItem("temp_id_back");
      setIsSaved(true);

      showCustomAlert("Thành công", "Thông tin thẻ căn cước đã được lưu", [
        {
          text: "OK",
          onPress: () => setShowAlert(false),
        },
      ]);
    } catch (error) {
      showCustomAlert("Lỗi", "Không thể lưu thông tin thẻ căn cước", [
        {
          text: "OK",
          onPress: () => setShowAlert(false),
        },
      ]);
    }
  };

  const handleNext = () => {
    router.push("/(onboarding)/(personal-identification)/(id-card)/form");
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
              // Reset saved state when user deletes image
              if (isSaved) {
                setIsSaved(false);
              }

              if (type === "front") {
                setTempFrontImageUri(null);
                setFrontImageUri(null);
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
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <ArrowLeft color="#000" size={24} />
            </TouchableOpacity>

            <View style={styles.headerButtons}>
              <TouchableOpacity style={styles.helpButton}>
                <Text style={styles.helpButtonText}>Cần hỗ trợ ?</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.notificationButton}>
                <View style={styles.notificationDot} />
                <MoreVertical color="#000" size={24} />
              </TouchableOpacity>
            </View>
          </View>

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
              </Text>
              <View style={styles.imageUploadArea}>
                {tempFrontImageUri || frontImageUri ? (
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
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleImageUpload("front")}
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
                Số căn cước công dân <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={formData.idNumber}
                onChangeText={(value) => handleInputChange("idNumber", value)}
                placeholder="Nhập số căn cước công dân"
                placeholderTextColor="#92929D"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Ngày cấp <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={formData.issueDate}
                onChangeText={(value) => handleInputChange("issueDate", value)}
                placeholder="DD/MM/YYYY"
                placeholderTextColor="#92929D"
                keyboardType="numeric"
                maxLength={10}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Ngày hết hạn <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={formData.expiryDate}
                onChangeText={(value) => handleInputChange("expiryDate", value)}
                placeholder="DD/MM/YYYY"
                placeholderTextColor="#92929D"
                keyboardType="numeric"
                maxLength={10}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Nơi cấp <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={formData.issuePlace}
                onChangeText={(value) => handleInputChange("issuePlace", value)}
                placeholder="Nhập nơi cấp"
                placeholderTextColor="#92929D"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Địa chỉ thường trú <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.address}
                onChangeText={(value) => handleInputChange("address", value)}
                placeholder="Nhập địa chỉ thường trú"
                placeholderTextColor="#92929D"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Giới tính <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.dropdownContainer}
                onPress={() => setShowGenderDropdown(!showGenderDropdown)}
              >
                <Text
                  style={[
                    styles.dropdownText,
                    !formData.gender && styles.placeholderText,
                  ]}
                >
                  {formData.gender || "Chọn giới tính"}
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
                    style={styles.dropdownItem}
                    onPress={() => handleGenderSelect("Nam")}
                  >
                    <Text style={styles.dropdownItemText}>Nam</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => handleGenderSelect("Nữ")}
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
            <TouchableOpacity
              style={[
                styles.saveButton,
                !isFormComplete() && styles.disabledButton,
                isSaved && styles.savedButton,
              ]}
              onPress={handleSave}
              disabled={!isFormComplete() || isSaved}
            >
              <Text
                style={[
                  styles.saveButtonText,
                  isSaved && styles.savedButtonText,
                ]}
              >
                Lưu
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.nextButton, !isSaved && styles.disabledNextButton]}
              onPress={handleNext}
              disabled={!isSaved}
            >
              <Text
                style={[
                  styles.nextButtonText,
                  !isSaved && styles.disabledNextButtonText,
                ]}
              >
                Kế tiếp
              </Text>
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
  backButton: {
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
    width: "50%",
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
});
