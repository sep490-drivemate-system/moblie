import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  FlatList,
} from "react-native";
import type { ViewStyle, TextStyle, ImageStyle } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import CustomAlert from "@/components/CustomAlert";
import { ArrowLeft, Camera, ChevronDown, ChevronUp } from "lucide-react-native";

const THEME_GREEN = "#70E000";

type ProfileForm = {
  fullName: string;
  gender: "male" | "female" | "";
  birthday: string; // dd-mm-yyyy
  phone: string; // 10 digits
  email: string;
  avatar: string; // url
};

function ProfileDetailScreen() {
  const router = useRouter();

  // Mock initial data - integrate with store/API later
  const [form, setForm] = useState<ProfileForm>({
    fullName: "Nguyễn Văn A",
    gender: "male",
    birthday: "01-01-2000",
    phone: "0912345678",
    email: "user@example.com",
    avatar:
      "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=256&h=256&fit=crop&crop=faces",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [genderOpen, setGenderOpen] = useState(false);
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

  const errors = useMemo(() => {
    const next: Partial<Record<keyof ProfileForm, string>> = {};
    if (!/^\d{2}-\d{2}-\d{4}$/.test(form.birthday)) {
      next.birthday = "Định dạng dd-mm-yyyy";
    } else {
      const [d, m, y] = form.birthday.split("-").map((n) => parseInt(n, 10));
      const date = new Date(y, m - 1, d);
      if (
        date.getFullYear() !== y ||
        date.getMonth() !== m - 1 ||
        date.getDate() !== d
      ) {
        next.birthday = "Ngày không hợp lệ";
      }
    }
    if (!/^\d{10}$/.test(form.phone)) {
      next.phone = "Số điện thoại 10 số";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.toLowerCase())) {
      next.email = "Email không hợp lệ";
    }
    if (!form.fullName.trim()) {
      next.fullName = "Không được để trống";
    }
    if (!form.gender) {
      next.gender = "Chọn giới tính";
    }
    return next;
  }, [form]);

  const isValid = useMemo(() => Object.keys(errors).length === 0, [errors]);

  const onChange = (key: keyof ProfileForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (!isValid) return;
    // TODO: integrate save API
    setIsEditing(false);
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
    setAlertConfig({ title, message, buttons });
    setShowAlert(true);
  };

  const handleEditAvatar = () => {
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
        { text: "OK", onPress: () => setShowAlert(false) },
      ]);
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      await AsyncStorage.setItem("temp_user_avatar", uri);
      setForm((prev) => ({ ...prev, avatar: uri }));
    }
  };

  const openImageLibrary = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      showCustomAlert("Lỗi", "Cần quyền truy cập thư viện ảnh", [
        { text: "OK", onPress: () => setShowAlert(false) },
      ]);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      await AsyncStorage.setItem("temp_user_avatar", uri);
      setForm((prev) => ({ ...prev, avatar: uri }));
    }
  };

  return (
    <View style={styles.container}>
      {/* Header - styled like transaction filter */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => router.push("/(main)/(tabs)/profile")}
            activeOpacity={0.7}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thông tin tài khoản</Text>
          <View style={styles.headerSpacer} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar + name/email */}

        {/* Form */}
        <View style={styles.formContainer}>
          <View style={styles.profileTop}>
            <View style={styles.avatarWrap}>
              <View style={styles.avatarInner}>
                <Image
                  source={{ uri: form.avatar }}
                  style={styles.avatar as ImageStyle}
                />
              </View>
              {isEditing ? (
                <TouchableOpacity
                  style={styles.avatarEditBtn}
                  onPress={handleEditAvatar}
                >
                  <Camera size={16} color="#fff" />
                </TouchableOpacity>
              ) : null}
            </View>
            <Text style={styles.name}>{form.fullName}</Text>
            <Text style={styles.email}>{form.email}</Text>
          </View>

          {/* Full name */}
          <Text style={styles.label}>Họ và tên</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập họ và tên"
            placeholderTextColor="#9ca3af"
            value={form.fullName}
            editable={isEditing}
            onChangeText={(t: string) => onChange("fullName", t)}
          />
          {errors.fullName ? (
            <Text style={styles.errorText}>{errors.fullName}</Text>
          ) : null}

          {/* Gender */}
          <Text style={[styles.label, { marginTop: 8 }]}>Giới tính</Text>
          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[styles.dropdownButton, !isEditing && { opacity: 0.8 }]}
              activeOpacity={0.8}
              onPress={() => isEditing && setGenderOpen(!genderOpen)}
            >
              <View style={styles.dropdownContent}>
                {form.gender ? (
                  <View style={styles.selectedRoleContent}>
                    <View style={styles.selectedRoleInfo}>
                      <Text style={styles.selectedRoleTitle}>
                        {form.gender === "male" ? "Nam" : "Nữ"}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <Text style={styles.placeholderText}>Chọn giới tính</Text>
                )}
              </View>
              <Text>
                {genderOpen ? (
                  <ChevronUp color={"#92929D"} />
                ) : (
                  <ChevronDown color={"#92929D"} />
                )}
              </Text>
            </TouchableOpacity>

            {genderOpen && (
              <View style={styles.dropdownList}>
                <FlatList
                  data={[
                    { id: "male", title: "Nam" },
                    { id: "female", title: "Nữ" },
                  ]}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.dropdownListItem}
                      onPress={() => {
                        onChange("gender", item.id);
                        setGenderOpen(false);
                      }}
                    >
                      <Text style={styles.dropdownListItemText}>
                        {item.title}
                      </Text>
                    </TouchableOpacity>
                  )}
                  showsVerticalScrollIndicator={false}
                />
              </View>
            )}
          </View>
          {errors.gender ? (
            <Text style={styles.errorText}>{errors.gender}</Text>
          ) : null}

          {/* Birthday */}
          <Text style={[styles.label, { marginTop: 8 }]}>Ngày sinh</Text>
          <TextInput
            style={styles.input}
            placeholder="dd-mm-yyyy"
            placeholderTextColor="#9ca3af"
            value={form.birthday}
            editable={isEditing}
            onChangeText={(t: string) => onChange("birthday", t)}
            keyboardType="number-pad"
          />
          {errors.birthday ? (
            <Text style={styles.errorText}>{errors.birthday}</Text>
          ) : null}

          {/* Phone */}
          <Text style={[styles.label, { marginTop: 8 }]}>Số điện thoại</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập số điện thoại"
            placeholderTextColor="#9ca3af"
            value={form.phone}
            editable={isEditing}
            onChangeText={(t: string) =>
              onChange("phone", t.replace(/\D/g, "").slice(0, 10))
            }
            keyboardType="number-pad"
          />
          {errors.phone ? (
            <Text style={styles.errorText}>{errors.phone}</Text>
          ) : null}

          {/* Email */}
          <Text style={[styles.label, { marginTop: 8 }]}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor="#9ca3af"
            value={form.email}
            editable={isEditing}
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={(t: string) => onChange("email", t)}
          />
          {errors.email ? (
            <Text style={styles.errorText}>{errors.email}</Text>
          ) : null}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              if (isEditing) {
                // cancel edits -> ideally reload initial data
                setIsEditing(false);
                setGenderOpen(false);
              } else {
                setIsEditing(true);
              }
            }}
            style={styles.editButton}
          >
            <Text style={styles.editButtonText}>
              {isEditing ? "Hủy" : "Chỉnh sửa"}
            </Text>
          </TouchableOpacity>
          <View style={{ width: 16 }} />
          <TouchableOpacity
            activeOpacity={0.8}
            disabled={!isEditing || !isValid}
            onPress={handleSave}
            style={[
              styles.saveButton,
              (!isEditing || !isValid) && { opacity: 0.5 },
            ]}
          >
            <Text style={styles.saveButtonText}>Lưu</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>
      {/* Custom Alert */}
      <CustomAlert
        visible={showAlert}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    backgroundColor: "white",
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    padding: 16,
  },
  profileTop: {
    alignItems: "center",
    marginTop: 12,
    marginBottom: 16,
  },
  avatarWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    position: "relative",
    backgroundColor: "#e5e7eb",
    borderWidth: 3,
    borderColor: THEME_GREEN,
    overflow: "visible",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInner: {
    width: 112,
    height: 112,
    borderRadius: 56,
    overflow: "hidden",
  },
  avatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
  },
  avatarEditBtn: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME_GREEN,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  email: {
    marginTop: 4,
    fontSize: 12,
    color: "#6b7280",
  },
  formContainer: {
    paddingVertical: 0,
    paddingHorizontal: 0,
    backgroundColor: "transparent",
  },
  // Dropdown borrowed from role-selection aesthetics
  roleContainer: {
    marginBottom: 12,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: THEME_GREEN,
  },
  dropdownContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectedRoleContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectedRoleInfo: {
    marginLeft: 0,
  },
  selectedRoleTitle: {
    fontSize: 16,
    color: "#111827",
  },
  placeholderText: {
    fontSize: 16,
    color: "#9CA3AF",
  },
  dropdownList: {
    marginTop: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    maxHeight: 180,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownListItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dropdownListItemText: {
    fontSize: 16,
    color: "#111827",
  },
  label: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 6,
    marginLeft: 2,
  },
  input: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#000",
    borderWidth: 1,
    borderColor: THEME_GREEN,
    marginBottom: 12,
  },
  // Dropdown styles (match input aesthetics)
  dropdown: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: THEME_GREEN,
  },
  dropdownText: {
    fontSize: 16,
    color: "#111827",
  },
  dropdownMenu: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#111827",
  },
  errorText: {
    color: "#dc2626",
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
    marginLeft: 2,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  editButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: THEME_GREEN,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: THEME_GREEN,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: THEME_GREEN,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: THEME_GREEN,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});

export default React.memo(ProfileDetailScreen);
