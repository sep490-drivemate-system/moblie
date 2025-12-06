import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ArrowLeft, Edit2, Camera, X, Trash2 } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { AppColors } from "@/constants/Colors";
import { ROUTES } from "@/constants/routes";
import CustomAlert from "@/components/CustomAlert";

type DocumentField = {
  label: string;
  value: string;
};

type DocumentFile = {
  label: string;
  imageUrl: string | null;
};

type DocumentRecord = {
  id: string;
  title: string;
  description: string;
  updatedAt: string;
  reviewer?: string;
  fields: DocumentField[];
  files: DocumentFile[];
};

type UserProfile = {
  avatar: string | null;
  fullName: string;
  email: string;
  phone: string;
  emergencyContact: {
    name: string;
    phone: string;
  };
};

const mockDocumentRecords: DocumentRecord[] = [
  {
    id: "citizenId",
    title: "Căn Cước Công Dân",
    description:
      "Thông tin nhận dạng bắt buộc để xác thực tài khoản người hướng dẫn.",
    updatedAt: "20/10/2024 - 14:32",
    fields: [
      { label: "Họ và tên", value: "Nguyễn Văn An" },
      { label: "Ngày sinh", value: "12/03/1992" },
      { label: "Giới tính", value: "Nam" },
    ],
    files: [],
  },
  {
    id: "legalHistory",
    title: "Lý Lịch Tư Pháp",
    description: "Giấy xác nhận không có tiền án tiền sự trong vòng 06 tháng.",
    updatedAt: "18/10/2024 - 09:10",
    fields: [],
    files: [
      {
        label: "Ảnh lý lịch tư pháp",
        imageUrl:
          "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=600&q=80",
      },
    ],
  },
  {
    id: "healthCertificate",
    title: "Giấy Khám Sức Khỏe",
    description: "Bản khám sức khỏe tổng quát đủ điều kiện lái xe.",
    updatedAt: "05/11/2024 - 16:48",
    fields: [],
    files: [
      {
        label: "Ảnh giấy khám sức khỏe",
        imageUrl:
          "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&q=80",
      },
    ],
  },
  {
    id: "driverLicense",
    title: "Bằng Lái Xe",
    description: "Bản sao bằng lái xe hiện hành của người hướng dẫn.",
    updatedAt: "12/10/2024 - 11:05",
    fields: [{ label: "Hạng bằng lái", value: "B2" }],
    files: [
      {
        label: "Ảnh mặt trước",
        imageUrl:
          "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?auto=format&fit=crop&w=600&q=80",
      },
      {
        label: "Ảnh mặt sau",
        imageUrl:
          "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80",
      },
    ],
  },
  {
    id: "trainingCertificate",
    title: "Chứng Chỉ Hành Nghề",
    description:
      "Chứng chỉ đào tạo nghiệp vụ đảm bảo chuyên môn giảng dạy lái xe.",
    updatedAt: "25/09/2024 - 08:20",
    fields: [{ label: "Hạng lái xe giảng dạy", value: "B2 nâng cao" }],
    files: [
      {
        label: "Ảnh chứng chỉ hành nghề",
        imageUrl:
          "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80",
      },
    ],
  },
];

export default function IdentificationDocumentManagementInstructorScreen() {
  const router = useRouter();

  const [userProfile, setUserProfile] = useState<UserProfile>({
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    fullName: "Nguyễn Văn An",
    email: "an.nguyen@example.com",
    phone: "0901 234 567",
    emergencyContact: {
      name: "Trần Thị Bình",
      phone: "0912 345 678",
    },
  });

  // Modal states
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showEmergencyContactModal, setShowEmergencyContactModal] =
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

  // Form states
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmergencyName, setEditEmergencyName] = useState("");
  const [editEmergencyPhone, setEditEmergencyPhone] = useState("");

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
        text: "Xóa ảnh",
        style: "destructive",
        onPress: () => {
          setShowAlert(false);
          setUserProfile((prev) => ({ ...prev, avatar: null }));
          showCustomAlert("Thành công", "Đã xóa ảnh đại diện", [
            { text: "OK", onPress: () => setShowAlert(false) },
          ]);
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
      setUserProfile((prev) => ({ ...prev, avatar: uri }));
      showCustomAlert("Thành công", "Đã cập nhật ảnh đại diện", [
        { text: "OK", onPress: () => setShowAlert(false) },
      ]);
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
      setUserProfile((prev) => ({ ...prev, avatar: uri }));
      showCustomAlert("Thành công", "Đã cập nhật ảnh đại diện", [
        { text: "OK", onPress: () => setShowAlert(false) },
      ]);
    }
  };

  const handleEditEmail = () => {
    setEditEmail(userProfile.email);
    setShowEmailModal(true);
  };

  const handleSaveEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!editEmail.trim()) {
      showCustomAlert("Lỗi", "Email không được để trống", [
        { text: "OK", onPress: () => setShowAlert(false) },
      ]);
      return;
    }
    if (!emailRegex.test(editEmail)) {
      showCustomAlert("Lỗi", "Email không đúng định dạng", [
        { text: "OK", onPress: () => setShowAlert(false) },
      ]);
      return;
    }
    setUserProfile((prev) => ({ ...prev, email: editEmail }));
    setShowEmailModal(false);
    showCustomAlert("Thành công", "Đã cập nhật email", [
      { text: "OK", onPress: () => setShowAlert(false) },
    ]);
  };

  const handleEditPhone = () => {
    setEditPhone(userProfile.phone.replace(/\s/g, ""));
    setShowPhoneModal(true);
  };

  const handleSavePhone = () => {
    const phoneDigits = editPhone.replace(/\D/g, "");
    if (!phoneDigits || phoneDigits.length !== 10) {
      showCustomAlert("Lỗi", "Số điện thoại phải có đủ 10 chữ số", [
        { text: "OK", onPress: () => setShowAlert(false) },
      ]);
      return;
    }
    const formattedPhone = phoneDigits.replace(
      /(\d{4})(\d{3})(\d{3})/,
      "$1 $2 $3"
    );
    setUserProfile((prev) => ({ ...prev, phone: formattedPhone }));
    setShowPhoneModal(false);
    showCustomAlert("Thành công", "Đã cập nhật số điện thoại", [
      { text: "OK", onPress: () => setShowAlert(false) },
    ]);
  };

  const handleEditEmergencyContact = () => {
    setEditEmergencyName(userProfile.emergencyContact.name);
    setEditEmergencyPhone(
      userProfile.emergencyContact.phone.replace(/\s/g, "")
    );
    setShowEmergencyContactModal(true);
  };

  const handleSaveEmergencyContact = () => {
    if (!editEmergencyName.trim()) {
      showCustomAlert("Lỗi", "Tên người liên hệ không được để trống", [
        { text: "OK", onPress: () => setShowAlert(false) },
      ]);
      return;
    }
    const phoneDigits = editEmergencyPhone.replace(/\D/g, "");
    if (!phoneDigits || phoneDigits.length !== 10) {
      showCustomAlert("Lỗi", "Số điện thoại phải có đủ 10 chữ số", [
        { text: "OK", onPress: () => setShowAlert(false) },
      ]);
      return;
    }
    const formattedPhone = phoneDigits.replace(
      /(\d{4})(\d{3})(\d{3})/,
      "$1 $2 $3"
    );
    setUserProfile((prev) => ({
      ...prev,
      emergencyContact: {
        name: editEmergencyName.trim(),
        phone: formattedPhone,
      },
    }));
    setShowEmergencyContactModal(false);
    showCustomAlert("Thành công", "Đã cập nhật thông tin liên hệ khẩn cấp", [
      { text: "OK", onPress: () => setShowAlert(false) },
    ]);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[
            AppColors.primary,
            AppColors.gradientStart,
            AppColors.gradientEnd,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity
              activeOpacity={0.75}
              style={styles.backButton}
              onPress={() => router.push(ROUTES.PROFILE)}
            >
              <ArrowLeft size={18} color={AppColors.white} />
            </TouchableOpacity>
            <View style={styles.headerTextBlock}>
              <Text style={styles.headerTitle}>Quản Lý Tài Liệu Cá Nhân</Text>
              <Text style={styles.headerDescription}>
                Xem lại toàn bộ tài liệu đã tải lên
              </Text>
            </View>
          </View>
          <View style={styles.headerCurve} />
        </LinearGradient>

        <View style={styles.profileGrid}>
          <View style={[styles.card, styles.profileCard]}>
            <View style={styles.avatarSection}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleEditAvatar}
                style={styles.avatarEditButton}
              >
                <View style={styles.avatarContainer}>
                  {userProfile.avatar ? (
                    <Image
                      source={{ uri: userProfile.avatar }}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarPlaceholderText}>
                        {userProfile.fullName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View style={styles.avatarRing} />
                  <View style={styles.avatarEditIcon}>
                    <Camera size={16} color={AppColors.white} />
                  </View>
                </View>
              </TouchableOpacity>
            </View>
            <Text style={styles.cardTitle}>Thông tin cá nhân</Text>
            <Text style={styles.cardDescription}>
              Thông tin được sử dụng để xác minh hồ sơ người hướng dẫn.
            </Text>
            <View style={styles.infoGrid}>
              <InfoItem label="Họ và tên" value={userProfile.fullName} />
              <EditableInfoItem
                label="Email"
                value={userProfile.email}
                onEdit={handleEditEmail}
              />
              <EditableInfoItem
                label="Số điện thoại"
                value={userProfile.phone}
                onEdit={handleEditPhone}
              />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Liên hệ khẩn cấp</Text>
            <Text style={styles.cardDescription}>
              Sử dụng trong trường hợp cần liên lạc gấp.
            </Text>
            <View style={styles.infoGrid}>
              <EditableInfoItem
                label="Tên người liên hệ"
                value={userProfile.emergencyContact.name}
                onEdit={handleEditEmergencyContact}
              />
              <EditableInfoItem
                label="Số điện thoại"
                value={userProfile.emergencyContact.phone}
                onEdit={handleEditEmergencyContact}
              />
            </View>
          </View>
        </View>

        <View style={styles.documentSection}>
          {mockDocumentRecords.map((record) => (
            <View key={record.id} style={styles.documentCard}>
              <View style={styles.documentHeader}>
                <Text style={styles.documentTitle}>{record.title}</Text>
                <Text style={styles.documentDescription}>
                  {record.description}
                </Text>
              </View>

              {record.files.length > 0 && (
                <View
                  style={[
                    styles.fileGrid,
                    record.id === "driverLicense" && styles.fileGridStacked,
                  ]}
                >
                  {record.files.map((file) => (
                    <View
                      key={`${record.id}-${file.label}`}
                      style={[
                        styles.file,
                        record.id === "driverLicense" && styles.fileFullWidth,
                      ]}
                    >
                      <Text style={styles.fileLabel}>{file.label}</Text>
                      {file.imageUrl ? (
                        <Image
                          source={{ uri: file.imageUrl }}
                          style={styles.fileImage}
                        />
                      ) : (
                        <View style={styles.filePlaceholder}>
                          <Text style={styles.filePlaceholderText}>
                            Chưa cung cấp ảnh
                          </Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.fieldGrid}>
                {record.fields.map((field) => (
                  <View
                    key={`${record.id}-${field.label}`}
                    style={styles.fieldCard}
                  >
                    <Text style={styles.fieldLabel}>{field.label}</Text>
                    <Text style={styles.fieldValue}>{field.value || "—"}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Email Edit Modal */}
      <Modal
        visible={showEmailModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEmailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chỉnh sửa Email</Text>
              <TouchableOpacity
                onPress={() => setShowEmailModal(false)}
                style={styles.modalCloseButton}
              >
                <X size={24} color={AppColors.textPrimary} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.modalInput}
              placeholder="Nhập email"
              placeholderTextColor={AppColors.textSecondary}
              value={editEmail}
              onChangeText={setEditEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowEmailModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={handleSaveEmail}
              >
                <Text style={styles.modalSaveButtonText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Phone Edit Modal */}
      <Modal
        visible={showPhoneModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPhoneModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chỉnh sửa Số điện thoại</Text>
              <TouchableOpacity
                onPress={() => setShowPhoneModal(false)}
                style={styles.modalCloseButton}
              >
                <X size={24} color={AppColors.textPrimary} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.modalInput}
              placeholder="Nhập số điện thoại"
              placeholderTextColor={AppColors.textSecondary}
              value={editPhone}
              onChangeText={(text) =>
                setEditPhone(text.replace(/\D/g, "").slice(0, 10))
              }
              keyboardType="number-pad"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowPhoneModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={handleSavePhone}
              >
                <Text style={styles.modalSaveButtonText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Emergency Contact Edit Modal */}
      <Modal
        visible={showEmergencyContactModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEmergencyContactModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chỉnh sửa Liên hệ khẩn cấp</Text>
              <TouchableOpacity
                onPress={() => setShowEmergencyContactModal(false)}
                style={styles.modalCloseButton}
              >
                <X size={24} color={AppColors.textPrimary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalLabel}>Tên người liên hệ</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Nhập tên người liên hệ"
              placeholderTextColor={AppColors.textSecondary}
              value={editEmergencyName}
              onChangeText={setEditEmergencyName}
            />
            <Text style={[styles.modalLabel, { marginTop: 16 }]}>
              Số điện thoại
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Nhập số điện thoại"
              placeholderTextColor={AppColors.textSecondary}
              value={editEmergencyPhone}
              onChangeText={(text) =>
                setEditEmergencyPhone(text.replace(/\D/g, "").slice(0, 10))
              }
              keyboardType="number-pad"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowEmergencyContactModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={handleSaveEmergencyContact}
              >
                <Text style={styles.modalSaveButtonText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || "—"}</Text>
    </View>
  );
}

function EditableInfoItem({
  label,
  value,
  onEdit,
}: {
  label: string;
  value: string;
  onEdit: () => void;
}) {
  return (
    <View style={styles.infoItem}>
      <View style={styles.infoItemHeader}>
        <Text style={styles.infoLabel}>{label}</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onEdit}
          style={styles.editButton}
        >
          <Edit2 size={14} color={AppColors.primary} />
        </TouchableOpacity>
      </View>
      <Text style={styles.infoValue}>{value || "—"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  header: {
    paddingTop: 64,
    paddingHorizontal: 24,
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: 24,
    elevation: 4,
    position: "relative",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextBlock: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: AppColors.white,
    marginBottom: 8,
  },
  headerDescription: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 20,
  },
  headerCurve: {
    position: "absolute",
    bottom: -25,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: AppColors.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 6,
  },
  profileGrid: {
    paddingHorizontal: 24,
    gap: 16,
    backgroundColor: AppColors.background,
  },
  card: {
    backgroundColor: AppColors.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  profileCard: {
    gap: 16,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 12,
    paddingTop: 8,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: AppColors.white,
    backgroundColor: AppColors.white,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: AppColors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: AppColors.white,
  },
  avatarPlaceholderText: {
    fontSize: 48,
    fontWeight: "700",
    color: AppColors.white,
  },
  avatarRing: {
    position: "absolute",
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 66,
    borderWidth: 3,
    borderColor: AppColors.primary,
    opacity: 0.3,
  },
  avatarEditButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatarEditIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: AppColors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: AppColors.white,
  },
  infoItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  editButton: {
    padding: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: AppColors.textPrimary,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: AppColors.textSecondary,
    marginBottom: 16,
    lineHeight: 18,
  },
  infoGrid: {
    flexDirection: "column",
    gap: 12,
  },
  infoItem: {
    width: "100%",
    backgroundColor: AppColors.backgroundLight,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: AppColors.borderLight,
  },
  infoLabel: {
    fontSize: 11,
    color: AppColors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: "600",
    color: AppColors.textPrimary,
  },
  documentSection: {
    marginTop: 24,
    paddingHorizontal: 24,
    gap: 20,
  },
  documentCard: {
    backgroundColor: AppColors.white,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: AppColors.border,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 2,
    gap: 16,
  },
  documentHeader: {
    gap: 8,
  },
  documentTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: AppColors.textPrimary,
  },
  documentDescription: {
    fontSize: 14,
    color: AppColors.textSecondary,
    lineHeight: 20,
  },
  fileGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  fileGridStacked: {
    flexDirection: "column",
  },
  fileFullWidth: {
    width: "100%",
    minWidth: "100%",
  },
  file: {
    flexGrow: 1,
    minWidth: "45%",
    backgroundColor: AppColors.backgroundLight,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: AppColors.borderLight,
  },
  fileLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: AppColors.textPrimary,
    marginBottom: 10,
  },
  fileImage: {
    width: "100%",
    height: 160,
    borderRadius: 12,
  },
  filePlaceholder: {
    width: "100%",
    height: 160,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  filePlaceholderText: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  fieldGrid: {
    flexDirection: "column",
    gap: 12,
  },
  fieldCard: {
    width: "100%",
    backgroundColor: AppColors.backgroundLight,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: AppColors.borderLight,
  },
  fieldLabel: {
    fontSize: 11,
    color: AppColors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  fieldValue: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: "600",
    color: AppColors.textPrimary,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: AppColors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 32,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: AppColors.textPrimary,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.textPrimary,
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: AppColors.backgroundLight,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: AppColors.textPrimary,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancelButton: {
    backgroundColor: AppColors.backgroundLight,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.textSecondary,
  },
  modalSaveButton: {
    backgroundColor: AppColors.primary,
  },
  modalSaveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.white,
  },
});
