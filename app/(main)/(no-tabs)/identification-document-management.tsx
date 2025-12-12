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
import { DocumentViewModel } from "@/viewmodels/document/documentViewModel";
import { UserProfile, DocumentRecord } from "@/models/document/document";
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
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEmergencyContactNameModal, setShowEmergencyContactNameModal] =
    useState(false);
  const [showEmergencyContactPhoneModal, setShowEmergencyContactPhoneModal] =
    useState(false);
  const [showBioModal, setShowBioModal] = useState(false);
  const [showFullNameModal, setShowFullNameModal] = useState(false);
  const [showLicenseTierModal, setShowLicenseTierModal] = useState(false);
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
  const [editPhone, setEditPhone] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editPasswordConfirm, setEditPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [editEmergencyName, setEditEmergencyName] = useState("");
  const [editEmergencyPhone, setEditEmergencyPhone] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editFullName, setEditFullName] = useState("");
  const [editLicenseTier, setEditLicenseTier] = useState("");

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
              await documentViewModel.updateAvatar(uri);
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
              await documentViewModel.updateAvatar(uri);
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
        onPress: async () => {
          setShowAlert(false);
          try {
            await documentViewModel.updateAvatar(null);
            showCustomAlert("Thành công", "Đã xóa ảnh đại diện", [
              { text: "OK", onPress: () => setShowAlert(false) },
            ]);
          } catch (error: any) {
            showCustomAlert("Lỗi", error.message || "Không thể xóa ảnh", [
              { text: "OK", onPress: () => setShowAlert(false) },
            ]);
          }
        },
      },
      {
        text: "Hủy",
        style: "cancel",
        onPress: () => setShowAlert(false),
      },
    ]);
  };

  const handleEditPhone = () => {
    if (userProfile) {
      setEditPhone(userProfile.phone.replace(/\s/g, ""));
      setShowPhoneModal(true);
    }
  };

  const handleSavePhone = async () => {
    try {
      await documentViewModel.updatePhone(editPhone);
      // Force refresh data to ensure UI updates
      await documentViewModel.loadData();
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

  const handleSavePassword = async () => {
    try {
      await documentViewModel.updatePassword(editPassword, editPasswordConfirm);
      // Force refresh data to ensure UI updates
      await documentViewModel.loadData();
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

  const handleEditEmergencyContactName = () => {
    if (userProfile) {
      setEditEmergencyName(userProfile.emergencyContact?.name || "");
      setShowEmergencyContactNameModal(true);
    }
  };

  const handleSaveEmergencyContactName = async () => {
    try {
      await documentViewModel.updateEmergencyContactName(editEmergencyName);
      setShowEmergencyContactNameModal(false);
      showCustomAlert("Thành công", "Đã cập nhật tên người liên hệ", [
        { text: "OK", onPress: () => setShowAlert(false) },
      ]);
    } catch (error: any) {
      showCustomAlert(
        "Lỗi",
        error.message || "Không thể cập nhật tên người liên hệ",
        [{ text: "OK", onPress: () => setShowAlert(false) }]
      );
    }
  };

  const handleEditEmergencyContactPhone = () => {
    if (userProfile) {
      setEditEmergencyPhone(
        (userProfile.emergencyContact?.phone || "").replace(/\s/g, "")
      );
      setShowEmergencyContactPhoneModal(true);
    }
  };

  const handleSaveEmergencyContactPhone = async () => {
    try {
      await documentViewModel.updateEmergencyContactPhone(editEmergencyPhone);
      setShowEmergencyContactPhoneModal(false);
      showCustomAlert(
        "Thành công",
        "Đã cập nhật số điện thoại liên hệ khẩn cấp",
        [{ text: "OK", onPress: () => setShowAlert(false) }]
      );
    } catch (error: any) {
      showCustomAlert(
        "Lỗi",
        error.message || "Không thể cập nhật số điện thoại liên hệ khẩn cấp",
        [{ text: "OK", onPress: () => setShowAlert(false) }]
      );
    }
  };

  const handleEditBio = () => {
    if (user?.instructor) {
      setEditBio(user.instructor.bio || "");
      setShowBioModal(true);
    }
  };

  const handleSaveBio = async () => {
    try {
      await documentViewModel.updateInstructorBio(editBio);
      // Force refresh data to ensure UI updates
      await documentViewModel.loadData();
      setShowBioModal(false);
      showCustomAlert("Thành công", "Đã cập nhật mô tả", [
        { text: "OK", onPress: () => setShowAlert(false) },
      ]);
    } catch (error: any) {
      showCustomAlert("Lỗi", error.message || "Không thể cập nhật mô tả", [
        { text: "OK", onPress: () => setShowAlert(false) },
      ]);
    }
  };

  const handleEditFullName = () => {
    if (userProfile) {
      setEditFullName(userProfile.fullName || "");
      setShowFullNameModal(true);
    }
  };

  const handleSaveFullName = async () => {
    try {
      await documentViewModel.updateFullName(editFullName);
      // Force refresh data to ensure UI updates
      await documentViewModel.loadData();
      setShowFullNameModal(false);
      showCustomAlert("Thành công", "Đã cập nhật họ và tên", [
        { text: "OK", onPress: () => setShowAlert(false) },
      ]);
    } catch (error: any) {
      showCustomAlert("Lỗi", error.message || "Không thể cập nhật họ và tên", [
        { text: "OK", onPress: () => setShowAlert(false) },
      ]);
    }
  };

  const handleEditDriverLicenseImage = () => {
    showCustomAlert("Chọn ảnh", "Bạn muốn chụp ảnh mới hay chọn từ thư viện?", [
      {
        text: "Chụp ảnh",
        style: "default",
        onPress: async () => {
          setShowAlert(false);
          try {
            const uri = await documentViewModel.pickImageFromCamera();
            if (uri) {
              await documentViewModel.updateDriverLicenseImage(uri);
              await documentViewModel.loadData();
              showCustomAlert("Thành công", "Đã cập nhật ảnh bằng lái xe", [
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
              await documentViewModel.updateDriverLicenseImage(uri);
              await documentViewModel.loadData();
              showCustomAlert("Thành công", "Đã cập nhật ảnh bằng lái xe", [
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
        text: "Hủy",
        style: "cancel",
        onPress: () => setShowAlert(false),
      },
    ]);
  };

  const handleEditLicenseTier = () => {
    // Get current license tier value
    const driverLicenseRecord = documentRecords.find(
      (record) => record.id === "driverLicense"
    );
    const currentTier =
      driverLicenseRecord?.fields.find(
        (field) => field.label === "Hạng bằng lái"
      )?.value || "";
    setEditLicenseTier(currentTier);
    setShowLicenseTierModal(true);
  };

  const handleSaveLicenseTier = async () => {
    try {
      await documentViewModel.updateLicenseTier(editLicenseTier);
      // Force refresh data to ensure UI updates
      await documentViewModel.loadData();
      setShowLicenseTierModal(false);
      showCustomAlert("Thành công", "Đã cập nhật hạng bằng lái", [
        { text: "OK", onPress: () => setShowAlert(false) },
      ]);
    } catch (error: any) {
      showCustomAlert(
        "Lỗi",
        error.message || "Không thể cập nhật hạng bằng lái",
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
                  {user?.role === UserRole.NoviceDriver ? (
                    <EditableInfoItem
                      label="Họ và tên"
                      value={userProfile?.fullName || ""}
                      onEdit={handleEditFullName}
                    />
                  ) : (
                    <InfoItem
                      label="Họ và tên"
                      value={userProfile?.fullName || ""}
                    />
                  )}
                  <InfoItem label="Email" value={userProfile?.email || ""} />
                  {user?.role === UserRole.Instructor && (
                    <EditableInfoItem
                      label="Mô tả"
                      value={user?.instructor?.bio || ""}
                      onEdit={handleEditBio}
                    />
                  )}
                  <EditableInfoItem
                    label="Số điện thoại"
                    value={userProfile?.phone || ""}
                    onEdit={handleEditPhone}
                  />
                  <EditablePasswordItem
                    label="Mật khẩu"
                    value={userProfile?.password || "••••••••"}
                    onEdit={handleEditPassword}
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
                    onEdit={handleEditEmergencyContactName}
                  />
                  <EditableInfoItem
                    label="Số điện thoại"
                    value={userProfile?.emergencyContact?.phone || ""}
                    onEdit={handleEditEmergencyContactPhone}
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
                            <View style={styles.fileLabelContainer}>
                              <Text style={styles.fileLabel}>{file.label}</Text>
                              {record.id === "driverLicense" &&
                                file.label === "Ảnh mặt trước" && (
                                  <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={handleEditDriverLicenseImage}
                                    style={styles.editButton}
                                  >
                                    <Edit2
                                      size={14}
                                      color={AppColors.primary}
                                    />
                                  </TouchableOpacity>
                                )}
                            </View>
                            {file.imageUrl ? (
                              <Image
                                source={{ uri: file.imageUrl }}
                                style={styles.fileImage}
                              />
                            ) : (
                              <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={handleEditDriverLicenseImage}
                                style={styles.filePlaceholder}
                              >
                                <Text style={styles.filePlaceholderText}>
                                  Chưa cung cấp ảnh
                                </Text>
                                <Text style={styles.filePlaceholderSubtext}>
                                  Nhấn để thêm ảnh
                                </Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        ))}
                      </View>
                    )}

                    <View style={styles.fieldGrid}>
                      {record.fields.map((field) => {
                        // Hide "Hạng bằng lái" field for role 3 (NoviceDriver)
                        if (
                          user?.role === UserRole.NoviceDriver &&
                          record.id === "driverLicense" &&
                          field.label === "Hạng bằng lái"
                        ) {
                          return null;
                        }
                        return (
                          <View
                            key={`${record.id}-${field.label}`}
                            style={styles.fieldCard}
                          >
                            <View style={styles.fieldLabelContainer}>
                              <Text style={styles.fieldLabel}>
                                {field.label}
                              </Text>
                              {record.id === "driverLicense" &&
                                field.label === "Hạng bằng lái" && (
                                  <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={handleEditLicenseTier}
                                    style={styles.editButton}
                                  >
                                    <Edit2
                                      size={14}
                                      color={AppColors.primary}
                                    />
                                  </TouchableOpacity>
                                )}
                            </View>
                            <Text style={styles.fieldValue}>
                              {field.value || "—"}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

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

      {/* Emergency Contact Name Edit Modal */}
      <Modal
        visible={showEmergencyContactNameModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEmergencyContactNameModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chỉnh sửa Tên người liên hệ</Text>
              <TouchableOpacity
                onPress={() => setShowEmergencyContactNameModal(false)}
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
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowEmergencyContactNameModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={handleSaveEmergencyContactName}
              >
                <Text style={styles.modalSaveButtonText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Emergency Contact Phone Edit Modal */}
      <Modal
        visible={showEmergencyContactPhoneModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEmergencyContactPhoneModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Chỉnh sửa Số điện thoại liên hệ khẩn cấp
              </Text>
              <TouchableOpacity
                onPress={() => setShowEmergencyContactPhoneModal(false)}
                style={styles.modalCloseButton}
              >
                <X size={24} color={AppColors.textPrimary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalLabel}>Số điện thoại</Text>
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
                onPress={() => setShowEmergencyContactPhoneModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={handleSaveEmergencyContactPhone}
              >
                <Text style={styles.modalSaveButtonText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bio Edit Modal */}
      <Modal
        visible={showBioModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowBioModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chỉnh sửa Mô tả</Text>
              <TouchableOpacity
                onPress={() => setShowBioModal(false)}
                style={styles.modalCloseButton}
              >
                <X size={24} color={AppColors.textPrimary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalLabel}>Mô tả</Text>
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              placeholder="Nhập mô tả về bản thân"
              placeholderTextColor={AppColors.textSecondary}
              value={editBio}
              onChangeText={setEditBio}
              multiline={true}
              numberOfLines={6}
              textAlignVertical="top"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowBioModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={handleSaveBio}
              >
                <Text style={styles.modalSaveButtonText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Full Name Edit Modal */}
      <Modal
        visible={showFullNameModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFullNameModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chỉnh sửa Họ và tên</Text>
              <TouchableOpacity
                onPress={() => setShowFullNameModal(false)}
                style={styles.modalCloseButton}
              >
                <X size={24} color={AppColors.textPrimary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalLabel}>Họ và tên</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Nhập họ và tên"
              placeholderTextColor={AppColors.textSecondary}
              value={editFullName}
              onChangeText={setEditFullName}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowFullNameModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={handleSaveFullName}
              >
                <Text style={styles.modalSaveButtonText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* License Tier Edit Modal */}
      <Modal
        visible={showLicenseTierModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLicenseTierModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chỉnh sửa Hạng bằng lái</Text>
              <TouchableOpacity
                onPress={() => setShowLicenseTierModal(false)}
                style={styles.modalCloseButton}
              >
                <X size={24} color={AppColors.textPrimary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalLabel}>Hạng bằng lái</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Nhập hạng bằng lái (B1, B2, C, D, E, F)"
              placeholderTextColor={AppColors.textSecondary}
              value={editLicenseTier}
              onChangeText={setEditLicenseTier}
              autoCapitalize="characters"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowLicenseTierModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={handleSaveLicenseTier}
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
      <Text style={styles.infoValue}>••••••••</Text>
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
  fileLabelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  fileLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: AppColors.textPrimary,
    flex: 1,
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
    marginBottom: 4,
  },
  filePlaceholderSubtext: {
    fontSize: 11,
    color: AppColors.primary,
    fontWeight: "600",
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
  fieldLabelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fieldLabel: {
    fontSize: 11,
    color: AppColors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    flex: 1,
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
    paddingBottom: 0,
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
  modalTextArea: {
    minHeight: 120,
    paddingTop: 14,
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
    paddingBottom: 24,
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
