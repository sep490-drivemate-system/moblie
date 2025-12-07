import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ArrowLeft, MoreVertical, Check, X } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import CustomAlert from "@/components/CustomAlert";
import { useState } from "react";
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
      await AsyncStorage.setItem(
        `temp_car_verification_${type}`,
        result.assets[0].uri
      );
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
      await AsyncStorage.setItem(
        `temp_car_verification_${type}`,
        result.assets[0].uri
      );
      // Navigate back to form with selected image
      router.back();
    }
  };

  const getSampleImages = () => {
    switch (type) {
      case "front":
        return [
          require("@/assets/images/image_1-guide1.png"),
          require("@/assets/images/image_1-guide2.png"),
        ];
      case "back":
        return [
          require("@/assets/images/image_1-guide2.png"),
          require("@/assets/images/image_1-guide1.png"),
        ];
      case "side":
        return [
          require("@/assets/images/image_1-guide3.png"),
          require("@/assets/images/image_1-guide4.png"),
        ];
      case "interior":
        return [
          require("@/assets/images/image_1-guide4.png"),
          require("@/assets/images/image_1-guide3.png"),
        ];
      default:
        return [
          require("@/assets/images/image_1-guide1.png"),
          require("@/assets/images/image_1-guide2.png"),
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
          <Text style={styles.title}>Hướng dẫn tải hình ảnh xác thực xe</Text>

          {/* Sample Photos */}
          <View style={styles.sampleContainer}>
            <Text style={styles.sampleLabel}>Ảnh mẫu</Text>
            <View style={styles.samplePhotos}>
              <Image
                source={require("@/assets/images/image_1-guide10.png")}
                style={styles.samplePhoto}
              />
            </View>
            <View style={styles.samplePhotos}>
              <Image
                source={require("@/assets/images/image_2-guide10.png")}
                style={styles.samplePhoto}
              />
            </View>
            <View style={styles.samplePhotos}>
              <Image
                source={require("@/assets/images/image_3-guide10.png")}
                style={styles.samplePhoto}
              />
            </View>
            <View style={styles.samplePhotos}>
              <Image
                source={require("@/assets/images/image_4-guide10.png")}
                style={styles.samplePhoto}
              />
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
                  • Ảnh rõ nét, đủ ánh sáng, không bị mờ
                </Text>
                <Text style={styles.requirementItem}>
                  • Chụp toàn bộ xe trong khung hình
                </Text>
                <Text style={styles.requirementItem}>
                  • Không che khuất các chi tiết quan trọng
                </Text>
                <Text style={styles.requirementItem}>
                  • Ảnh chụp trực tiếp, không qua màn hình
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
                  • Không chụp ảnh qua màn hình hoặc sử dụng ảnh scan
                </Text>
                <Text style={styles.requirementItem}>
                  • Không bị lóa sáng, tối hoặc bị che khuất
                </Text>
                <Text style={styles.requirementItem}>
                  • Không can thiệp chỉnh sửa ảnh
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
    paddingTop: StatusBar.currentHeight,
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
    color: AppColors.white,
  },
});
