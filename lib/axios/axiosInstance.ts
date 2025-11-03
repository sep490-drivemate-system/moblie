import axios, { AxiosError } from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
const axiosInstance = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_URL,
    timeout: parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '30000'),
    headers: {
        "Content-Type": "application/json",
    },
});

axiosInstance.interceptors.request.use(
    async (config) => {
        console.log("🚀 REQUEST CONFIG baseURL:", config.baseURL);
        console.log("🚀 REQUEST CONFIG url:", config.url);
        console.log("🚀 REQUEST CONFIG method:", config.method);
        console.log("🚀 REQUEST CONFIG headers:", config.headers);
        const token = await AsyncStorage.getItem(
            process.env.EXPO_PUBLIC_STORAGE_TOKEN || '@token'
        );
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
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
