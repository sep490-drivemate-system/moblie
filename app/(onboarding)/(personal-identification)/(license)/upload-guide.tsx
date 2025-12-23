import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ArrowLeft, Check, X } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import CustomAlert from "@/components/CustomAlert";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppColors } from "@/constants/Colors";

export default function UploadGuideScreen() {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type: string }>();
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

  const handleUpload = () => {
    showCustomAlert("Chọn ảnh", "Bạn muốn chụp ảnh mới hay chọn từ thư viện?", [
      {
        text: "Chụp ảnh",
        style: "default",
        onPress: () => {
          setShowAlert(false);
          openCamera();
        },
      },
      {
        text: "Chọn từ thư viện",
        style: "default",
        onPress: () => {
          setShowAlert(false);
          openImageLibrary();
        },
      },
      {
        text: "Hủy",
        style: "cancel",
        onPress: () => setShowAlert(false),
      },
    ]);
  };

  const openCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      showCustomAlert("Lỗi", "Cần quyền truy cập camera để chụp ảnh", [
        {
          text: "OK",
          onPress: () => setShowAlert(false),
        },
      ]);
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      // Save image to temp AsyncStorage
      const storageKey =
        type === "front" ? "temp_license_front" : "temp_license_back";
      await AsyncStorage.setItem(storageKey, result.assets[0].uri);
      // Navigate back to form with selected image
      router.back();
    }
  };

  const openImageLibrary = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      showCustomAlert("Lỗi", "Cần quyền truy cập thư viện ảnh", [
        {
          text: "OK",
          onPress: () => setShowAlert(false),
        },
      ]);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      // Save image to temp AsyncStorage
      const storageKey =
        type === "front" ? "temp_license_front" : "temp_license_back";
      await AsyncStorage.setItem(storageKey, result.assets[0].uri);
      // Navigate back to form with selected image
      router.back();
    }
  };

  const getTitle = () => {
    return type === "front"
      ? "Hướng dẫn tải lên ảnh mặt trước giấy phép lái xe"
      : "Hướng dẫn tải lên ảnh mặt sau giấy phép lái xe";
  };

  const getSampleImages = () => {
    if (type === "front") {
      return [
        require("@/assets/images/image_1_guide3.png"),
        require("@/assets/images/image_2_guide3.png"),
      ];
    } else {
      return [
        require("@/assets/images/image_1_guide3.png"),
        require("@/assets/images/image_2_guide3.png"),
      ];
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
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <ArrowLeft color="#000" size={24} />
            </TouchableOpacity>
          </View>

          {/* Title */}
          <Text style={styles.title}>{getTitle()}</Text>

          {/* Sample Photos */}
          <View style={styles.sampleContainer}>
            <Text style={styles.sampleLabel}>Ảnh mẫu</Text>
            <View style={styles.samplePhotos}>
              <Image source={getSampleImages()[0]} style={styles.samplePhoto} />
            </View>
            <View style={styles.samplePhotos}>
              <Image source={getSampleImages()[1]} style={styles.samplePhoto} />
            </View>
          </View>

          {/* Requirements */}
          <View style={styles.requirementsContainer}>
            <View style={styles.requirementSection}>
              <View style={styles.requirementHeader}>
                <Check color="#00C851" size={20} />
                <Text style={styles.requirementTitle}>Yêu cầu:</Text>
              </View>
              <View style={styles.requirementList}>
                <Text style={styles.requirementItem}>
                  • Giấy phép lái xe bằng B trở lên còn hạn. Bằng lái bắt buộc
                  có dấu mộc
                </Text>
                <Text style={styles.requirementItem}>
                  • Thông tin trùng khớp với CMND/CCCD: họ tên, ngày/tháng/năm
                  sinh
                </Text>
                <Text style={styles.requirementItem}>
                  • Mặt trước là mặt có ảnh và thông tin cá nhân (tên, ngày
                  tháng năm sinh, địa chỉ)
                </Text>
              </View>
            </View>

            <View style={styles.requirementSection}>
              <View style={styles.requirementHeader}>
                <X color="#FF4444" size={20} />
                <Text style={styles.requirementTitle}>
                  Hãy đảm bảo ảnh KHÔNG:
                </Text>
              </View>
              <View style={styles.requirementList}>
                <Text style={styles.requirementItem}>
                  • Giấy tờ chụp đầy đủ các thông tin, không mất góc
                </Text>
                <Text style={styles.requirementItem}>
                  • Không chụp ảnh qua màn hình hoặc sử dụng giấy tờ scan. Ảnh
                  chụp rõ nét, không lóa sáng, không can thiệp chỉnh sửa
                </Text>
                <Text style={styles.requirementItem}>
                  • Hình ảnh phải là bằng lái xe gốc, không chấp nhận giấy hẹn
                  trả kết quả bằng lái xe hoặc biên lai thu giữ bằng lái xe
                </Text>
              </View>
            </View>
          </View>

          {/* Upload Button */}
          <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
            <Text style={styles.uploadButtonText}>Tải hồ sơ lên</Text>
          </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
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
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    marginBottom: 30,
  },
  sampleContainer: {
    marginBottom: 30,
  },
  sampleLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 15,
  },
  samplePhotos: {
    paddingBottom: 10,
  },
  samplePhoto: {
    width: "100%",
    height: 250,
    backgroundColor: "#F0F0F0",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  requirementsContainer: {
    flex: 1,
    marginBottom: 30,
  },
  requirementSection: {
    marginBottom: 25,
  },
  requirementHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  requirementTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginLeft: 8,
  },
  requirementList: {
    paddingLeft: 28,
  },
  requirementItem: {
    fontSize: 14,
    color: "#000",
    lineHeight: 20,
    marginBottom: 8,
  },
  uploadButton: {
    backgroundColor: AppColors.primary,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 30,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
