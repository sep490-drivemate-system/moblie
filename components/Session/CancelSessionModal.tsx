import React, { useEffect, useState } from "react";
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
  Alert,
} from "react-native";
import { AppColors } from "@/constants/Colors";
import { useViewModel } from "@/viewmodels/shared/BaseViewModel";
import { SessionViewModel } from "@/viewmodels/session/SessionViewModel";

interface CancelSessionModalProps {
  visible: boolean;
  sessionId?: string | null;
  onClose: () => void;
  onCancelled?: () => void;
}

export default function CancelSessionModal({
  visible,
  sessionId,
  onClose,
  onCancelled,
}: CancelSessionModalProps) {
  const [, sessionViewModel] = useViewModel(
    SessionViewModel,
    (state) => state.session
  );
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      setNote("");
      setIsSubmitting(false);
      setErrorMessage(null);
    }
  }, [visible]);

  const handleConfirm = async () => {
    if (!sessionId) {
      Alert.alert("Lỗi", "Không tìm thấy thông tin buổi tập");
      return;
    }

    if (!note.trim()) {
      setErrorMessage("Vui lòng nhập lý do hủy buổi tập lái");
      return;
    }

    try {
      setIsSubmitting(true);
      const success = await sessionViewModel.handleCancelSession(
        sessionId,
        note.trim()
      );

      if (success) {
        Alert.alert("Thành công", "Đã hủy buổi tập lái thành công", [
          {
            text: "OK",
            onPress: () => {
              onClose();
              onCancelled?.();
            },
          },
        ]);
      } else {
        Alert.alert("Lỗi", "Không thể hủy buổi tập. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Error cancelling session:", error);
      Alert.alert("Lỗi", "Không thể hủy buổi tập lái");
    } finally {
      setIsSubmitting(false);
    }
  };

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

              <View style={{ gap: 8 }}>
                <Text style={styles.modalSectionTitle}>Lý do hủy *</Text>
                <TextInput
                  style={styles.noteInput}
                  multiline
                  numberOfLines={4}
                  placeholder="Mô tả lý do bạn muốn hủy buổi tập..."
                  placeholderTextColor="#94a3b8"
                  value={note}
                  onChangeText={(text) => {
                    setNote(text);
                    if (errorMessage) {
                      setErrorMessage(null);
                    }
                  }}
                />
                {errorMessage && (
                  <Text style={styles.errorText}>{errorMessage}</Text>
                )}
              </View>

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
                    isSubmitting && { opacity: 0.8 },
                  ]}
                  disabled={isSubmitting}
                  onPress={handleConfirm}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color={AppColors.white} />
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
  errorText: {
    color: AppColors.error,
    fontSize: 12,
    fontWeight: "600",
  },
});




