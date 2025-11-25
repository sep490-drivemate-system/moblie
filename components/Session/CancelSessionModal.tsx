import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { AppColors } from "@/constants/Colors";

interface CancelSessionModalProps {
  visible: boolean;
  cancelNote: string;
  selectedReasons: string[];
  isCancelling: boolean;
  canCancel: boolean;
  onClose: () => void;
  onNoteChange: (text: string) => void;
  onToggleReason: (reason: string) => void;
  onConfirm: () => void;
}

export default function CancelSessionModal({
  visible,
  cancelNote,
  isCancelling,
  canCancel,
  onClose,
  onNoteChange,
  onConfirm,
}: CancelSessionModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={() => {
        Keyboard.dismiss();
        onClose();
      }}
    >
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
        }}
      >
        <View style={styles.modalBackdrop}>
          <TouchableWithoutFeedback onPress={() => { }}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Xác nhận hủy buổi tập</Text>

              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Thời điểm hủy</Text>
                <Text style={styles.modalValue}>
                  {new Date().toLocaleString("vi-VN")}
                </Text>
              </View>

              {canCancel ? (
                <View
                  style={[styles.noticeBadge, { backgroundColor: "#dcfce7" }]}
                >
                  <Text style={[styles.noticeText, { color: "#16a34a" }]}>
                    Có thể hủy: Trước ít nhất 12 giờ.
                  </Text>
                </View>
              ) : (
                <View
                  style={[styles.noticeBadge, { backgroundColor: "#fee2e2" }]}
                >
                  <Text style={[styles.noticeText, { color: "#dc2626" }]}>
                    Không thể hủy: Còn dưới 12 giờ trước giờ bắt đầu.
                  </Text>
                </View>
              )}

              <Text style={styles.modalSectionTitle}>Lý do hủy lịch</Text>



              <Text style={styles.modalSectionTitle}>Ghi chú chi tiết</Text>
              <TextInput
                style={styles.noteInput}
                placeholder="Nhập lý do chi tiết để hủy buổi tập lái..."
                placeholderTextColor="#9ca3af"
                value={cancelNote}
                onChangeText={onNoteChange}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={onClose}
                >
                  <Text style={styles.modalCancelBtnText}>Đóng</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalConfirmBtn,
                    (!cancelNote.trim() || isCancelling) && { opacity: 0.5 },
                  ]}
                  disabled={!cancelNote.trim() || isCancelling}
                  onPress={onConfirm}
                >
                  {isCancelling ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.modalConfirmBtnText}>
                      Xác nhận hủy
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 20,
    justifyContent: "center",
  },
  modalCard: {
    backgroundColor: AppColors.white,
    borderRadius: 16,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 10,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    marginTop: 10,
    marginBottom: 8,
  },
  modalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  modalLabel: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "600",
  },
  modalValue: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "700",
    marginLeft: 8,
  },
  noticeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  noticeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  reasonList: {
    gap: 10,
    marginBottom: 12,
  },
  reasonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#cbd5e1",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: AppColors.white,
  },
  checkboxSelected: {
    backgroundColor: "#22c55e",
    borderColor: "#22c55e",
  },
  checkboxTick: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 16,
  },
  reasonText: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#e2e8f0",
  },
  modalCancelBtnText: {
    color: "#1f2937",
    fontSize: 14,
    fontWeight: "800",
  },
  modalConfirmBtn: {
    flex: 1,
    backgroundColor: "#ef4444",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalConfirmBtnText: {
    color: AppColors.white,
    fontSize: 14,
    fontWeight: "800",
  },
  noteInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: "#1f2937",
    backgroundColor: "#fff",
    minHeight: 80,
    marginBottom: 16,
  },
});




