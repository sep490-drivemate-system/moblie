import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserRole } from "@/models/enum/UserRole.enum";
import { signIn } from "./authThunk";
import { BaseState } from "@/models/generic/baseState";
import { ISignInRequest } from "@/models/auth/signin";
import { ISignUpRequest } from "@/models/auth/signup";
import { IForgotPasswordRequest } from "@/models/auth/forgotPassword";

interface AuthState extends BaseState {
  isAuthenticated: boolean;
  user: {
    role?: UserRole;
  } | null;
  formData: ISignInRequest;
  registerFormData: ISignUpRequest;
  forgotPasswordFormData: IForgotPasswordRequest;
}

const initialState: AuthState = {
  isAuthenticated: true,
  user: null,

  formData: {
    emailOrPhone: "",
    password: "",
  },

  registerFormData: {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  },

  forgotPasswordFormData: {
    emailOrPhone: "",
  },

  isLoading: false,
  errorMessage: null,
  isSuccess: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    updateFormData: (
      state,
      action: PayloadAction<{ field: keyof ISignInRequest; value: string }>
    ) => {
      const { field, value } = action.payload;
      state.formData[field] = value;
    },
    resetForm: (state) => {
      state.formData = {
        emailOrPhone: "",
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

    updateForgotPasswordFormData: (
      state,
      action: PayloadAction<{ field: keyof IForgotPasswordRequest; value: string }>
    ) => {
      const { field, value } = action.payload;
      state.forgotPasswordFormData[field] = value;
    },

    resetForgotPasswordForm: (state) => {
      state.forgotPasswordFormData = {
        emailOrPhone: "",
      };
    },

    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    clearError: (state) => {
      state.errorMessage = null;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.formData = {
        emailOrPhone: "",
        password: "",
      };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.errorMessage = action.payload;
    },
    setSuccess: (state, action: PayloadAction<boolean>) => {
      state.isSuccess = action.payload;
    },
    setUserRole: (state, action: PayloadAction<UserRole>) => {
      if (!state.user) {
        state.user = {};
      }
      state.user.role = action.payload;
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
  updateForgotPasswordFormData,
  resetForgotPasswordForm,
  setAuthenticated,
  clearError,
  logout,
  setLoading,
  setError,
  setSuccess,
  setUserRole,
} = authSlice.actions;

export default authSlice.reducer;
