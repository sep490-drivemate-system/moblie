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
  buttons?: AlertButton[];
}

export default function CustomAlert({
  visible,
  title,
  message,
  buttons,
}: CustomAlertProps) {
  const buttonCount = buttons?.length || 0;

  const renderButtons = () => {
    if (!buttons || buttons.length === 0) {
      return null;
    }

    const containerStyle = [
      styles.buttonContainerBase,
      buttonCount === 2 && styles.rowLayout,
      buttonCount === 1 && styles.singleButtonLayout,
      buttonCount === 2 && styles.twoButtonLayout,
      buttonCount > 2 && styles.columnLayout,
    ];

    return (
      <View style={containerStyle}>
        {buttons.map((button, index) => {
          const buttonStyle = [
            styles.button,
            button.style === "destructive" && styles.destructiveButton,
            button.style === "cancel" && styles.cancelButton,
            (button.style === "default" || !button.style) &&
              styles.confirmButton,

            buttonCount === 1 && styles.singleButton,
            buttonCount === 2 && styles.twoButton,
            buttonCount > 2 && styles.multiButton,
          ];

          const textStyle = [
            styles.buttonText,
            button.style === "destructive" && styles.destructiveButtonText,
            button.style === "cancel" && styles.cancelButtonText,
            (button.style === "default" || !button.style) &&
              styles.confirmButtonText,
          ];

          return (
            <TouchableOpacity
              key={index}
              style={buttonStyle}
              onPress={button.onPress}
            >
              <Text style={textStyle}>{button.text}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={
        buttons && buttons.length > 0
          ? buttons[buttons.length - 1].onPress
          : () => {}
      }
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
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
  modalContent: {
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

  // --- Button Containers ---
  buttonContainerBase: {
    width: 300,
    gap: 12,
  },
  rowLayout: {
    flexDirection: "row",
  },

  singleButtonLayout: {
    width: "100%",
  },
  columnLayout: {
    flexDirection: "column",
  },
  twoButtonLayout: {
    justifyContent: "space-between",
  },

  // --- Individual Buttons ---
  button: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 100,
  },

  singleButton: {
    flex: 0,
    minWidth: 120,
    paddingHorizontal: 30,
    alignSelf: "center",
    alignItems: "center",
  },

  twoButton: {
    flex: 1,
  },

  multiButton: {
    width: "100%",
  },

  // --- Button Color/Style ---
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

  // --- Button Text ---
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  confirmButtonText: {
    color: "#FFFFFF",
  },
  cancelButtonText: {
    color: "#666666",
  },
  destructiveButtonText: {
    color: "#FFFFFF",
  },
});
