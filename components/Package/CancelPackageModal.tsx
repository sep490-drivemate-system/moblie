import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
} from "react-native";
import { AppColors } from "@/constants/Colors";
import { PackageDetailData } from "@/viewmodels/booking/PackageDetailViewModel";

interface CancelPackageModalProps {
  visible: boolean;
  packageData: PackageDetailData | null;
  localStatus: string;
  cancelDateStr: string | null;
  isProcessingCancel: boolean;
  onClose: () => void;
  onConfirm: () => void;
  getStatusText: (status: string) => string;
}

function daysSince(dateStr: string): number {
  const start = new Date(dateStr).getTime();
  const now = Date.now();
  return Math.floor((now - start) / (1000 * 60 * 60 * 24));
}

function computeRefund(pkg: {
  status: string;
  purchaseDate: string;
  price?: number;
  totalHours: number;
  usedHours: number;
}): { eligible: boolean; amount: number; reason: string } {
  if (pkg.status !== "paid" && pkg.status !== "in_progress") {
    return {
      eligible: false,
      amount: 0,
      reason: "Gói không ở trạng thái đã thanh toán",
    };
  }

  const days = daysSince(pkg.purchaseDate);
  const price = typeof pkg.price === "number" ? pkg.price : 0;

  // TH1: Chưa đi (< 30 ngày) -> hoàn 100% số tiền mua gói
  if (pkg.usedHours === 0 && days < 30) {
    return {
      eligible: true,
      amount: price,
      reason: "Hoàn 100% vì chưa sử dụng giờ nào và mua dưới 30 ngày",
    };
  }

  // TH2: Chưa đi (>30 ngày) -> không hoàn lại
  if (pkg.usedHours === 0 && days >= 30) {
    return {
      eligible: false,
      amount: 0,
      reason: "Không hoàn tiền vì đã quá 30 ngày kể từ ngày mua",
    };
  }

  // TH3: Đã đi được một phần && < 30 ngày -> tính theo công thức
  if (pkg.usedHours > 0 && days < 30) {
    const refund = (price / pkg.totalHours) * (pkg.totalHours - pkg.usedHours);
    return {
      eligible: true,
      amount: Math.max(0, refund),
      reason: `Hoàn theo số giờ chưa sử dụng: ${pkg.totalHours - pkg.usedHours}/${pkg.totalHours} giờ`,
    };
  }

  // Đã đi được một phần && >= 30 ngày -> không hoàn
  if (pkg.usedHours > 0 && days >= 30) {
    return {
      eligible: false,
      amount: 0,
      reason: "Không hoàn tiền vì đã quá 30 ngày kể từ ngày mua",
    };
  }

  // Trường hợp mặc định
  return {
    eligible: false,
    amount: 0,
    reason: "Không đủ điều kiện hoàn tiền",
  };
}

function renderRefundInfo(pkg: any, styles: any) {
  const info = computeRefund(pkg);
  if (!info.eligible) {
    return (
      <Text style={[styles.modalText, { fontWeight: "700", color: "#ef4444" }]}>
        Không đủ điều kiện hoàn tiền ({info.reason})
      </Text>
    );
  }
  return (
    <View style={{ gap: 4 }}>
      <Text
        style={[
          styles.modalText,
          { fontWeight: "800", color: AppColors.primary },
        ]}
      >
        Số tiền dự kiến hoàn: {info.amount.toLocaleString("vi-VN")}₫
      </Text>
      <Text style={styles.modalSubText}>{info.reason}</Text>
    </View>
  );
}

export default function CancelPackageModal({
  visible,
  packageData,
  localStatus,
  cancelDateStr,
  isProcessingCancel,
  onClose,
  onConfirm,
  getStatusText,
}: CancelPackageModalProps) {
  if (!packageData) return null;

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
              Trạng thái: {getStatusText(localStatus)}
            </Text>
            <Text style={styles.modalText}>
              Ngày mua:{" "}
              {new Date(packageData.purchaseDate).toLocaleDateString(
                "vi-VN",
                { day: "2-digit", month: "2-digit", year: "numeric" }
              )}
            </Text>
            {cancelDateStr && (
              <Text style={styles.modalText}>
                Ngày hủy:{" "}
                {new Date(cancelDateStr).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </Text>
            )}
            {renderRefundInfo({ ...packageData, status: localStatus }, styles)}
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
                - Đã đi được một phần và mua dưới 30 ngày: số tiền hoàn = (tổng tiền mua gói / tổng số giờ của gói) × (tổng số giờ của gói - tổng số giờ đã đi được).
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
              onPress={onConfirm}
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
});

