import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { signIn } from "./authThunk";
import { BaseState } from "@/models/generic/baseState";
import { ISignInRequest } from "@/models/auth/signin";

interface AuthState extends BaseState {
    isAuthenticated: boolean;
    user: {
        email: string;
        name?: string;
    } | null;
    formData: ISignInRequest;
}

const initialState: AuthState = {
    isAuthenticated: false,
    user: null,
    formData: {
        email: '',
        password: '',
    },
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
        setUser: (state, action: PayloadAction<{ email: string; name?: string }>) => {
            state.user = action.payload;
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
                state.errorMessage = action.error?.message || "Đăng nhập thất bại";
            });
    },
});

export const {
    updateFormData,
    resetForm,
    setUser,
    clearError,
    logout,
    setLoading,
    setError,
    setSuccess
} = authSlice.actions;

export default authSlice.reducer;