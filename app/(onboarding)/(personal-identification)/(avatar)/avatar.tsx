import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  Alert,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ArrowLeft,
  MoreVertical,
  Edit2Icon,
  Trash2,
} from "lucide-react-native";

export default function AvatarScreen() {
  const router = useRouter();
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [tempAvatarUri, setTempAvatarUri] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [userName, setUserName] = useState("Ngân");
  const [showDeleteMode, setShowDeleteMode] = useState(false);

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
        await AsyncStorage.removeItem("user_avatar");
        return;
      }

      const savedAvatar = await AsyncStorage.getItem("user_avatar");
      if (savedAvatar) {
        setAvatarUri(savedAvatar);
        setIsSaved(true);
      }

      // Load temp avatar if exists
      const tempAvatar = await AsyncStorage.getItem("temp_user_avatar");
      if (tempAvatar) {
        setTempAvatarUri(tempAvatar);
      }
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

  const handleSave = async () => {
    const currentAvatar = tempAvatarUri || avatarUri;
    if (!currentAvatar) {
      Alert.alert("Lỗi", "Vui lòng tải lên ảnh đại diện");
      return;
    }

    try {
      await AsyncStorage.setItem("user_avatar", currentAvatar);
      setAvatarUri(currentAvatar);
      setTempAvatarUri(null);
      await AsyncStorage.removeItem("temp_user_avatar");
      setIsSaved(true);
      Alert.alert("Thành công", "Ảnh đại diện đã được lưu");
    } catch (error) {
      Alert.alert("Lỗi", "Không thể lưu ảnh đại diện");
    }
  };

  const handleNext = () => {
    router.push(
      "/(onboarding)/(personal-identification)/(national-id)/national-id"
    );
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
    Alert.alert("Xóa ảnh đại diện", "Bạn có chắc chắn muốn xóa ảnh đại diện?", [
      {
        text: "Hủy",
        style: "cancel",
        onPress: () => setShowDeleteMode(false),
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

            // Remove from AsyncStorage
            await AsyncStorage.removeItem("temp_user_avatar");
            await AsyncStorage.removeItem("user_avatar");

            Alert.alert("Thành công", "Ảnh đại diện đã được xóa");
          } catch (error) {
            Alert.alert("Lỗi", "Không thể xóa ảnh đại diện");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
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

        {/* Welcome Message */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>Xin chào {userName}!</Text>
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
              <Edit2Icon color="#026AA7" size={16} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              !tempAvatarUri && styles.disabledButton,
              isSaved && styles.savedButton,
            ]}
            onPress={handleSave}
            disabled={!tempAvatarUri || isSaved}
          >
            <Text
              style={[styles.saveButtonText, isSaved && styles.savedButtonText]}
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
    width: "25%",
    height: "100%",
    backgroundColor: "#026AA7",
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
    height: 200,
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
    color: "#026AA7",
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
    borderColor: "#026AA7",
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
    borderColor: "#026AA7",
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
    borderColor: "#026AA7",
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
    backgroundColor: "#026AA7",
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
    backgroundColor: "#609EC2",
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
});
