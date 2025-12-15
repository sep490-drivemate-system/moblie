import axios, { AxiosError } from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isTokenExpired } from "@/lib/jwt/tokenUtils";
const axiosInstance = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_URL,
    timeout: parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '15000'),
    headers: {
        "Content-Type": "application/json",
    },
});

axiosInstance.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem(
            process.env.EXPO_PUBLIC_STORAGE_TOKEN || '@token'
        );
        if (token) {
            if (isTokenExpired(token)) {
                await AsyncStorage.removeItem(
                    process.env.EXPO_PUBLIC_STORAGE_TOKEN || '@token'
                );
            } else {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        console.error("❌ REQUEST ERROR:", error);
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error: AxiosError) => {
        if (error.response?.status === 401) {
            await AsyncStorage.multiRemove([
                process.env.EXPO_PUBLIC_STORAGE_TOKEN || '@token',
            ]);
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
