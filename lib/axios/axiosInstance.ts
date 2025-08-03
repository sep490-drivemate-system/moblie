import axios, { AxiosError } from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';

const baseURL = process.env.EXPO_PUBLIC_API_URL;
const axiosInstance = axios.create({
    baseURL,
    headers: {
        "Content-Type": "application/json",
    },
});

axiosInstance.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem("access_token");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error("Error getting token from storage:", error);
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
                await AsyncStorage.removeItem("access_token");
                // Note: Navigation should be handled by the component using this axios instance
                console.log("Token expired, user should be redirected to login");
            } catch (storageError) {
                console.error("Error removing token from storage:", storageError);
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
