import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";

interface AlertButton {
  text: string;
  onPress: () => void;
  style?: "default" | "cancel" | "destructive";
}

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
  cancelText?: string;
  buttons?: AlertButton[];
}

export default function CustomAlert({
  visible,
  title,
  message,
  confirmText = "OK",
  onConfirm,
  onCancel,
  showCancel = false,
  cancelText = "Hủy",
  buttons,
}: CustomAlertProps) {
  // If buttons array is provided, use it instead of default buttons
  const renderButtons = () => {
    if (buttons && buttons.length > 0) {
      return (
        <View style={styles.buttonContainer}>
          {buttons.map((button, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.button,
                button.style === "destructive" && styles.destructiveButton,
                button.style === "cancel" && styles.cancelButton,
                button.style === "default" && styles.confirmButton,
                buttons.length === 1 && styles.singleButton,
              ]}
              onPress={button.onPress}
            >
              <Text
                style={[
                  button.style === "destructive" &&
                    styles.destructiveButtonText,
                  button.style === "cancel" && styles.cancelButtonText,
                  button.style === "default" && styles.confirmButtonText,
                  !button.style && styles.confirmButtonText,
                ]}
              >
                {button.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    // Default button layout
    return (
      <View style={styles.buttonContainer}>
        {showCancel && (
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
          >
            <Text style={styles.cancelButtonText}>{cancelText}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.button, styles.confirmButton]}
          onPress={onConfirm}
        >
          <Text style={styles.confirmButtonText}>{confirmText}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel || onConfirm || (() => {})}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalMessage}>{message}</Text>
          {renderButtons()}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 24,
    marginHorizontal: 20,
    minWidth: 280,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 12,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 16,
    color: "#92929D",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  singleButton: {
    flex: 0,
    minWidth: 100,
  },
  confirmButton: {
    backgroundColor: "#70E000",
  },
  cancelButton: {
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  destructiveButton: {
    backgroundColor: "#FF4444",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666666",
  },
  destructiveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
