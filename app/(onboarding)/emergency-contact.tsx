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
import { ArrowLeft, MoreVertical, ChevronDown } from "lucide-react-native";
import CustomAlert from "@/components/CustomAlert";

export default function EmergencyContactScreen() {
  const router = useRouter();
  const [showRelationshipDropdown, setShowRelationshipDropdown] =
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
  const [formData, setFormData] = useState({
    emergencyContactName: "",
    relationship: "",
    emergencyPhone: "",
    temporaryAddress: "",
  });

  const relationships = [
    "Bố mẹ ruột",
    "Anh chị em ruột",
    "Cô dì chú bác",
    "Chồng",
    "Vợ",
    "Khác",
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
      // Check if onboarding was reset
      const onboardingCompleted = await AsyncStorage.getItem(
        "onboarding_completed"
      );
      const quizCompleted = await AsyncStorage.getItem("quiz_completed");

      // If onboarding was reset, clear all data
      if (!onboardingCompleted || !quizCompleted) {
        setFormData({
          emergencyContactName: "",
          relationship: "",
          emergencyPhone: "",
          temporaryAddress: "",
        });
        await AsyncStorage.removeItem("emergency_contact_data");
        return;
      }

      const savedFormData = await AsyncStorage.getItem(
        "emergency_contact_data"
      );

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
    AsyncStorage.setItem("emergency_contact_data", JSON.stringify(newFormData));
  };

  const handleRelationshipSelect = (relationship: string) => {
    const newFormData = {
      ...formData,
      relationship: relationship,
    };
    setFormData(newFormData);
    setShowRelationshipDropdown(false);

    // Save form data temporarily
    AsyncStorage.setItem("emergency_contact_data", JSON.stringify(newFormData));
  };

  // Check if all fields are filled
  const isFormComplete = () => {
    return (
      formData.emergencyContactName.trim() !== "" &&
      formData.relationship.trim() !== "" &&
      formData.emergencyPhone.trim() !== "" &&
      formData.temporaryAddress.trim() !== ""
    );
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleNext = async () => {
    // Validation
    if (!formData.emergencyContactName.trim()) {
      showCustomAlert(
        "Lỗi",
        "Vui lòng nhập tên người liên hệ trong trường hợp khẩn cấp",
        [
          {
            text: "OK",
            onPress: () => setShowAlert(false),
          },
        ]
      );
      return;
    }

    if (!formData.relationship.trim()) {
      showCustomAlert("Lỗi", "Vui lòng chọn quan hệ", [
        {
          text: "OK",
          onPress: () => setShowAlert(false),
        },
      ]);
      return;
    }

    if (!formData.emergencyPhone.trim()) {
      showCustomAlert(
        "Lỗi",
        "Vui lòng nhập số điện thoại liên hệ trong trường hợp khẩn cấp",
        [
          {
            text: "OK",
            onPress: () => setShowAlert(false),
          },
        ]
      );
      return;
    }

    if (!formData.temporaryAddress.trim()) {
      showCustomAlert(
        "Lỗi",
        "Vui lòng nhập địa chỉ tạm trú của người hướng dẫn",
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
      // Save data to AsyncStorage
      await AsyncStorage.setItem(
        "emergency_contact_data",
        JSON.stringify(formData)
      );

      // Navigate to next page
      router.push("/(onboarding)/commitment");
    } catch (error) {
      showCustomAlert("Lỗi", "Không thể lưu thông tin liên hệ khẩn cấp", [
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
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.headerBackButton}
              onPress={handleBack}
            >
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
              source={require("@/assets/images/background_2.png")}
              style={styles.background_2}
            />
          </View>

          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>
              Thông tin liên hệ khẩn cấp và địa chỉ tạm trú
            </Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Tên người liên hệ trong trường hợp khẩn cấp{" "}
                <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={formData.emergencyContactName}
                onChangeText={(value) =>
                  handleInputChange("emergencyContactName", value)
                }
                placeholder="Nhập tên người liên hệ"
                placeholderTextColor="#92929D"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Quan hệ <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.dropdownContainer}
                onPress={() =>
                  setShowRelationshipDropdown(!showRelationshipDropdown)
                }
              >
                <Text
                  style={[
                    styles.dropdownText,
                    !formData.relationship && styles.placeholderText,
                  ]}
                >
                  {formData.relationship || "Chọn quan hệ"}
                </Text>
                <ChevronDown
                  color="#92929D"
                  size={20}
                  style={[
                    styles.dropdownIcon,
                    showRelationshipDropdown && styles.dropdownIconRotated,
                  ]}
                />
              </TouchableOpacity>
              {showRelationshipDropdown && (
                <View style={styles.dropdownList}>
                  <ScrollView
                    style={styles.dropdownScrollView}
                    showsVerticalScrollIndicator={true}
                    nestedScrollEnabled={true}
                  >
                    {relationships.map((relationship) => (
                      <TouchableOpacity
                        key={relationship}
                        style={styles.dropdownItem}
                        onPress={() => handleRelationshipSelect(relationship)}
                      >
                        <Text style={styles.dropdownItemText}>
                          {relationship}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Số điện thoại liên hệ trong trường hợp khẩn cấp{" "}
                <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={formData.emergencyPhone}
                onChangeText={(value) =>
                  handleInputChange("emergencyPhone", value)
                }
                placeholder="Nhập số điện thoại"
                placeholderTextColor="#92929D"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Địa chỉ tạm trú của người hướng dẫn{" "}
                <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.temporaryAddress}
                onChangeText={(value) =>
                  handleInputChange("temporaryAddress", value)
                }
                placeholder="Nhập địa chỉ tạm trú"
                placeholderTextColor="#92929D"
                multiline={true}
                numberOfLines={3}
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
  background_2: {
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
    color: "#FF0000",
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
