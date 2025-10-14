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
    Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { AuthViewModel } from '@/viewmodels/auth/AuthViewModel';
import { useViewModel } from '@/viewmodels/shared/BaseViewModel';
import { RootState } from '@/lib/redux/store';

const authSelector = (state: RootState) => state.auth;

export default function SignUpScreen() {
    const router = useRouter();
    const [authState, authViewModel] = useViewModel(AuthViewModel, authSelector);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        authViewModel.setNavigationCallback((route: string) => {
            router.replace(route as any);
        });
    }, [authViewModel, router]);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
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
                    {/* Card Container */}
                    <View style={styles.card}>
                        <View style={styles.cardContent}>
                            {/* Header */}
                            <View style={styles.header}>
                                <Text style={styles.title}>
                                    Create Account
                                </Text>
                                <Text style={styles.subtitle}>
                                    Sign up to get started
                                </Text>
                            </View>

                            {/* Form Section */}
                            <View style={styles.form}>
                                {/* Name Input */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>
                                        Full Name
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter your full name"
                                        value={authState.registerFormData?.name || ''}
                                        onChangeText={(text: string) => authViewModel.handleRegisterInputChange('name', text)}
                                        autoComplete="name"
                                        editable={!authState.isLoading}
                                        placeholderTextColor="#9ca3af"
                                    />
                                </View>

                                {/* Email Input */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>
                                        Email Address
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter your email"
                                        value={authState.registerFormData?.email || ''}
                                        onChangeText={(text: string) => authViewModel.handleRegisterInputChange('email', text)}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoComplete="email"
                                        editable={!authState.isLoading}
                                        placeholderTextColor="#9ca3af"
                                    />
                                </View>

                                {/* Password Input */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>
                                        Password
                                    </Text>
                                    <View style={styles.passwordContainer}>
                                        <TextInput
                                            style={styles.passwordInput}
                                            placeholder="Enter your password"
                                            value={authState.registerFormData?.password || ''}
                                            onChangeText={(text: string) => authViewModel.handleRegisterInputChange('password', text)}
                                            secureTextEntry={!showPassword}
                                            autoComplete="password-new"
                                            editable={!authState.isLoading}
                                            placeholderTextColor="#9ca3af"
                                        />
                                        <TouchableOpacity 
                                            onPress={togglePasswordVisibility}
                                            style={styles.passwordToggle}
                                        >
                                            <Text style={styles.passwordToggleText}>
                                                {showPassword ? '🙈' : '👁️'}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Confirm Password Input */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>
                                        Confirm Password
                                    </Text>
                                    <View style={styles.passwordContainer}>
                                        <TextInput
                                            style={styles.passwordInput}
                                            placeholder="Confirm your password"
                                            value={authState.registerFormData?.confirmPassword || ''}
                                            onChangeText={(text: string) => authViewModel.handleRegisterInputChange('confirmPassword', text)}
                                            secureTextEntry={!showConfirmPassword}
                                            autoComplete="password-new"
                                            editable={!authState.isLoading}
                                            placeholderTextColor="#9ca3af"
                                        />
                                        <TouchableOpacity 
                                            onPress={toggleConfirmPasswordVisibility}
                                            style={styles.passwordToggle}
                                        >
                                            <Text style={styles.passwordToggleText}>
                                                {showConfirmPassword ? '🙈' : '👁️'}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Register Button */}
                                <TouchableOpacity
                                    style={[
                                        styles.registerButton,
                                        authState.isLoading && styles.registerButtonDisabled
                                    ]}
                                    onPress={authViewModel.handleRegister}
                                    disabled={authState.isLoading}
                                >
                                    {authState.isLoading ? (
                                        <View style={styles.loadingContainer}>
                                            <ActivityIndicator size="small" color="white" style={styles.spinner} />
                                            <Text style={styles.registerButtonText}>
                                                Creating account...
                                            </Text>
                                        </View>
                                    ) : (
                                        <Text style={styles.registerButtonText}>
                                            Create Account
                                        </Text>
                                    )}
                                </TouchableOpacity>

                                {/* Sign In Link */}
                                <TouchableOpacity
                                    onPress={() => router.push('./signin')}
                                    disabled={authState.isLoading}
                                    style={styles.signInLink}
                                >
                                    <Text style={styles.signInText}>
                                        Already have an account?{' '}
                                        <Text style={styles.signInTextBold}>
                                            Sign in
                                        </Text>
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingVertical: 20,
    },
    formContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
        maxWidth: 400,
        width: '100%',
        alignSelf: 'center',
    },
    cardContent: {
        padding: 32,
        paddingBottom: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1f2937',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
    },
    form: {
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginLeft: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 12,
        backgroundColor: '#f9fafb',
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#1f2937',
    },
    passwordContainer: {
        position: 'relative',
    },
    passwordInput: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 12,
        backgroundColor: '#f9fafb',
        paddingHorizontal: 16,
        paddingVertical: 14,
        paddingRight: 50,
        fontSize: 16,
        color: '#1f2937',
    },
    passwordToggle: {
        position: 'absolute',
        right: 16,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
    },
    passwordToggleText: {
        fontSize: 16,
    },
    registerButton: {
        backgroundColor: '#10b981',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    registerButtonDisabled: {
        opacity: 0.7,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    spinner: {
        marginRight: 8,
    },
    registerButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    signInLink: {
        alignSelf: 'center',
        marginTop: 16,
    },
    signInText: {
        color: '#6b7280',
        fontSize: 14,
        textAlign: 'center',
    },
    signInTextBold: {
        color: '#3b82f6',
        fontWeight: '600',
    },
});
