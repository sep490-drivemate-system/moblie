import axios, { AxiosError } from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from '@/config/env';
const axiosInstance = axios.create({
    baseURL: ENV.API_URL,
    timeout: ENV.API_TIMEOUT,
    headers: {
        "Content-Type": "application/json",
    },
});

axiosInstance.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem(ENV.STORAGE_KEYS.ACCESS_TOKEN);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            if (ENV.ENABLE_LOGGING) {
                console.error("Error getting token from storage:", error);
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        if (error.response?.status === 401) {
            try {
                // Clear all auth-related storage
                await AsyncStorage.multiRemove([
                    ENV.STORAGE_KEYS.ACCESS_TOKEN,
                    ENV.STORAGE_KEYS.REFRESH_TOKEN,
                    ENV.STORAGE_KEYS.USER_DATA
                ]);

                if (ENV.ENABLE_LOGGING) {
                    console.log("Token expired, user should be redirected to login");
                }
            } catch (storageError) {
                if (ENV.ENABLE_LOGGING) {
                    console.error("Error removing token from storage:", storageError);
                }
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
