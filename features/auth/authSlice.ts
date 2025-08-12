import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { signIn } from "./authThunk";
import { BaseState } from "@/models/generic/baseState";
import { ISignInRequest } from "@/models/auth/signin";
import { ISignUpRequest } from "@/models/auth/signup";

interface AuthState extends BaseState {
    isAuthenticated: boolean;
    user: {
        email: string;
        name?: string;
    } | null;
    formData: ISignInRequest;
    registerFormData: ISignUpRequest;
}

// ===========================================
// 📋 INITIAL AUTH STATE
// ===========================================
const initialState: AuthState = {
    // 🔐 Authentication status
    isAuthenticated: true, // 🚨 QUAN TRỌNG: Mặc định false, sẽ được set true khi có token
    user: null, // User data sẽ được set sau khi authenticate

    // 📝 Form data cho login
    formData: {
        email: '',
        password: '',
    },

    // 📝 Form data cho register
    registerFormData: {
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    },

    // 🔄 Base state properties
    isLoading: false,
    errorMessage: null,
    isSuccess: false,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        // MVVM Actions
        updateFormData: (state, action: PayloadAction<{ field: keyof ISignInRequest; value: string }>) => {
            const { field, value } = action.payload;
            state.formData[field] = value;
        },
        resetForm: (state) => {
            state.formData = {
                email: '',
                password: '',
            };
        },

        // ===========================================
        // 📝 REGISTER FORM MANAGEMENT
        // ===========================================
        updateRegisterFormData: (state, action: PayloadAction<{ field: keyof ISignUpRequest; value: string }>) => {
            const { field, value } = action.payload;
            state.registerFormData[field] = value;
        },

        resetRegisterForm: (state) => {
            state.registerFormData = {
                name: '',
                email: '',
                password: '',
                confirmPassword: '',
            };
        },
        // ===========================================
        // 👤 SET USER & AUTO-AUTHENTICATE
        // ===========================================
        setUser: (state, action: PayloadAction<{ email: string; name?: string }>) => {
            /**
             * 🎯 Khi set user data:
             * 1. Lưu user info vào state
             * 2. TỰ ĐỘNG set isAuthenticated = true
             * 
             * ➡️ Điều này trigger useEffect trong _layout.tsx để navigate
             */
            state.user = action.payload;
            state.isAuthenticated = true; // 🔐 Auto-authenticate khi có user data
            console.log('🔄 setUser called → isAuthenticated = true, user =', action.payload);
        },

        // ===========================================
        // 🔐 SET AUTHENTICATION STATUS MANUALLY
        // ===========================================
        setAuthenticated: (state, action: PayloadAction<boolean>) => {
            /**
             * 🎯 Manual override cho authentication status
             * Dùng khi cần force logout hoặc set authenticated mà không có user data
             */
            state.isAuthenticated = action.payload;
            console.log('🔄 setAuthenticated called → isAuthenticated =', action.payload);
        },
        clearError: (state) => {
            state.errorMessage = null;
        },
        logout: (state) => {
            state.isAuthenticated = false;
            state.user = null;
            state.formData = {
                email: '',
                password: '',
            };
        },
        // Generic state actions
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.errorMessage = action.payload;
        },
        setSuccess: (state, action: PayloadAction<boolean>) => {
            state.isSuccess = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(signIn.pending, (state) => {
                state.isLoading = true;
                state.isSuccess = false;
                state.errorMessage = null;
            })
            .addCase(signIn.fulfilled, (state) => {
                state.isAuthenticated = true;
                state.isLoading = false;
                state.isSuccess = true;
            })
            .addCase(signIn.rejected, (state, action) => {
                state.isLoading = false;
                state.errorMessage = action.payload || action.error?.message || "Đăng nhập thất bại";
            });
    },
});

export const {
    updateFormData,
    resetForm,
    updateRegisterFormData, // Export new register actions
    resetRegisterForm,
    setUser,
    setAuthenticated,
    clearError,
    logout,
    setLoading,
    setError,
    setSuccess
} = authSlice.actions;

export default authSlice.reducer;