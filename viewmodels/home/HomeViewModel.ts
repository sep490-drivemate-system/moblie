import { BaseViewModel } from '@/viewmodels/shared/BaseViewModel';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootState } from '@/lib/redux/store';
import {
    setWelcomeMessage,
    setUserInfo,
    setLoading,
    setError,
    setSuccess,
} from '@/features/home/homeSlice';

// Sử dụng Redux state type
type HomeState = RootState['home'];

export class HomeViewModel extends BaseViewModel<HomeState> {

    async loadUserInfo(): Promise<void> {
        await this.executeAsync(
            async () => {
                // Giả lập API call để lấy thông tin user
                const token = await AsyncStorage.getItem('access_token');
                if (token) {
                    // Trong thực tế, bạn sẽ gọi API để lấy thông tin user
                    this.dispatch(setUserInfo({
                        name: 'John Doe',
                        email: 'john@example.com'
                    }));
                    this.dispatch(setWelcomeMessage('Welcome back, John!'));
                }
            },
            () => {
                console.log('User info loaded successfully');
            },
            (error) => {
                console.error('Failed to load user info:', error);
            }
        );
    }

    updateWelcomeMessage(message: string): void {
        this.dispatch(setWelcomeMessage(message));
    }

    async refreshData(): Promise<void> {
        await this.loadUserInfo();
    }
} 