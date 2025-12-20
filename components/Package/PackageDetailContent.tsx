import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Award, Route, MessageSquare } from "lucide-react-native";
import { AppColors } from "@/constants/Colors";
import { IUserInfo } from "@/features/booking/bookingThunk";
import { PackageDetailData } from "@/viewmodels/booking/PackageDetailViewModel";
import { BookingStatus } from "@/models/package/user-package";

interface PackageDetailContentProps {
  packageData: PackageDetailData | null;
  instructorInfo: IUserInfo | null;
  purchaseDateInfo: {
    date: string;
    time?: string;
  };
  onOpenFeedback: () => void;
}


export default function PackageDetailContent({
  packageData,
  instructorInfo,
  purchaseDateInfo,
  onOpenFeedback,
}: PackageDetailContentProps) {
  return (
    <>
      {packageData && instructorInfo && (
        <View style={styles.instructorCard}>
          <View style={styles.instructorSection}>
            <Image
              source={{ uri: instructorInfo.avatarUrl }}
              style={styles.instructorAvatar}
            />
            <View style={styles.instructorInfo}>
              <Text style={styles.instructorLabel}>Người hướng dẫn</Text>
              <Text style={styles.instructorName}>
                {instructorInfo.fullName}
              </Text>
            </View>
          </View>
        </View>
      )}

      {packageData && (
        <View style={styles.packageCard}>
          {/* Package Name */}
          <Text style={styles.packageName}>{packageData.packageName}</Text>

          {(packageData.drivingSkills && packageData.drivingSkills.length > 0) ||
            (packageData.roadTypes && packageData.roadTypes.length > 0) ? (
            <View style={styles.skillsContainer}>
              {packageData.drivingSkills && packageData.drivingSkills.length > 0 && (
                <View style={styles.skillCategory}>
                  <View style={styles.skillCategoryHeader}>
                    <Award size={16} color="#64748b" strokeWidth={2} />
                    <Text style={styles.skillCategoryLabel}>Kỹ năng</Text>
                  </View>
                  <View style={styles.skillsTags}>
                    {packageData.drivingSkills.map((skill: string, index: number) => (
                      <View key={index} style={styles.skillChip}>
                        <Text style={styles.skillChipText}>{skill}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {packageData.roadTypes && packageData.roadTypes.length > 0 && (
                <View style={styles.skillCategory}>
                  <View style={styles.skillCategoryHeader}>
                    <Route size={16} color="#64748b" strokeWidth={2} />
                    <Text style={styles.skillCategoryLabel}>Loại đường</Text>
                  </View>
                  <View style={styles.skillsTags}>
                    {packageData.roadTypes.map((road: string, index: number) => (
                      <View key={index} style={styles.skillChip}>
                        <Text style={styles.skillChipText}>{road}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          ) : null}

          {/* Hours Info */}
          <View style={styles.hoursCard}>
            <View style={styles.hoursRow}>
              <View style={styles.hoursItem}>
                <Text style={styles.hoursLabel}>Tổng giờ</Text>
                <Text style={styles.hoursValue}>{packageData.totalHours}h</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.hoursItem}>
                <Text style={styles.hoursLabel}>Đã dùng</Text>
                <Text style={[styles.hoursValue, { color: "#64748b" }]}>
                  {packageData.usedHours}h
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.hoursItem}>
                <Text style={styles.hoursLabel}>Còn lại</Text>
                <Text
                  style={[
                    styles.hoursValue,
                    {
                      color:
                        packageData.remainingHours > 0
                          ? AppColors.primary
                          : "#ef4444",
                    },
                  ]}
                >
                  {packageData.remainingHours}h
                </Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${(packageData.usedHours / packageData.totalHours) * 100
                        }%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {Math.round(
                  (packageData.usedHours / packageData.totalHours) * 100
                )}
                % đã sử dụng
              </Text>
            </View>
          </View>

          {/* Package Dates */}
          <View style={styles.datesRow}>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>Mua ngày:</Text>
              <Text style={styles.dateValue}>{purchaseDateInfo.date}</Text>
              {purchaseDateInfo.time ? (
                <Text style={styles.dateTimeValue}>
                  lúc {purchaseDateInfo.time}
                </Text>
              ) : null}
            </View>
          </View>

          {(() => {
            const statusValue = typeof packageData.status === 'string'
              ? BookingStatus[packageData.status as keyof typeof BookingStatus]
              : packageData.status;

            return statusValue === BookingStatus.Used ? (
              <View style={{ marginTop: 16 }}>
                <TouchableOpacity
                  style={styles.feedbackButton}
                  onPress={onOpenFeedback}
                  activeOpacity={0.7}
                >
                  <MessageSquare size={20} color={AppColors.primary} strokeWidth={2} />
                  <Text style={styles.feedbackButtonText}>Đánh giá</Text>
                </TouchableOpacity>
              </View>
            ) : null;
          })()}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  instructorCard: {
    backgroundColor: AppColors.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  instructorSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  instructorAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#e2e8f0",
    borderWidth: 2,
    borderColor: "#f1f5f9",
  },
  instructorInfo: {
    flex: 1,
  },
  instructorLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#94a3b8",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  instructorName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
  },
  packageCard: {
    backgroundColor: AppColors.white,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  packageName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 20,
    lineHeight: 28,
  },
  skillsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    marginBottom: 16,
    gap: 12,
  },
  skillCategory: {
    marginBottom: 8,
  },
  skillCategoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  skillCategoryLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1e293b",
  },
  skillsTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  skillChip: {
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#7dd3fc",
  },
  skillChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: AppColors.primary,
  },
  hoursCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  hoursRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  hoursItem: {
    alignItems: "center",
  },
  hoursLabel: {
    fontSize: 12,
    color: "#94a3b8",
    marginBottom: 4,
  },
  hoursValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1e293b",
  },
  divider: {
    width: 1,
    backgroundColor: "#e2e8f0",
  },
  progressBarContainer: {
    gap: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: AppColors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "600",
    textAlign: "center",
  },
  datesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateItem: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  dateLabel: {
    fontSize: 12,
    color: "#94a3b8",
    marginRight: 8,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
  dateTimeValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
  feedbackButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#f0f9ff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#bae6fd",
  },
  feedbackButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: AppColors.primary,
  },
});

