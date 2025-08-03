import React, { useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthViewModel } from '@/viewmodels/auth/AuthViewModel';
import { useViewModel } from '@/viewmodels/shared/BaseViewModel';
import { RootState } from '@/lib/redux/store';

// Redux selector cho auth state
const authSelector = (state: RootState) => state.auth;

export default function LoginScreen() {
    const router = useRouter();
    const [authState, authViewModel] = useViewModel(AuthViewModel, authSelector);

    useEffect(() => {
        // Kiểm tra trạng thái đăng nhập khi component mount
        authViewModel.checkAuthStatus();
    }, []);

    useEffect(() => {
        // Nếu đã đăng nhập, chuyển đến trang chính
        if (authState.isAuthenticated) {
            router.replace('/(tabs)' as any);
        }
    }, [authState.isAuthenticated]);

    const handleLogin = async () => {
        const success = await authViewModel.login();
        if (success) {
            router.replace('/(tabs)' as any);
        }
    };

    const handleInputChange = (field: 'email' | 'password', value: string) => {
        authViewModel.updateFormData(field, value);
    };

    return (
        <View style={styles.container}>
            <View style={styles.formContainer}>
                <Text style={styles.title}>Login</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={authState.formData.email}
                    onChangeText={(text) => handleInputChange('email', text)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    value={authState.formData.password}
                    onChangeText={(text) => handleInputChange('password', text)}
                    secureTextEntry
                />

                {authState.errorMessage && (
                    <Text style={styles.errorText}>{authState.errorMessage}</Text>
                )}

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleLogin}
                    disabled={authState.isLoading}
                >
                    {authState.isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Login</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.resetButton}
                    onPress={() => authViewModel.resetForm()}
                >
                    <Text style={styles.resetButtonText}>Reset Form</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        padding: 20,
    },
    formContainer: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 30,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        padding: 15,
        marginBottom: 15,
        fontSize: 16,
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    errorText: {
        color: '#ff0000',
        textAlign: 'center',
        marginBottom: 10,
    },
    resetButton: {
        backgroundColor: '#6c757d',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
    },
    resetButtonText: {
        color: '#fff',
        fontSize: 14,
    },
}); 