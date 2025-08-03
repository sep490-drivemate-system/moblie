import { BaseViewModel } from '@/viewmodels/shared/BaseViewModel';
import { ISignInRequest } from '@/models/auth/signin';
import { signIn } from '@/features/auth/authThunk';
import {
    updateFormData,
    resetForm,
    setUser,
    clearError,
    logout,
    setLoading,
    setError,
    setSuccess
} from '@/features/auth/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootState } from '@/lib/redux/store';

// Sử dụng Redux state type thay vì AuthState interface
type AuthState = RootState['auth'];

export class AuthViewModel extends BaseViewModel<AuthState> {

    updateFormData(field: keyof ISignInRequest, value: string): void {
        this.dispatch(updateFormData({ field, value }));
    }

    async login(): Promise<boolean> {
        return await this.executeAsync(
            async () => {
                const currentState = this.getState(this.dispatch);
                const result = await this.dispatch(signIn(currentState.formData)).unwrap();

                // Lưu token vào AsyncStorage
                if (result?.data?.accessToken) {
                    await AsyncStorage.setItem('access_token', result.data.accessToken);
                    await AsyncStorage.setItem('refresh_token', result.data.refreshToken);
                }

                // Cập nhật user info
                this.dispatch(setUser({
                    email: currentState.formData.email,
                }));

                return true;
            },
            () => {
                console.log('Login successful');
            },
            (error) => {
                console.error('Login failed:', error);
            }
        ) ?? false;
    }

    async logout(): Promise<void> {
        await this.executeAsync(
            async () => {
                // Xóa tokens
                await AsyncStorage.removeItem('access_token');
                await AsyncStorage.removeItem('refresh_token');

                // Reset state
                this.dispatch(logout());
            }
        );
    }

    async checkAuthStatus(): Promise<void> {
        await this.executeAsync(
            async () => {
                const token = await AsyncStorage.getItem('access_token');
                if (token) {
                    this.dispatch(setUser({
                        email: 'user@example.com', // Có thể lấy từ API
                    }));
                }
            }
        );
    }

    clearError(): void {
        this.dispatch(clearError());
    }

    resetForm(): void {
        this.dispatch(resetForm());
    }
} 