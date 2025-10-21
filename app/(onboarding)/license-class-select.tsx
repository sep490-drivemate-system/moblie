import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Check,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  ArrowLeft,
} from "lucide-react-native";
import CustomAlert from "@/components/CustomAlert";

interface LicenseClass {
  id: string;
  title: string;
}

const licenseClasses: LicenseClass[] = [
  { id: "B", title: "Hạng B" },
  { id: "C1", title: "Hạng C1" },
  { id: "C", title: "Hạng C" },
  { id: "D1", title: "Hạng D1" },
  { id: "D2", title: "Hạng D2" },
  { id: "D", title: "Hạng D" },
  { id: "BE", title: "Hạng BE" },
  { id: "C1E", title: "Hạng C1E" },
  { id: "CE", title: "Hạng CE" },
  { id: "D1E", title: "Hạng D1E" },
  { id: "D2E", title: "Hạng D2E" },
  { id: "DE", title: "Hạng DE" },
];

export default function LicenseClassSelectScreen() {
  const router = useRouter();
  const [selectedClass, setSelectedClass] = useState<LicenseClass | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const handleClassSelect = (licenseClass: LicenseClass) => {
    setSelectedClass(licenseClass);
    setShowDropdown(false);
  };

  const showCustomAlert = (
    title: string,
    message: string,
    onConfirm: () => void
  ) => {
    setAlertConfig({
      title,
      message,
      onConfirm,
    });
    setShowAlert(true);
  };

  const handleContinue = async () => {
    if (!selectedClass) {
      showCustomAlert("Lỗi", "Vui lòng chọn hạng giấy phép lái xe", () =>
        setShowAlert(false)
      );
      return;
    }

    try {
      // Save license class
      await AsyncStorage.setItem(
        "license_class",
        JSON.stringify(selectedClass)
      );

      // Mark onboarding as completed
      await AsyncStorage.setItem("onboarding_completed", "true");

      // Navigate to quiz instead of home
      router.push("/(onboarding)/(quiz)/quiz-1");
    } catch (error) {
      showCustomAlert("Lỗi", "Có lỗi xảy ra. Vui lòng thử lại.", () =>
        setShowAlert(false)
      );
    }
  };

  const handleBack = () => {
    router.back();
  };

  const renderClassItem = ({ item }: { item: LicenseClass }) => (
    <TouchableOpacity
      style={[
        styles.classItem,
        selectedClass?.id === item.id && styles.selectedClassItem,
      ]}
      onPress={() => handleClassSelect(item)}
    >
      <View style={styles.classInfo}>
        <Text style={styles.classTitle}>{item.title}</Text>
      </View>
      {selectedClass?.id === item.id && (
        <Text>
          <Check color={"#026AA7"} />
        </Text>
      )}
    </TouchableOpacity>
  );

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
              <Text>Cần hỗ trợ ?</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.notificationButton}>
              <MoreVertical color="#000" size={24} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>
            Hạng giấy phép lái xe bạn muốn hướng dẫn
          </Text>
        </View>

        {/* License Class Selection */}
        <View style={styles.classContainer}>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowDropdown(!showDropdown)}
          >
            <View style={styles.dropdownContent}>
              {selectedClass ? (
                <View style={styles.selectedClassContent}>
                  <View style={styles.selectedClassInfo}>
                    <Text style={styles.selectedClassTitle}>
                      {selectedClass.title}
                    </Text>
                  </View>
                </View>
              ) : (
                <Text style={styles.placeholderText}>Chọn hạng giấy phép</Text>
              )}
            </View>
            <Text>
              {showDropdown ? (
                <ChevronUp color={"#026AA7"} />
              ) : (
                <ChevronDown color={"#026AA7"} />
              )}
            </Text>
          </TouchableOpacity>

          {/* Dropdown List */}
          {showDropdown && (
            <View style={styles.dropdownList}>
              <FlatList
                data={licenseClasses}
                keyExtractor={(item) => item.id}
                renderItem={renderClassItem}
                showsVerticalScrollIndicator={false}
              />
            </View>
          )}
        </View>

        {/* Continue Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              !selectedClass && styles.disabledButton,
            ]}
            onPress={handleContinue}
            disabled={!selectedClass}
          >
            <Text style={styles.continueButtonText}>Tiếp theo</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Custom Alert */}
      <CustomAlert
        visible={showAlert}
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={alertConfig.onConfirm}
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
    paddingHorizontal: 20,
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
  },
  notificationButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  helpButton: {
    justifyContent: "center",
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderColor: "#92929D",
    borderWidth: 1,
  },
  titleContainer: {
    marginBottom: 40,
  },
  title: {
    paddingTop: 150,
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 10,
  },
  classContainer: {
    marginBottom: 40,
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    padding: 16,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownContent: {
    flex: 1,
  },
  selectedClassContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectedClassInfo: {
    flex: 1,
  },
  selectedClassTitle: {
    fontSize: 16,
    color: "#000",
    marginBottom: 4,
  },
  placeholderText: {
    fontSize: 16,
    color: "#92929D",
  },
  dropdownList: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    maxHeight: 250,
  },
  classItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  selectedClassItem: {
    backgroundColor: "#E3F2FD",
  },
  classInfo: {
    flex: 1,
  },
  classTitle: {
    fontSize: 16,
    color: "#000",
    marginBottom: 4,
  },
  buttonContainer: {
    marginTop: "auto",
    marginBottom: 30,
  },
  continueButton: {
    backgroundColor: "#026AA7",
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#E0E0E0",
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
});
