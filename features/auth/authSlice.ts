import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserRole } from "@/models/enum/UserRole.enum";
import { signIn, signUp, verify, registerInstructor } from "./authThunk";
import { BaseState } from "@/models/generic/baseState";
import { ISignInRequest } from "@/models/auth/signin";
import { IRegisterInstructorRequest, ISignUpRequest } from "@/models/auth/signup";
import { IForgotPasswordRequest } from "@/models/auth/forgotPassword";
import { IUserInfo } from "@/models/user/user.type";
import { getUserById } from "../user/userThunk";

interface RegisterFormErrors {
  email?: string;
  fullname?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
}

interface AuthState extends BaseState {
  isAuthenticated: boolean;
  hasCheckedAuth: boolean;
  user: {
    role?: UserRole;
  } | null;
  userInfo: IUserInfo | null;
  formData: ISignInRequest;
  registerFormData: ISignUpRequest;
  registerFormErrors: RegisterFormErrors;
  forgotPasswordFormData: IForgotPasswordRequest;
  registerInstructorFormData: IRegisterInstructorRequest;
  // OTP Verification State
  otpVerification: {
    sentOtp: string | null;
    isOtpSent: boolean;
    enteredOtp: string;
  };
}

const initialState: AuthState = {
  isAuthenticated: false,
  hasCheckedAuth: false,
  user: null,
  userInfo: null,
  formData: {
    emailOrPhone: "",
    password: "",
  },

  registerFormData: {
    fullname: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    acceptTerms: false,
  },
  registerFormErrors: {},

  forgotPasswordFormData: {
    emailOrPhone: "",
  },

  otpVerification: {
    sentOtp: null,
    isOtpSent: false,
    enteredOtp: "",
  },

  registerInstructorFormData: {
    Fullname: "",
    RawPassword: "",
    Email: "",
    PhoneNumber: "",
    Avatar: null,
    BirthDate: "",
    Gender: "",
    DrivingLicenseFront: null,
    DrivingLicenseBack: null,
    DrivingLicenseTier: "",
    TeachingLicenseFront: null,
    TeachingTier: "",
    HealthCheckup: null,
    PersonalProfile: null,
  },

  isLoading: false,
  errorMessage: null,
  isSuccess: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    updateEmailOrPhone: (state, action: PayloadAction<string>) => {
      state.formData.emailOrPhone = action.payload;
    },

    updatePassword: (state, action: PayloadAction<string>) => {
      state.formData.password = action.payload;
    },

    resetForm: (state) => {
      state.formData = {
        emailOrPhone: "",
        password: "",
      };
    },

    updateRegisterFormData: (
      state,
      action: PayloadAction<{
        field: keyof ISignUpRequest;
        value: string | boolean;
      }>
    ) => {
      const { field, value } = action.payload;
      if (field === "acceptTerms") {
        state.registerFormData.acceptTerms = value as boolean;
      } else {
        state.registerFormData[field] = value as string;
      }
    },

    setRegisterFormError: (
      state,
      action: PayloadAction<{
        field: keyof RegisterFormErrors;
        error: string | undefined;
      }>
    ) => {
      const { field, error } = action.payload;
      if (error) {
        state.registerFormErrors[field] = error;
      } else {
        delete state.registerFormErrors[field];
      }
    },

    clearRegisterFormErrors: (state) => {
      state.registerFormErrors = {};
    },

    resetRegisterForm: (state) => {
      state.registerFormData = {
        fullname: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        acceptTerms: false,
      };
      state.registerFormErrors = {};
    },

    updateForgotPasswordFormData: (
      state,
      action: PayloadAction<{
        field: keyof IForgotPasswordRequest;
        value: string;
      }>
    ) => {
      const { field, value } = action.payload;
      state.forgotPasswordFormData[field] = value;
    },

    resetForgotPasswordForm: (state) => {
      state.forgotPasswordFormData = {
        emailOrPhone: "",
      };
    },
    setAuthChecked: (state, action: PayloadAction<boolean>) => {
      state.hasCheckedAuth = action.payload;
    },
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    clearError: (state) => {
      state.errorMessage = null;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.hasCheckedAuth = true;
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
    // OTP Verification Actions
    setSentOtp: (state, action: PayloadAction<string>) => {
      state.otpVerification.sentOtp = action.payload;
      state.otpVerification.isOtpSent = true;
    },
    setEnteredOtp: (state, action: PayloadAction<string>) => {
      state.otpVerification.enteredOtp = action.payload;
    },
    resetOtpVerification: (state) => {
      state.otpVerification = {
        sentOtp: null,
        isOtpSent: false,
        enteredOtp: "",
      };
    },

    updateRegisterInstructorFormData: (
      state,
      action: PayloadAction<{
        field: keyof IRegisterInstructorRequest;
        value: any;
      }>
    ) => {
      const { field, value } = action.payload;
      state.registerInstructorFormData[field] = value as any;
    },
    resetRegisterInstructorForm: (state) => {
      state.registerInstructorFormData = {
        Fullname: "",
        RawPassword: "",
        Email: "",
        PhoneNumber: "",
        Avatar: null,
        BirthDate: "",
        Gender: "",
        DrivingLicenseFront: null,
        DrivingLicenseBack: null,
        DrivingLicenseTier: "",
        TeachingLicenseFront: null,
        TeachingTier: "",
        HealthCheckup: null,
        PersonalProfile: null,
      };
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
      .addCase(signUp.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.errorMessage = action.payload as string || null;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.errorMessage = action.payload || null;
      })
      .addCase(verify.pending, (state) => {
        state.isLoading = true;
        state.errorMessage = null;
      })
      .addCase(verify.fulfilled, (state) => {
        state.isLoading = false;
        state.errorMessage = null;
      })
      .addCase(verify.rejected, (state, action) => {
        state.isLoading = false;
        // rejectWithValue trả về string message
        state.errorMessage = (action.payload as string) || null;
      })
      .addCase(registerInstructor.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.errorMessage = null;
      })
      .addCase(registerInstructor.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.userInfo = action.payload.value ?? null as unknown as IUserInfo;
      })
      .addCase(registerInstructor.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.errorMessage = action.payload as string || null;
      });
  },
});

export const {
  updateEmailOrPhone,
  updatePassword,
  resetForm,
  updateRegisterFormData,
  setRegisterFormError,
  clearRegisterFormErrors,
  resetRegisterForm,
  updateForgotPasswordFormData,
  resetForgotPasswordForm,
  setAuthChecked,
  setAuthenticated,
  clearError,
  logout,
  setLoading,
  setError,
  setSuccess,
  setUserRole,
  setSentOtp,
  setEnteredOtp,
  resetOtpVerification,
  updateRegisterInstructorFormData,
  resetRegisterInstructorForm,
} = authSlice.actions;

export default authSlice.reducer;
