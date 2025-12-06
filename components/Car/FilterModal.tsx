import React from "react";
import { X } from "lucide-react-native";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AppColors } from "@/constants/Colors";

export interface FilterModalProps<T = any> {
  visible: boolean;
  onClose: () => void;
  onApply: () => void;
  onClear: () => void;
  title: string;
  data: T[];
  renderItem: (params: { item: T; index: number }) => React.ReactElement;
  keyExtractor: (item: T, index: number) => string;
  numColumns?: number;
  clearLabel?: string;
  applyLabel?: string;
}

const FilterModal = <T,>({
  visible,
  onClose,
  onApply,
  onClear,
  title,
  data,
  renderItem,
  keyExtractor,
  numColumns = 2,
  clearLabel = "Xóa tất cả",
  applyLabel = "Áp dụng",
}: FilterModalProps<T>) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable
          style={styles.modalContent}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.modalCloseButton}
            >
              <X size={24} color="#64748b" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalScrollContainer}>
            <FlatList
              data={data}
              renderItem={(params) => {
                const item = renderItem(params);
                return (
                  <View style={styles.modalItemWrapper}>
                    {item}
                  </View>
                );
              }}
              keyExtractor={keyExtractor}
              numColumns={numColumns}
              contentContainerStyle={styles.modalList}
              showsVerticalScrollIndicator={false}
              columnWrapperStyle={numColumns > 1 ? styles.modalRow : undefined}
            />
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.modalClearButton}
              onPress={onClear}
            >
              <Text style={styles.modalClearButtonText}>{clearLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalApplyButton}
              onPress={onApply}
            >
              <Text style={styles.modalApplyButtonText}>{applyLabel}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  modalContent: {
    width: "100%",
    maxHeight: "80%",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0f172a",
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#cbd5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  modalScrollContainer: {
    maxHeight: 320,
    marginBottom: 12,
  },
  modalList: {
    paddingBottom: 8,
  },
  modalRow: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
  modalItemWrapper: {
    flex: 1,
    marginHorizontal: 6,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    gap: 12,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  modalClearButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
  },
  modalClearButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
  },
  modalApplyButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: AppColors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  modalApplyButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
});

export default FilterModal;

