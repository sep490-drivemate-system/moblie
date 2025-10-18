import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  StatusBar,
  FlatList,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Check,
  ChevronDown,
  ChevronUp,
  MoreVertical,
} from "lucide-react-native";

interface Role {
  id: string;
  title: string;
}

const roles: Role[] = [
  {
    id: "instructor",
    title: "Người hướng dẫn",
  },
  {
    id: "noviceDriver",
    title: "Người mới lái xe",
  },
];

export default function RoleSelectionScreen() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setShowDropdown(false);
  };

  const handleContinue = async () => {
    if (!selectedRole) {
      Alert.alert("Lỗi", "Vui lòng chọn vai trò của bạn");
      return;
    }

    try {
      // Save user role
      await AsyncStorage.setItem("user_role", JSON.stringify(selectedRole));

      // Navigate based on role
      if (selectedRole.id === "noviceDriver") {
        // Novice driver goes directly to home
        await AsyncStorage.setItem("onboarding_completed", "true");
        router.replace("/(main)/(tabs)/home");
      } else if (selectedRole.id === "instructor") {
        // Instructor goes to license class selection
        router.push("/(onboarding)/license-class-select");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Có lỗi xảy ra. Vui lòng thử lại.");
    }
  };

  const handleBack = () => {
    router.back();
  };

  const renderRoleItem = ({ item }: { item: Role }) => (
    <TouchableOpacity
      style={[
        styles.roleItem,
        selectedRole?.id === item.id && styles.selectedRoleItem,
      ]}
      onPress={() => handleRoleSelect(item)}
    >
      <View style={styles.roleInfo}>
        <Text style={styles.roleTitle}>{item.title}</Text>
      </View>
      {selectedRole?.id === item.id && (
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
          <Image
            source={require("@/assets/images/logo_blue.png")}
            style={styles.logo}
          />
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
          <Text style={styles.title}>Bạn muốn đăng ký với tư cách là</Text>
        </View>

        {/* Role Selection */}
        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowDropdown(!showDropdown)}
          >
            <View style={styles.dropdownContent}>
              {selectedRole ? (
                <View style={styles.selectedRoleContent}>
                  <View style={styles.selectedRoleInfo}>
                    <Text style={styles.selectedRoleTitle}>
                      {selectedRole.title}
                    </Text>
                  </View>
                </View>
              ) : (
                <Text style={styles.placeholderText}>Đăng ký với tư cách</Text>
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
                data={roles}
                keyExtractor={(item) => item.id}
                renderItem={renderRoleItem}
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
              !selectedRole && styles.disabledButton,
            ]}
            onPress={handleContinue}
            disabled={!selectedRole}
          >
            <Text style={styles.continueButtonText}>Tiếp tục</Text>
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
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerButtons: {
    flexDirection: "row",
  },
  logo: {
    width: 150,
    height: 40,
    resizeMode: "cover",
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
  roleContainer: {
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
  selectedRoleContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectedRoleInfo: {
    flex: 1,
  },
  selectedRoleTitle: {
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
    maxHeight: 200,
  },
  roleItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  selectedRoleItem: {
    backgroundColor: "#E3F2FD",
  },
  roleInfo: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 16,
    color: "#000",
    marginBottom: 4,
  },
  checkmark: {
    fontSize: 18,
    color: "#026AA7",
    fontWeight: "bold",
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
