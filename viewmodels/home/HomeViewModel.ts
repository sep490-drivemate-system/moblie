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

type HomeState = RootState['home'];

export class HomeViewModel extends BaseViewModel<HomeState> {

    async loadUserInfo(): Promise<void> {
        await this.executeAsync(
            async () => {
                // Giả lập API call để lấy thông tin user
                const token = await AsyncStorage.getItem(process.env.EXPO_PUBLIC_STORAGE_TOKEN || '@token');
                if (token) {
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
            },
            {
                setLoading,
                setError,
                setSuccess
            }
        );
    }

    updateWelcomeMessage(message: string): void {
        this.dispatch(setWelcomeMessage(message));
    }

    // Handler methods để UI components gọi
    async handleLoadUserInfo(): Promise<void> {
        await this.loadUserInfo();
    }

    async handleRefresh(): Promise<void> {
        await this.loadUserInfo();
    }

    handleUpdateWelcomeMessage(): void {
        this.updateWelcomeMessage('Welcome back!');
    }
} 