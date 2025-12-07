import CustomAlert from "@/components/CustomAlert";
import { getUserIdFromToken } from "@/lib/jwt/tokenUtils";
import { RootState } from "@/lib/redux/store";
import { convertImageFile } from "@/utils/utils";
import { AddCarViewModel } from "@/viewmodels/car/AddCarViewModel";
import { useViewModel } from "@/viewmodels/shared/BaseViewModel";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { Edit2Icon, Trash2 } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AppColors } from "@/constants/Colors";

export default function FormScreen() {
  const router = useRouter();
  const [carState, viewModel] = useViewModel<RootState["car"], AddCarViewModel>(
    AddCarViewModel,
    (state) => state.car
  );
  const [tempFrontImageUri, setTempFrontImageUri] = useState<string | null>(
    null
  );
  const [tempBackImageUri, setTempBackImageUri] = useState<string | null>(null);
  const [tempSideImageUri, setTempSideImageUri] = useState<string | null>(null);
  const [tempInteriorImageUri, setTempInteriorImageUri] = useState<
    string | null
  >(null);
  const [showDeleteMode, setShowDeleteMode] = useState(false);
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

  const loadUserData = async () => {
    try {
      const tempFrontImage = await AsyncStorage.getItem(
        "temp_car_verification_front"
      );
      const tempBackImage = await AsyncStorage.getItem(
        "temp_car_verification_back"
      );
      const tempSideImage = await AsyncStorage.getItem(
        "temp_car_verification_side"
      );
      const tempInteriorImage = await AsyncStorage.getItem(
        "temp_car_verification_interior"
      );

      if (tempFrontImage) {
        setTempFrontImageUri(tempFrontImage);
        viewModel.updateCarRegistrationFormField(
          "CarFrontImage",
          convertImageFile(tempFrontImage)
        );
        viewModel.updateCarRegistrationFormField(
          "ThumbnailImage",
          convertImageFile(tempFrontImage)
        );
      }
      if (tempBackImage) {
        setTempBackImageUri(tempBackImage);
        viewModel.updateCarRegistrationFormField(
          "CarBackImage",
          convertImageFile(tempBackImage)
        );
      }
      if (tempSideImage) {
        setTempSideImageUri(tempSideImage);
        viewModel.updateCarRegistrationFormField(
          "CarLeftImage",
          convertImageFile(tempSideImage)
        );
        viewModel.updateCarRegistrationFormField(
          "CarRightImage",
          convertImageFile(tempSideImage)
        );
      }
      if (tempInteriorImage) {
        setTempInteriorImageUri(tempInteriorImage);
        viewModel.updateCarRegistrationFormField(
          "InteriorImage",
          convertImageFile(tempInteriorImage)
        );
      }
      const userId = await getUserIdFromToken();
      viewModel.updateCarRegistrationFormField("InstructorId", userId);
      viewModel.updateCarRegistrationFormField(
        "Description",
        "Tình trạng xe rất tốt, không có vấn đề gì"
      );
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleImagePress = (type: "front" | "back" | "side" | "interior") => {
    if (
      (type === "front" && tempFrontImageUri) ||
      (type === "back" && tempBackImageUri) ||
      (type === "side" && tempSideImageUri) ||
      (type === "interior" && tempInteriorImageUri)
    ) {
      setShowDeleteMode(true);
    }
  };

  const handleImageUpload = (type: "front" | "back" | "side" | "interior") => {
    router.push(
      `/(onboarding)/(car)/(car-verification-image)/upload-guide?type=${type}`
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

  const handleNext = async () => {
    // Validation for images
    if (!tempFrontImageUri) {
      showCustomAlert(
        "Lỗi",
        "Vui lòng tải lên ảnh phía trước xe trước khi tiếp tục",
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
        "Vui lòng tải lên ảnh phía sau xe trước khi tiếp tục",
        [
          {
            text: "OK",
            onPress: () => setShowAlert(false),
          },
        ]
      );
      return;
    }

    if (!tempSideImageUri) {
      showCustomAlert(
        "Lỗi",
        "Vui lòng tải lên ảnh bên hông xe trước khi tiếp tục",
        [
          {
            text: "OK",
            onPress: () => setShowAlert(false),
          },
        ]
      );
      return;
    }

    if (!tempInteriorImageUri) {
      showCustomAlert(
        "Lỗi",
        "Vui lòng tải lên ảnh nội thất xe trước khi tiếp tục",
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
      await AsyncStorage.removeItem("temp_car_verification_front");
      await AsyncStorage.removeItem("temp_car_verification_back");
      await AsyncStorage.removeItem("temp_car_verification_side");
      await AsyncStorage.removeItem("temp_car_verification_interior");
      const result = await viewModel.registerCar();
      if (result) {
        router.push("/(main)/(tabs)/mycar");
      }
    } catch (error) {
      showCustomAlert("Lỗi", "Không thể lưu ảnh xác thực xe", [
        {
          text: "OK",
          onPress: () => setShowAlert(false),
        },
      ]);
    }
  };

  const handleDeleteImage = (type: "front" | "back" | "side" | "interior") => {
    const typeNames = {
      front: "phía trước",
      back: "phía sau",
      side: "bên hông",
      interior: "nội thất",
    };

    showCustomAlert(
      `Xóa ảnh ${typeNames[type]} xe`,
      `Bạn có chắc chắn muốn xóa ảnh ${typeNames[type]} xe?`,
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
                await AsyncStorage.removeItem("temp_car_verification_front");
              } else if (type === "back") {
                setTempBackImageUri(null);
                await AsyncStorage.removeItem("temp_car_verification_back");
              } else if (type === "side") {
                setTempSideImageUri(null);
                await AsyncStorage.removeItem("temp_car_verification_side");
              } else if (type === "interior") {
                setTempInteriorImageUri(null);
                await AsyncStorage.removeItem("temp_car_verification_interior");
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

  const renderImageUpload = (
    type: "front" | "back" | "side" | "interior",
    label: string,
    tempImageUri: string | null
  ) => {
    const currentImage = tempImageUri;
    return (
      <View style={styles.imageContainer}>
        <Text style={styles.imageLabel}>
          {label} <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.imageUploadArea}>
          {currentImage ? (
            <TouchableOpacity
              style={styles.imageWrapper}
              onPress={() => handleImagePress(type)}
            >
              <Image
                source={{ uri: currentImage }}
                style={[
                  styles.uploadedImage,
                  showDeleteMode && styles.dimmedImage,
                ]}
              />
              {showDeleteMode && (
                <View style={styles.deleteOverlay}>
                  <TouchableOpacity
                    style={styles.trashButton}
                    onPress={() => handleDeleteImage(type)}
                  >
                    <Trash2 color="#FFFFFF" size={24} />
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.uploadPlaceholder}
              onPress={() => handleImageUpload(type)}
            >
              <Text style={styles.uploadText}>Tải ảnh lên</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleImageUpload(type)}
          >
            <Edit2Icon color={AppColors.primary} size={16} />
          </TouchableOpacity>
        </View>
      </View>
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

  if (carState.isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#70E000" />
        <Text style={{ marginTop: 16, fontSize: 16, color: "#92929D" }}>
          Đang xử lý...
        </Text>
      </View>
    );
  }

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
            <Text style={styles.title}>Ảnh xác thực xe</Text>
          </View>

          {/* Image Upload Sections */}
          <View style={styles.imageSection}>
            {renderImageUpload("front", "Ảnh phía trước xe", tempFrontImageUri)}
            {renderImageUpload("back", "Ảnh phía sau xe", tempBackImageUri)}
            {renderImageUpload("side", "Ảnh bên hông xe", tempSideImageUri)}
            {renderImageUpload(
              "interior",
              "Ảnh nội thất xe",
              tempInteriorImageUri
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
    backgroundColor: AppColors.white,
    justifyContent: "center",
    alignItems: "center",
    borderColor: AppColors.primary,
    borderWidth: 1,
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
