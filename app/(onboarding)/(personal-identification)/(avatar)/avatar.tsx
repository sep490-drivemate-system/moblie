import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
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

export default function AvatarScreen() {
  const router = useRouter();
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [tempAvatarUri, setTempAvatarUri] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
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

      // If onboarding was reset, clear all avatar data
      if (!onboardingCompleted || !quizCompleted) {
        setAvatarUri(null);
        setTempAvatarUri(null);
        setIsSaved(false);
        await AsyncStorage.removeItem("temp_user_avatar");
        return;
      }

      // Load temp avatar from AsyncStorage (from upload-guide)
      const tempAvatar = await AsyncStorage.getItem("temp_user_avatar");
      if (tempAvatar) {
        setTempAvatarUri(tempAvatar);
        setIsSaved(false);
      } else {
        setTempAvatarUri(null);
        setIsSaved(false);
      }

      // Clear saved avatar since we're not persisting to AsyncStorage
      setAvatarUri(null);
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleAvatarPress = () => {
    router.push(
      "/(onboarding)/(personal-identification)/(avatar)/upload-guide"
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

  const handleSave = async () => {
    const currentAvatar = tempAvatarUri || avatarUri;
    if (!currentAvatar) {
      showCustomAlert("Lỗi", "Vui lòng tải lên ảnh đại diện", [
        {
          text: "OK",
          onPress: () => setShowAlert(false),
        },
      ]);
      return;
    }

    try {
      // Chỉ lưu ảnh vào state, không lưu vào AsyncStorage
      setAvatarUri(currentAvatar);
      setTempAvatarUri(null);
      setIsSaved(true);
      // Xóa temp avatar từ AsyncStorage sau khi đã lưu vào state
      await AsyncStorage.removeItem("temp_user_avatar");
      showCustomAlert("Thành công", "Ảnh đại diện đã được lưu", [
        {
          text: "OK",
          onPress: () => setShowAlert(false),
        },
      ]);
    } catch (error) {
      showCustomAlert("Lỗi", "Không thể lưu ảnh đại diện", [
        {
          text: "OK",
          onPress: () => setShowAlert(false),
        },
      ]);
    }
  };

  const handleNext = () => {
    const currentAvatar = tempAvatarUri || avatarUri;
    if (!currentAvatar) {
      showCustomAlert(
        "Lỗi",
        "Vui lòng tải lên ảnh đại diện trước khi tiếp tục",
        [
          {
            text: "OK",
            onPress: () => setShowAlert(false),
          },
        ]
      );
      return;
    }

    router.push("/(onboarding)/(personal-identification)/(id-card)/form");
  };

  const handleImagePress = () => {
    if (tempAvatarUri || avatarUri) {
      setShowDeleteMode(true);
    }
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

  const handleDeleteAvatar = () => {
    showCustomAlert(
      "Xóa ảnh đại diện",
      "Bạn có chắc chắn muốn xóa ảnh đại diện?",
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
              // Clear both temp and saved avatar
              setTempAvatarUri(null);
              setAvatarUri(null);
              setIsSaved(false);
              setShowDeleteMode(false);
              setShowAlert(false);

              // Xóa temp avatar từ AsyncStorage
              await AsyncStorage.removeItem("temp_user_avatar");

              showCustomAlert("Thành công", "Ảnh đại diện đã được xóa", [
                {
                  text: "OK",
                  onPress: () => setShowAlert(false),
                },
              ]);
            } catch (error) {
              showCustomAlert("Lỗi", "Không thể xóa ảnh đại diện", [
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

        {/* Welcome Message */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>Xin chào bạn!</Text>
          <Text style={styles.subtitleText}>
            Bạn đang đăng ký dịch vụ{" "}
            <Text style={styles.drivemateText}>DriveMate</Text>
          </Text>
        </View>

        {/* Avatar Section */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatarCircle}>
            {tempAvatarUri || avatarUri ? (
              <TouchableOpacity
                style={styles.imageContainer}
                onPress={handleImagePress}
              >
                <Image
                  source={{ uri: (tempAvatarUri || avatarUri)! }}
                  style={[
                    styles.avatarImage,
                    showDeleteMode && styles.dimmedImage,
                  ]}
                />
                {showDeleteMode && (
                  <View style={styles.deleteOverlay}>
                    <TouchableOpacity
                      style={styles.trashButton}
                      onPress={handleDeleteAvatar}
                    >
                      <Trash2 color="#FFFFFF" size={24} />
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            ) : (
              <View style={styles.avatarPlaceholder}></View>
            )}
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleAvatarPress}
            >
              <Edit2Icon color="#70E000" size={16} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>Quay lại</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.nextButton]} onPress={handleNext}>
            <Text style={[styles.nextButtonText]}>Kế tiếp</Text>
          </TouchableOpacity>
        </View>
      </View>

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
  content: {
    flex: 1,
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
    width: "7%",
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
    height: 280,
  },
  welcomeContainer: {
    alignItems: "center",
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  welcomeText: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 10,
  },
  subtitleText: {
    fontSize: 16,
    color: "#92929D",
    textAlign: "center",
  },
  drivemateText: {
    color: "#70E000",
    fontWeight: "bold",
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  avatarCircle: {
    width: 180,
    height: 180,
    borderRadius: 110,
    borderWidth: 1,
    borderColor: "#70E000",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  avatarImage: {
    width: 160,
    height: 160,
    borderRadius: 90,
  },
  avatarPlaceholder: {
    width: 160,
    height: 160,
    borderRadius: 90,
    borderColor: "#70E000",
    borderWidth: 1,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  editButton: {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#70E000",
    borderWidth: 1,
  },
  imageContainer: {
    position: "relative",
    width: 160,
    height: 160,
    borderRadius: 90,
    justifyContent: "center",
    alignItems: "center",
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
    borderRadius: 90,
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
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    gap: 15,
    paddingHorizontal: 20,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#70E000",
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
  nextButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
