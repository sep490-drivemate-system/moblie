import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    ActivityIndicator,
    Alert,
    Dimensions,
    StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AuthViewModel } from '@/viewmodels/auth/AuthViewModel';
import { useViewModel } from '@/viewmodels/shared/BaseViewModel';
import { RootState } from '@/lib/redux/store';

const authSelector = (state: RootState) => state.auth;

export default function SignInScreen() {
    const router = useRouter();
    const [authState, authViewModel] = useViewModel(AuthViewModel, authSelector);
    const [showPassword, setShowPassword] = useState(false);


    useEffect(() => {
        authViewModel.setNavigationCallback((route: string) => {
            router.replace(route as any);
        });
    }, [authViewModel, router]);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const showErrorAlert = () => {
        if (authState.errorMessage) {
            Alert.alert('Error', authState.errorMessage);
        }
    };

    useEffect(() => {
        showErrorAlert();
    }, [authState.errorMessage]);

    return (
        <>
            <StatusBar barStyle="light-content" backgroundColor="#667eea" />
            <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.gradientBackground}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <KeyboardAvoidingView
                    style={styles.container}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.formContainer}>
                            {/* Logo/Brand Section - Simplified */}
                            <View style={styles.brandSection}>
                                <Text style={styles.brandTitle}>DriveMate</Text>
                            </View>

                            {/* Card Container */}
                            <View style={styles.card}>
                                <View style={styles.cardContent}>
                                    {/* Header - Simplified */}
                                    <View style={styles.header}>
                                        <Text style={styles.title}>
                                            Sign In
                                        </Text>
                                    </View>

                                    {/* Form Section */}
                                    <View style={styles.form}>
                                        {/* Email Input */}
                                        <View style={styles.inputGroup}>
                                            <Text style={styles.label}>
                                                Email Address or Phone number
                                            </Text>
                                            <View style={styles.inputContainer}>
                                                <Ionicons
                                                    name="mail-outline"
                                                    size={20}
                                                    color="#9ca3af"
                                                    style={styles.inputIcon}
                                                />
                                                <TextInput
                                                    style={styles.input}
                                                    placeholder="Enter your email"
                                                    value={authState.formData.email}
                                                    onChangeText={(text: string) => authViewModel.handleInputChange('email', text)}
                                                    keyboardType="email-address"
                                                    autoCapitalize="none"
                                                    autoComplete="email"
                                                    editable={!authState.isLoading}
                                                    placeholderTextColor="#9ca3af"
                                                />
                                            </View>
                                        </View>

                                        {/* Password Input */}
                                        <View style={styles.inputGroup}>
                                            <Text style={styles.label}>
                                                Password
                                            </Text>
                                            <View style={styles.inputContainer}>
                                                <Ionicons
                                                    name="lock-closed-outline"
                                                    size={20}
                                                    color="#9ca3af"
                                                    style={styles.inputIcon}
                                                />
                                                <TextInput
                                                    style={styles.passwordInput}
                                                    placeholder="Enter your password"
                                                    value={authState.formData.password}
                                                    onChangeText={(text: string) => authViewModel.handleInputChange('password', text)}
                                                    secureTextEntry={!showPassword}
                                                    autoComplete="password"
                                                    editable={!authState.isLoading}
                                                    placeholderTextColor="#9ca3af"
                                                />
                                                <TouchableOpacity
                                                    onPress={togglePasswordVisibility}
                                                    style={styles.passwordToggle}
                                                    activeOpacity={0.7}
                                                >
                                                    <Ionicons
                                                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                                        size={20}
                                                        color="#667eea"
                                                    />
                                                </TouchableOpacity>
                                            </View>
                                        </View>

                                        {/* Login Button */}
                                        <LinearGradient
                                            colors={authState.isLoading ? ['#9ca3af', '#6b7280'] : ['#667eea', '#764ba2']}
                                            style={styles.loginButtonGradient}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                        >
                                            <TouchableOpacity
                                                style={styles.loginButton}
                                                onPress={authViewModel.handleLogin}
                                                disabled={authState.isLoading}
                                                activeOpacity={0.8}
                                            >
                                                {authState.isLoading ? (
                                                    <View style={styles.loadingContainer}>
                                                        <ActivityIndicator size="small" color="white" style={styles.spinner} />
                                                        <Text style={styles.loginButtonText}>
                                                            Signing in...
                                                        </Text>
                                                    </View>
                                                ) : (
                                                  
                                                        <View style={styles.buttonContent}>
                                                            <Text style={styles.loginButtonText}>
                                                                Sign In
                                                            </Text>
                                                        </View>


                                                )}
                                            </TouchableOpacity>
                                        </LinearGradient>

                                        {/* Forgot Password Link */}
                                        <TouchableOpacity style={styles.forgotPassword} activeOpacity={0.7}>
                                            <Text style={styles.forgotPasswordText}>
                                                Forgot password?
                                            </Text>
                                        </TouchableOpacity>

                                        {/* Register Link */}
                                        <TouchableOpacity
                                            onPress={() => router.push('./signup')}
                                            disabled={authState.isLoading}
                                            style={styles.registerLink}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={styles.registerText}>
                                                Don't have an account?{' '}
                                                <Text style={styles.registerTextBold}>
                                                    Sign up here
                                                </Text>
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </LinearGradient>
        </>
    );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    gradientBackground: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingVertical: 0,
        minHeight: height,
        justifyContent: 'center',
    },
    formContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    // Brand Section - Simplified
    brandSection: {
        alignItems: 'center',
        marginBottom: 50,
        paddingTop: 80,
    },
    brandTitle: {
        fontSize: 36,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 8,
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
        letterSpacing: 1,
    },
    brandSubtitle: {
        fontSize: 18,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
        fontWeight: '400',
    },
    // Card Styles
    card: {
        backgroundColor: 'white',
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 15,
        maxWidth: 380,
        width: '100%',
        alignSelf: 'center',
        marginBottom: 60,
    },
    cardContent: {
        padding: 28,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1f2937',
        textAlign: 'center',
    },
    // Form Styles
    form: {
        gap: 24,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        color: '#374151',
        marginLeft: 4,
        marginBottom: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        backgroundColor: 'white',
        paddingHorizontal: 16,
        paddingVertical: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    inputIcon: {
        marginRight: 12,
        opacity: 0.6,
    },
    input: {
        flex: 1,
        paddingVertical: 16,
        fontSize: 16,
        color: '#1f2937',
        fontWeight: '400',
    },
    passwordInput: {
        flex: 1,
        paddingVertical: 16,
        fontSize: 16,
        color: '#1f2937',
        fontWeight: '400',
    },
    passwordToggle: {
        padding: 8,
        marginLeft: 4,
    },
    // Button Styles
    loginButtonGradient: {
        borderRadius: 12,
        marginTop: 20,
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
    },
    loginButton: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    spinner: {
        marginRight: 8,
    },
    loginButtonText: {
        color: 'white',
        fontSize: 17,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    // Forgot Password
    forgotPassword: {
        alignSelf: 'flex-end',
        marginTop: 8,
        marginBottom: 8,
    },
    forgotPasswordText: {
        color: '#667eea',
        fontSize: 14,
        fontWeight: '500',
    },
    // Register Link
    registerLink: {
        alignSelf: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    registerText: {
        color: '#6b7280',
        fontSize: 15,
        textAlign: 'center',
        fontWeight: '500',
    },
    registerTextBold: {
        color: '#667eea',
        fontWeight: 'bold',
    },
    // Development Reset Button
    resetButton: {
        marginTop: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignItems: 'center',
        backgroundColor: '#f9fafb',
    },
    resetButtonText: {
        color: '#6b7280',
        fontSize: 14,
        fontWeight: '600',
    },
});
