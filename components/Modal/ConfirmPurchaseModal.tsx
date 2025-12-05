import React from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { Car, User, Route, Clock, Award, X } from "lucide-react-native";
import { IInstructorCar, IInstructorPackages } from "@/models/instructor/instructor.type";
import { AppColors } from "@/constants/Colors";

type ConfirmPurchaseModalProps = {
  visible: boolean;
  selectedPackage: IInstructorPackages | null;
  selectedVehicle: string | null;
  cars: IInstructorCar[];
  isProcessing: boolean;
  scaleAnim: Animated.Value;
  onClose: () => void;
  onSelectVehicle: (vehicleId: string | null) => void;
  onConfirmPurchase: () => void;
};

export function ConfirmPurchaseModal({
  visible,
  selectedPackage,
  selectedVehicle,
  cars,
  isProcessing,
  scaleAnim,
  onClose,
  onSelectVehicle,
  onConfirmPurchase,
}: ConfirmPurchaseModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => !isProcessing && onClose()}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => !isProcessing && onClose()}
        />
        <Animated.View
          style={[
            styles.confirmModalContent,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.confirmModalHeader}>
            <Text style={styles.confirmModalTitle}>Xác nhận mua gói</Text>
            {!isProcessing && (
              <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
                <X size={20} color="#64748b" strokeWidth={2.5} />
              </TouchableOpacity>
            )}
          </View>

          {selectedPackage && (
            <ScrollView style={styles.confirmModalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.confirmPackageSection}>
                <Text style={styles.confirmSectionTitle}>Thông tin gói</Text>
                <View style={styles.confirmPackageCard}>
                  <Text style={styles.confirmPackageName}>{selectedPackage.name}</Text>

                  <View style={styles.confirmPackageBadge}>
                    {selectedPackage.isRentalCar ? (
                      <View style={styles.confirmBadgeWithVehicle}>
                        <Car size={14} color="#16a34a" />
                        <Text style={styles.confirmBadgeText}>Có xe</Text>
                      </View>
                    ) : (
                      <View style={styles.confirmBadgeInstructor}>
                        <User size={14} color="#ca8a04" />
                        <Text style={styles.confirmBadgeText}>Chỉ có người hướng dẫn</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.confirmPackageDetails}>
                    <View style={styles.confirmDetailRow}>
                      <Clock size={16} color="#64748b" />
                      <Text style={styles.confirmDetailText}>
                        Thời lượng sử dụng: {selectedPackage.duration} giờ
                      </Text>
                    </View>
                    <View style={styles.confirmDetailRow}>
                      <Route size={16} color="#64748b" />
                      <Text style={styles.confirmDetailText}>
                        Loại đường: {selectedPackage.roadTypes.join(", ")}
                      </Text>
                    </View>
                  </View>

                  {selectedPackage.drivingSkills?.length ? (
                    <View style={styles.confirmSkillsContainer}>
                      <View style={styles.confirmSkillsHeader}>
                        <Award size={16} color="#64748b" strokeWidth={2} />
                        <Text style={styles.confirmSkillsLabel}>Kỹ năng :</Text>
                      </View>
                      <View style={styles.confirmSkillsList}>
                        {selectedPackage.drivingSkills.map((skill: string, index: number) => (
                          <View key={index} style={styles.confirmSkillChip}>
                            <Text style={styles.confirmSkillText}>{skill}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  ) : null}
                </View>
              </View>

              {selectedPackage.isRentalCar && (
                <View style={styles.confirmVehicleSection}>
                  <Text style={styles.confirmSectionTitle}>Chọn xe</Text>
                  <Text style={styles.confirmVehicleSubtitle}>
                    Chọn xe để sử dụng cho gói này
                  </Text>


                  {cars.map((vehicle) => (
                    <TouchableOpacity activeOpacity={1}
                      key={vehicle.id}
                      style={[
                        styles.confirmVehicleOption,
                        selectedVehicle === String(vehicle.id) && styles.confirmVehicleOptionSelected,
                      ]}
                      onPress={() => onSelectVehicle(String(vehicle.id))}
                    >
                      <Image source={{ uri: vehicle.thumbnailUrl }} style={styles.confirmVehicleOptionImage} />
                      <View style={styles.confirmVehicleOptionInfo}>
                        <Text style={styles.confirmVehicleOptionName}>{vehicle.modelName}</Text>
                        <View style={styles.confirmVehicleOptionSpecs}>
                          <Text style={styles.confirmVehicleOptionSpec}>{vehicle.seatCount} chỗ</Text>
                          {vehicle.vehicleType && (
                            <>
                              <Text style={styles.confirmVehicleOptionDot}> • </Text>
                              <Text style={styles.confirmVehicleOptionSpec}>{vehicle.vehicleType}</Text>
                            </>
                          )}
                        </View>
                      </View>
                      <View style={styles.confirmVehicleRadioButton}>
                        {selectedVehicle === String(vehicle.id) && (
                          <View style={styles.confirmVehicleRadioButtonInner} />
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <View style={styles.confirmPriceSection}>
                <View style={styles.confirmPriceRow}>
                  <Text style={styles.confirmPriceLabel}>Giá gói:</Text>
                  <Text style={styles.confirmPriceValue}>
                    {selectedPackage.price.toLocaleString("vi-VN")} đ
                  </Text>
                </View>
                <View style={styles.confirmDivider} />
                <View style={styles.confirmPriceRow}>
                  <Text style={styles.confirmTotalLabel}>Tổng cộng:</Text>
                  <Text style={styles.confirmTotalValue}>
                    {selectedPackage.price.toLocaleString("vi-VN")} đ
                  </Text>
                </View>
              </View>
            </ScrollView>
          )}

          <View style={styles.confirmModalActions}>
            {!isProcessing && (
              <TouchableOpacity style={styles.confirmCancelButton} onPress={onClose}>
                <Text style={styles.confirmCancelButtonText}>Hủy</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.confirmPurchaseButton, isProcessing && styles.confirmPurchaseButtonDisabled]}
              onPress={onConfirmPurchase}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.confirmPurchaseButtonText}>Xác nhận mua</Text>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    width: "100%",
    height: "100%",
  },
  confirmModalContent: {
    backgroundColor: AppColors.white,
    borderRadius: 24,
    width: "90%",
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1000,
    position: "relative",
  },
  confirmModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.borderLight,
  },
  confirmModalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: AppColors.textPrimary,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  confirmModalBody: {
    maxHeight: 400,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  confirmPackageSection: {
    marginBottom: 20,
  },
  confirmSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: AppColors.textPrimary,
    marginBottom: 12,
  },
  confirmPackageCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: AppColors.borderLight,
  },
  confirmPackageName: {
    fontSize: 18,
    fontWeight: "700",
    color: AppColors.textPrimary,
    marginBottom: 12,
  },
  confirmPackageBadge: {
    marginBottom: 12,
  },
  confirmBadgeWithVehicle: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
    gap: 6,
    borderWidth: 1,
    borderColor: "#86efac",
  },
  confirmBadgeInstructor: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
    gap: 6,
    borderWidth: 1,
    borderColor: "#fcd34d",
  },
  confirmBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1f2937",
  },
  confirmPackageDetails: {
    gap: 8,
  },
  confirmDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  confirmDetailText: {
    fontSize: 14,
    color: AppColors.textSecondary,
    fontWeight: "500",
  },
  confirmSkillsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: AppColors.borderLight,
  },
  confirmSkillsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  confirmSkillsLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: AppColors.textPrimary,
  },
  confirmSkillsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  confirmSkillChip: {
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#7dd3fc",
  },
  confirmSkillText: {
    fontSize: 12,
    fontWeight: "600",
    color: AppColors.primary,
  },
  confirmVehicleSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  confirmVehicleSubtitle: {
    fontSize: 13,
    color: AppColors.textSecondary,
    fontWeight: "500",
    marginBottom: 16,
  },
  confirmVehicleOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: AppColors.borderLight,
    backgroundColor: AppColors.white,
    marginBottom: 12,
  },
  confirmVehicleOptionSelected: {
    borderColor: AppColors.primary,
    backgroundColor: "#dbeafe",
    borderWidth: 2.5,
  },
  confirmVehicleOptionImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  confirmNoVehicleIcon: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: "#f0fdf4",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#86efac",
  },
  confirmNoVehicleIconText: {
    fontSize: 32,
  },
  confirmVehicleOptionInfo: {
    flex: 1,
  },
  confirmVehicleOptionName: {
    fontSize: 14,
    fontWeight: "700",
    color: AppColors.textPrimary,
    marginBottom: 4,
  },
  confirmVehicleOptionSpecs: {
    flexDirection: "row",
    alignItems: "center",
  },
  confirmVehicleOptionSpec: {
    fontSize: 12,
    color: AppColors.textSecondary,
    fontWeight: "500",
  },
  confirmVehicleOptionDot: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  confirmVehicleRadioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: AppColors.borderLight,
    justifyContent: "center",
    alignItems: "center",
  },
  confirmVehicleRadioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: AppColors.primary,
  },
  confirmPriceSection: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: AppColors.borderLight,
  },
  confirmPriceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 4,
  },
  confirmPriceLabel: {
    fontSize: 14,
    color: AppColors.textSecondary,
    fontWeight: "500",
  },
  confirmPriceValue: {
    fontSize: 14,
    color: AppColors.textPrimary,
    fontWeight: "600",
  },
  confirmDivider: {
    height: 1,
    backgroundColor: AppColors.borderLight,
    marginVertical: 12,
  },
  confirmTotalLabel: {
    fontSize: 16,
    color: AppColors.textPrimary,
    fontWeight: "700",
  },
  confirmTotalValue: {
    fontSize: 18,
    color: AppColors.primary,
    fontWeight: "800",
  },
  confirmModalActions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: AppColors.borderLight,
  },
  confirmCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: AppColors.borderLight,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: AppColors.white,
  },
  confirmCancelButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: AppColors.textSecondary,
  },
  confirmPurchaseButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: AppColors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: AppColors.active,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  confirmPurchaseButtonDisabled: {
    opacity: 0.7,
  },
  confirmPurchaseButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
});


