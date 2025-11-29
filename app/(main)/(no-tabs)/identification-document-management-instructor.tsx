import React from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { AppColors } from "@/constants/Colors";
import { ROUTES } from "@/constants/routes";

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

const userProfile = {
  fullName: "Nguyễn Văn An",
  email: "an.nguyen@example.com",
  phone: "0901 234 567",
  emergencyContact: {
    name: "Trần Thị Bình",
    phone: "0912 345 678",
  },
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
            <Text style={styles.cardTitle}>Thông tin cá nhân</Text>
            <Text style={styles.cardDescription}>
              Thông tin được sử dụng để xác minh hồ sơ người hướng dẫn.
            </Text>
            <View style={styles.infoGrid}>
              <InfoItem label="Họ và tên" value={userProfile.fullName} />
              <InfoItem label="Email" value={userProfile.email} />
              <InfoItem label="Số điện thoại" value={userProfile.phone} />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Liên hệ khẩn cấp</Text>
            <Text style={styles.cardDescription}>
              Sử dụng trong trường hợp cần liên lạc gấp.
            </Text>
            <View style={styles.infoGrid}>
              <InfoItem
                label="Tên người liên hệ"
                value={userProfile.emergencyContact.name}
              />
              <InfoItem
                label="Số điện thoại"
                value={userProfile.emergencyContact.phone}
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
});
