import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Alert,
} from "react-native";
import { AppColors } from "@/constants/Colors";
import {
  PackageDetailData,
  usePackageDetailViewModel,
} from "@/viewmodels/booking/PackageDetailViewModel";
import { useViewModel } from "@/viewmodels/shared/BaseViewModel";
import { BookingViewModel } from "@/viewmodels/booking/BookingViewModel";

interface CancelPackageModalProps {
  visible: boolean;
  packageData: PackageDetailData | null;
  onClose: () => void;
  getStatusText: (status: string) => string;
  onCancelled?: () => void;
}

export default function CancelPackageModal({
  visible,
  packageData,
  onClose,
  getStatusText,
  onCancelled,
}: CancelPackageModalProps) {
  if (!packageData) return null;

  const [bookingState, bookingViewModel] = useViewModel(
    BookingViewModel,
    (state) => state.booking
  );
  const packageDetailViewModel = usePackageDetailViewModel();
  const isProcessingCancel = bookingState.isCancellingBooking;

  const refundEvaluation = useMemo(() => {
    if (!packageData) return null;
    return packageDetailViewModel.computeRefund({
      status: packageData.status,
      purchaseDate: packageData.purchaseDate,
      price: packageData.price,
      totalHours: packageData.totalHours,
      usedHours: packageData.usedHours,
    });
  }, [packageData, packageDetailViewModel]);

  const refundInfo = useMemo(() => {
    if (!refundEvaluation) return null;
    return packageDetailViewModel.renderRefundInfo(refundEvaluation);
  }, [refundEvaluation, packageDetailViewModel]);

  const handleConfirmCancel = async () => {
    const success = await bookingViewModel.cancelPackageBooking(packageData?.id);
    if (success) {
      Alert.alert("Thành công", "Bạn đã hủy gói thành công", [
        {
          text: "OK",
          onPress: () => {
            onClose();
            onCancelled?.();
          },
        },
      ]);
    } else {
      Alert.alert("Lỗi", "Không thể hủy gói. Vui lòng thử lại sau.");
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => !isProcessingCancel && onClose()}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Xác nhận hủy gói</Text>
          <View style={{ gap: 8 }}>
            <Text style={styles.modalText}>
              Gói: {packageData.packageName}
            </Text>
            <Text style={styles.modalText}>
              Trạng thái: {getStatusText(packageData.status)}
            </Text>
            <Text style={styles.modalText}>
              Ngày mua:{" "}
              {new Date(packageData.purchaseDate).toLocaleDateString(
                "vi-VN",
                { day: "2-digit", month: "2-digit", year: "numeric" }
              )}
            </Text>
            {packageData.cancelDate && (
              <Text style={styles.modalText}>
                Ngày hủy:{" "}
                {new Date(packageData.cancelDate).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </Text>
            )}
            {refundInfo && (
              <View style={styles.refundInfo}>
                <Text style={[styles.modalText, { color: refundInfo.color }]}>
                  {refundInfo.text}
                </Text>
                {refundInfo.reason && (
                  <Text style={styles.modalSubText}>{refundInfo.reason}</Text>
                )}
              </View>
            )}
            <View style={styles.modalNoteBox}>
              <Text style={styles.modalNoteTitle}>
                Lưu ý chính sách hoàn tiền
              </Text>
              <Text style={styles.modalSubText}>
                - Chưa đi và mua dưới 30 ngày: hoàn 100% số tiền mua gói.
              </Text>
              <Text style={styles.modalSubText}>
                - Chưa đi và mua trên 30 ngày: không hoàn tiền.
              </Text>
              <Text style={styles.modalSubText}>
                - Đã đi được một phần và mua dưới 30 ngày: số tiền hoàn = (tổng
                tiền mua gói / tổng số giờ của gói) × (tổng số giờ của gói -
                tổng số giờ đã đi được).
              </Text>
            </View>
          </View>
          <View style={styles.modalActions}>
            <Pressable
              disabled={isProcessingCancel}
              style={[styles.modalButton, styles.modalCancel]}
              onPress={onClose}
            >
              <Text style={styles.modalCancelText}>Đóng</Text>
            </Pressable>
            <Pressable
              disabled={isProcessingCancel}
              style={[styles.modalButton, styles.modalConfirm]}
              onPress={handleConfirmCancel}
            >
              <Text style={styles.modalConfirmText}>
                {isProcessingCancel ? "Đang xử lý..." : "Xác nhận hủy"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: AppColors.white,
    borderRadius: 12,
    padding: 20,
    width: "100%",
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  modalText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "600",
  },
  modalSubText: {
    fontSize: 12,
    color: "#6b7280",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  modalCancel: {
    backgroundColor: "#e5e7eb",
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  modalConfirm: {
    backgroundColor: AppColors.primary,
  },
  modalConfirmText: {
    fontSize: 14,
    fontWeight: "800",
    color: AppColors.white,
  },
  modalNoteBox: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    gap: 4,
  },
  modalNoteTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
  },
  refundInfo: {
    paddingVertical: 6,
  },
});

