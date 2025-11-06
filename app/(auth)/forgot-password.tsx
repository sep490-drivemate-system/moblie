import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    SafeAreaView,
    ScrollView,
    Dimensions,
    ActivityIndicator,
    Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { X } from "lucide-react-native";
import { Video, ResizeMode } from "expo-av";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { RootState } from "@/lib/redux/store";
import { AuthViewModel } from "@/viewmodels/auth/AuthViewModel";
import { IForgotPasswordRequest } from "@/models/auth/forgotPassword";

const { width, height } = Dimensions.get("window");

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const authState = useAppSelector((state: RootState) => state.auth);
    const { forgotPasswordFormData, isLoading, errorMessage, isSuccess } = authState;

    const [authViewModel] = useState(() => new AuthViewModel(
        dispatch,
        () => {
            const store = require('@/lib/redux/store').store;
            return store.getState().auth;
        }
    ));

    const handleInputChange = (field: keyof IForgotPasswordRequest, value: string) => {
        authViewModel.handleForgotPasswordInputChange(field, value);
    };

    const handleSubmit = async () => {
        await authViewModel.handleForgotPassword();
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Video Background */}
            <View style={styles.videoContainer}>
                <Video
                    source={require("@/assets/videos/background_intro.mp4")}
                    style={styles.backgroundVideo}
                    shouldPlay
                    isLooping
                    isMuted
                    resizeMode={ResizeMode.COVER}
                />
                <View style={styles.videoOverlay} />
            </View>

            {/* Form Section */}
            <View style={styles.formSection}>
                {/* Close Button */}
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => router.back()}
                >
                    <X size={24} color="#6b7280" />
                </TouchableOpacity>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Title */}
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>Quên mật khẩu</Text>
                        <Text style={styles.subtitle}>
                            Nhập email hoặc số điện thoại để nhận{" "}
                            <Text style={styles.highlightText}>mã xác nhận</Text> đặt lại mật khẩu
                        </Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        {/* Email/Phone Input */}
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Nhập email hoặc số điện thoại"
                                placeholderTextColor="#9ca3af"
                                value={forgotPasswordFormData.emailOrPhone}
                                onChangeText={(value) => handleInputChange('emailOrPhone', value)}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>

                        {/* Error Message */}
                        {errorMessage && (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorText}>{errorMessage}</Text>
                            </View>
                        )}

                        {/* Submit Button */}
                        <TouchableOpacity
                            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                            onPress={handleSubmit}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" size="small" />
                            ) : (
                                <Text style={styles.submitButtonText}>Gửi yêu cầu</Text>
                            )}
                        </TouchableOpacity>

                        {/* Back to Sign In */}
                        <View style={styles.backToSignInContainer}>
                            <TouchableOpacity onPress={() => router.back()}>
                                <Text style={styles.backToSignInText}>
                                    Quay lại đăng nhập
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ffffff",
    },
    videoContainer: {
        height: height * 0.4,
        position: "relative",
    },
    backgroundVideo: {
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        width: "100%",
        height: "100%",
    },
    videoOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        backgroundColor: "rgba(0, 0, 0, 0.3)",
    },
    formSection: {
        flex: 1,
        backgroundColor: "#ffffff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        marginTop: -20,
        zIndex: 1,
        position: "relative",
    },
    closeButton: {
        position: "absolute",
        top: 20,
        right: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#f3f4f6",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 50,
    },
    titleContainer: {
        paddingHorizontal: 20,
        paddingTop: 40,
        marginBottom: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#70E000",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: "#6b7280",
        lineHeight: 24,
    },
    highlightText: {
        color: "#70E000",
        fontWeight: "bold",
    },
    form: {
        paddingHorizontal: 20,
    },
    inputContainer: {
        marginBottom: 20,
        position: "relative",
    },
    input: {
        backgroundColor: "#ffffff",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: "#000",
        borderWidth: 1,
        borderColor: "#70E000",
    },
    errorContainer: {
        backgroundColor: "#fef2f2",
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#fecaca",
    },
    errorText: {
        color: "#dc2626",
        fontSize: 14,
        textAlign: "center",
        fontWeight: "500",
    },
    submitButton: {
        backgroundColor: "#70E000",
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 16,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 24,
    },
    submitButtonDisabled: {
        backgroundColor: "#9ca3af",
        opacity: 0.7,
    },
    submitButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
    backToSignInContainer: {
        alignItems: "center",
        marginTop: 20,
    },
    backToSignInText: {
        fontSize: 14,
        color: "#70E000",
        fontWeight: "600",
    },
});

