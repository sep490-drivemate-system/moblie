import React from "react";
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    GestureResponderEvent,
} from "react-native";
import {
    CheckCircle2,
    AlertTriangle,
    Info,
    XCircle,
    X,
} from "lucide-react-native";
import { AppColors } from "@/constants/Colors";

export enum AlertVariant {
    Success = "success",
    Warning = "warning",
    Error = "error",
    Info = "info",
}

const VARIANT_CONFIG: Record<
    AlertVariant,
    {
        icon: React.ComponentType<any>;
        accent: string;
        accentBg: string;
        titleColor: string;
    }
> = {
    [AlertVariant.Success]: {
        icon: CheckCircle2,
        accent: "#16a34a",
        accentBg: "#dcfce7",
        titleColor: "#14532d",
    },
    [AlertVariant.Warning]: {
        icon: AlertTriangle,
        accent: "#f97316",
        accentBg: "#fff7ed",
        titleColor: "#7c2d12",
    },
    [AlertVariant.Error]: {
        icon: XCircle,
        accent: "#ef4444",
        accentBg: "#fee2e2",
        titleColor: "#7f1d1d",
    },
    [AlertVariant.Info]: {
        icon: Info,
        accent: "#0ea5e9",
        accentBg: "#e0f2fe",
        titleColor: "#0c4a6e",
    },
};

type ButtonVariant = "primary" | "secondary" | "ghost";

interface AlertButton {
    label: string;
    onPress?: (event: GestureResponderEvent) => void;
    variant?: ButtonVariant;
}

interface AppAlertProps {
    visible: boolean;
    title?: string;
    message: string;
    variant?: AlertVariant;
    primaryButton?: AlertButton;
    secondaryButton?: AlertButton;
    onDismiss?: () => void;
    closable?: boolean;
}

export function AppAlert({
    visible,
    title,
    message,
    variant = AlertVariant.Info,
    primaryButton,
    secondaryButton,
    onDismiss,
    closable = true,
}: AppAlertProps) {
    const config = VARIANT_CONFIG[variant];
    const Icon = config.icon;

    const renderButton = (
        button: AlertButton,
        type: "primary" | "secondary"
    ) => {
        const variantStyle =
            button.variant === "ghost"
                ? styles.ghostButton
                : button.variant === "secondary"
                    ? styles.secondaryButton
                    : styles.primaryButton;

        const textStyle =
            button.variant === "ghost"
                ? styles.ghostButtonText
                : button.variant === "secondary"
                    ? styles.secondaryButtonText
                    : styles.primaryButtonText;

        return (
            <TouchableOpacity
                key={type}
                style={[styles.buttonBase, variantStyle]}
                onPress={(event) => {
                    button.onPress?.(event);
                    if (onDismiss) {
                        onDismiss();
                    }
                }}
            >
                <Text style={textStyle}>{button.label}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onDismiss}
        >
            <View style={styles.overlay}>
                <View style={[styles.card, { borderColor: config.accentBg }]}>
                    <View style={[styles.iconWrapper, { backgroundColor: config.accentBg }]}>
                        <Icon size={28} color={config.accent} strokeWidth={2.5} />
                    </View>

                    {closable && (
                        <TouchableOpacity style={styles.closeButton} onPress={onDismiss}>
                            <X size={16} color="#94a3b8" />
                        </TouchableOpacity>
                    )}

                    {title ? (
                        <Text
                            style={[
                                styles.title,
                                { color: config.titleColor },
                            ]}
                        >
                            {title}
                        </Text>
                    ) : null}
                    <Text style={styles.message}>{message}</Text>

                    {(primaryButton || secondaryButton) && (
                        <View style={styles.buttonRow}>
                            {secondaryButton && renderButton(secondaryButton, "secondary")}
                            {primaryButton && renderButton(primaryButton, "primary")}
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(15, 23, 42, 0.45)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
    },
    card: {
        width: "100%",
        maxWidth: 360,
        backgroundColor: AppColors.white,
        borderRadius: 16,
        paddingHorizontal: 20,
        paddingVertical: 24,
        borderWidth: 1,
    },
    iconWrapper: {
        alignSelf: "center",
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
    },
    closeButton: {
        position: "absolute",
        top: 16,
        right: 16,
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f1f5f9",
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 8,
    },
    message: {
        fontSize: 15,
        color: "#475569",
        textAlign: "center",
        lineHeight: 22,
        marginBottom: 20,
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 12,
    },
    buttonBase: {
        minWidth: 120,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: "center",
        paddingHorizontal: 16,
    },
    primaryButton: {
        backgroundColor: AppColors.primary,
    },
    primaryButtonText: {
        color: "#fff",
        fontWeight: "700",
    },
    secondaryButton: {
        backgroundColor: "#e2e8f0",
    },
    secondaryButtonText: {
        color: "#0f172a",
        fontWeight: "600",
    },
    ghostButton: {
        backgroundColor: "transparent",
    },
    ghostButtonText: {
        color: "#0f172a",
        fontWeight: "600",
    },
});

export type { AppAlertProps, AlertButton };

