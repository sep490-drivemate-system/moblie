import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserRole } from "@/models/enum/UserRole.enum";
import { signIn } from "./authThunk";
import { BaseState } from "@/models/generic/baseState";
import { ISignInRequest } from "@/models/auth/signin";
import { ISignUpRequest } from "@/models/auth/signup";

interface AuthState extends BaseState {
  isAuthenticated: boolean;
  user: {
    email: string;
    name?: string;
    role?: UserRole;
  } | null;
  formData: ISignInRequest;
  registerFormData: ISignUpRequest;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,

  formData: {
    email: "",
    password: "",
  },

  registerFormData: {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
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
    updateFormData: (
      state,
      action: PayloadAction<{ field: keyof ISignInRequest; value: string }>
    ) => {
      const { field, value } = action.payload;
      state.formData[field] = value;
    },
    resetForm: (state) => {
      state.formData = {
        email: "",
        password: "",
      };
    },

    updateRegisterFormData: (
      state,
      action: PayloadAction<{ field: keyof ISignUpRequest; value: string }>
    ) => {
      const { field, value } = action.payload;
      state.registerFormData[field] = value;
    },

    resetRegisterForm: (state) => {
      state.registerFormData = {
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      };
    },
    setUser: (
      state,
      action: PayloadAction<{ email: string; name?: string; role?: UserRole }>
    ) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      console.log(
        "🔄 setUser called → isAuthenticated = true, user =",
        action.payload
      );
    },
    setUserRole: (state, action: PayloadAction<UserRole>) => {
      if (!state.user) {
        state.user = { email: "", role: action.payload };
      } else {
        state.user.role = action.payload;
      }
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
      console.log(
        "🔄 setAuthenticated called → isAuthenticated =",
        action.payload
      );
    },
    clearError: (state) => {
      state.errorMessage = null;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.formData = {
        email: "",
        password: "",
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
        state.errorMessage =
          action.payload || action.error?.message || "Đăng nhập thất bại";
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
  setUserRole,
  clearError,
  logout,
  setLoading,
  setError,
  setSuccess,
} = authSlice.actions;

export default authSlice.reducer;
