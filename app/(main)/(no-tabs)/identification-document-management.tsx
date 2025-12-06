import React, { useState, useEffect } from "react";
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
import {
  ArrowLeft,
  Edit2,
  Camera,
  X,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react-native";
import { AppColors } from "@/constants/Colors";
import { ROUTES } from "@/constants/routes";
import CustomAlert from "@/components/CustomAlert";
import { useViewModel } from "@/viewmodels/shared/BaseViewModel";
import {
  DocumentViewModel,
  UserProfile,
  DocumentRecord,
} from "@/viewmodels/document/documentViewModel";
import { RootState } from "@/lib/redux/store";
import { UserRole } from "@/models/enum/UserRole.enum";

export default function IdentificationDocumentManagementInstructorScreen() {
  const router = useRouter();
  const [documentState, documentViewModel] = useViewModel<
    RootState["document"],
    DocumentViewModel
  >(DocumentViewModel, (state: RootState) => state.document);

  // Get data from state
  const user = documentState.user;
  const userProfile = documentState.userProfile;
  const documentRecords = documentState.documentRecords;
  const isLoading = documentState.isLoading;

  // Fetch data on mount
  useEffect(() => {
    documentViewModel.loadData().catch((error) => {
      console.error("Error loading data:", error);
      showCustomAlert(
        "Lỗi",
        documentState.errorMessage ||
          "Không thể tải dữ liệu. Vui lòng thử lại.",
        [{ text: "OK", onPress: () => setShowAlert(false) }]
      );
    });
  }, []);

  // Modal states
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
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
  const [editPassword, setEditPassword] = useState("");
  const [editPasswordConfirm, setEditPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordInView, setShowPasswordInView] = useState(false);
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
        onPress: async () => {
          setShowAlert(false);
          try {
            const uri = await documentViewModel.pickImageFromCamera();
            if (uri) {
              documentViewModel.updateAvatar(uri);
              showCustomAlert("Thành công", "Đã cập nhật ảnh đại diện", [
                { text: "OK", onPress: () => setShowAlert(false) },
              ]);
            }
          } catch (error: any) {
            showCustomAlert("Lỗi", error.message || "Không thể chụp ảnh", [
              { text: "OK", onPress: () => setShowAlert(false) },
            ]);
          }
        },
      },
      {
        text: "Chọn từ thư viện",
        style: "default",
        onPress: async () => {
          setShowAlert(false);
          try {
            const uri = await documentViewModel.pickImageFromLibrary();
            if (uri) {
              documentViewModel.updateAvatar(uri);
              showCustomAlert("Thành công", "Đã cập nhật ảnh đại diện", [
                { text: "OK", onPress: () => setShowAlert(false) },
              ]);
            }
          } catch (error: any) {
            showCustomAlert("Lỗi", error.message || "Không thể chọn ảnh", [
              { text: "OK", onPress: () => setShowAlert(false) },
            ]);
          }
        },
      },
      {
        text: "Xóa ảnh",
        style: "destructive",
        onPress: () => {
          setShowAlert(false);
          documentViewModel.updateAvatar(null);
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

  const handleEditEmail = () => {
    if (userProfile) {
      setEditEmail(userProfile.email);
      setShowEmailModal(true);
    }
  };

  const handleSaveEmail = () => {
    try {
      documentViewModel.updateEmail(editEmail);
      setShowEmailModal(false);
      showCustomAlert("Thành công", "Đã cập nhật email", [
        { text: "OK", onPress: () => setShowAlert(false) },
      ]);
    } catch (error: any) {
      showCustomAlert("Lỗi", error.message || "Không thể cập nhật email", [
        { text: "OK", onPress: () => setShowAlert(false) },
      ]);
    }
  };

  const handleEditPhone = () => {
    if (userProfile) {
      setEditPhone(userProfile.phone.replace(/\s/g, ""));
      setShowPhoneModal(true);
    }
  };

  const handleSavePhone = () => {
    try {
      documentViewModel.updatePhone(editPhone);
      setShowPhoneModal(false);
      showCustomAlert("Thành công", "Đã cập nhật số điện thoại", [
        { text: "OK", onPress: () => setShowAlert(false) },
      ]);
    } catch (error: any) {
      showCustomAlert(
        "Lỗi",
        error.message || "Không thể cập nhật số điện thoại",
        [{ text: "OK", onPress: () => setShowAlert(false) }]
      );
    }
  };

  const handleEditPassword = () => {
    setEditPassword("");
    setEditPasswordConfirm("");
    setShowPassword(false);
    setShowPasswordModal(true);
  };

  const handleSavePassword = () => {
    try {
      documentViewModel.updatePassword(editPassword, editPasswordConfirm);
      setShowPasswordModal(false);
      showCustomAlert("Thành công", "Đã cập nhật mật khẩu", [
        { text: "OK", onPress: () => setShowAlert(false) },
      ]);
    } catch (error: any) {
      showCustomAlert("Lỗi", error.message || "Không thể cập nhật mật khẩu", [
        { text: "OK", onPress: () => setShowAlert(false) },
      ]);
    }
  };

  const handleEditEmergencyContact = () => {
    if (userProfile) {
      setEditEmergencyName(userProfile.emergencyContact?.name || "");
      setEditEmergencyPhone(
        (userProfile.emergencyContact?.phone || "").replace(/\s/g, "")
      );
      setShowEmergencyContactModal(true);
    }
  };

  const handleSaveEmergencyContact = () => {
    try {
      documentViewModel.updateEmergencyContact(
        editEmergencyName,
        editEmergencyPhone
      );
      setShowEmergencyContactModal(false);
      showCustomAlert("Thành công", "Đã cập nhật thông tin liên hệ khẩn cấp", [
        { text: "OK", onPress: () => setShowAlert(false) },
      ]);
    } catch (error: any) {
      showCustomAlert(
        "Lỗi",
        error.message || "Không thể cập nhật thông tin liên hệ khẩn cấp",
        [{ text: "OK", onPress: () => setShowAlert(false) }]
      );
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {isLoading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
          </View>
        )}
        {!isLoading && userProfile && (
          <>
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
                  <Text style={styles.headerTitle}>
                    Quản Lý Tài Liệu Cá Nhân
                  </Text>
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
                      {userProfile?.avatar ? (
                        <Image
                          source={{ uri: userProfile.avatar }}
                          style={styles.avatarImage}
                        />
                      ) : (
                        <View style={styles.avatarPlaceholder}>
                          <Text style={styles.avatarPlaceholderText}>
                            {userProfile?.fullName?.charAt(0).toUpperCase() ||
                              "U"}
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
                  Thông tin được sử dụng để xác minh hồ sơ người dùng.
                </Text>
                <View style={styles.infoGrid}>
                  <InfoItem
                    label="Họ và tên"
                    value={userProfile?.fullName || ""}
                  />
                  <EditableInfoItem
                    label="Email"
                    value={userProfile?.email || ""}
                    onEdit={handleEditEmail}
                  />
                  <EditableInfoItem
                    label="Số điện thoại"
                    value={userProfile?.phone || ""}
                    onEdit={handleEditPhone}
                  />
                  <EditablePasswordItem
                    label="Mật khẩu"
                    value={userProfile?.password || "••••••••"}
                    onEdit={handleEditPassword}
                    showPassword={showPasswordInView}
                    onToggleShowPassword={() =>
                      setShowPasswordInView(!showPasswordInView)
                    }
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
                    value={userProfile?.emergencyContact?.name || ""}
                    onEdit={handleEditEmergencyContact}
                  />
                  <EditableInfoItem
                    label="Số điện thoại"
                    value={userProfile?.emergencyContact?.phone || ""}
                    onEdit={handleEditEmergencyContact}
                  />
                </View>
              </View>
            </View>

            {user?.role === UserRole.Instructor && (
              <View style={styles.documentSection}>
                {documentRecords.map((record) => (
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
                          record.id === "driverLicense" &&
                            styles.fileGridStacked,
                        ]}
                      >
                        {record.files.map((file) => (
                          <View
                            key={`${record.id}-${file.label}`}
                            style={[
                              styles.file,
                              record.id === "driverLicense" &&
                                styles.fileFullWidth,
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
                          <Text style={styles.fieldValue}>
                            {field.value || "—"}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {user?.role === UserRole.NoviceDriver && (
              <View style={styles.documentSection}>
                {documentRecords.map((record) => (
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
                          record.id === "driverLicense" &&
                            styles.fileGridStacked,
                        ]}
                      >
                        {record.files.map((file) => (
                          <View
                            key={`${record.id}-${file.label}`}
                            style={[
                              styles.file,
                              record.id === "driverLicense" &&
                                styles.fileFullWidth,
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
                          <Text style={styles.fieldValue}>
                            {field.value || "—"}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
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

      {/* Password Edit Modal */}
      <Modal
        visible={showPasswordModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chỉnh sửa Mật khẩu</Text>
              <TouchableOpacity
                onPress={() => setShowPasswordModal(false)}
                style={styles.modalCloseButton}
              >
                <X size={24} color={AppColors.textPrimary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalLabel}>Mật khẩu mới</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Nhập mật khẩu mới"
                placeholderTextColor={AppColors.textSecondary}
                value={editPassword}
                onChangeText={setEditPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.passwordToggle}
              >
                {showPassword ? (
                  <EyeOff size={20} color={AppColors.textSecondary} />
                ) : (
                  <Eye size={20} color={AppColors.textSecondary} />
                )}
              </TouchableOpacity>
            </View>
            <Text style={[styles.modalLabel, { marginTop: 16 }]}>
              Xác nhận mật khẩu
            </Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Nhập lại mật khẩu"
                placeholderTextColor={AppColors.textSecondary}
                value={editPasswordConfirm}
                onChangeText={setEditPasswordConfirm}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.passwordToggle}
              >
                {showPassword ? (
                  <EyeOff size={20} color={AppColors.textSecondary} />
                ) : (
                  <Eye size={20} color={AppColors.textSecondary} />
                )}
              </TouchableOpacity>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowPasswordModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={handleSavePassword}
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

function EditablePasswordItem({
  label,
  value,
  onEdit,
  showPassword,
  onToggleShowPassword,
}: {
  label: string;
  value: string;
  onEdit: () => void;
  showPassword: boolean;
  onToggleShowPassword: () => void;
}) {
  return (
    <View style={styles.infoItem}>
      <View style={styles.infoItemHeader}>
        <Text style={styles.infoLabel}>{label}</Text>
        <View style={styles.passwordItemActions}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onToggleShowPassword}
            style={styles.passwordToggleButton}
          >
            {showPassword ? (
              <EyeOff size={16} color={AppColors.textSecondary} />
            ) : (
              <Eye size={16} color={AppColors.textSecondary} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onEdit}
            style={styles.editButton}
          >
            <Edit2 size={14} color={AppColors.primary} />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.infoValue}>
        {showPassword
          ? value === "••••••••"
            ? "••••••••"
            : value
          : "••••••••"}
      </Text>
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
  passwordItemActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  passwordToggleButton: {
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
  passwordInputContainer: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
    backgroundColor: AppColors.backgroundLight,
    borderRadius: 12,
    padding: 14,
    paddingRight: 48,
    fontSize: 16,
    color: AppColors.textPrimary,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  passwordToggle: {
    position: "absolute",
    right: 14,
    padding: 4,
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
  loadingContainer: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 16,
    color: AppColors.textSecondary,
  },
});
