import { BaseViewModel } from "@/viewmodels/shared/BaseViewModel";
import { ISignInRequest } from "@/models/auth/signin";
import {
  IRegisterInstructorRequest,
  ISignUpRequest,
} from "@/models/auth/signup";
import { IForgotPasswordRequest } from "@/models/auth/forgotPassword";
import {
  signIn,
  signUp,
  verifyEmail,
  verify,
  registerInstructor,
} from "@/features/auth/authThunk";
import { signInSchema, signUpSchema } from "@/validations/authValidation";
import { ValidationError } from "yup";
import {
  updateEmailOrPhone,
  updatePassword,
  resetForm,
  updateRegisterFormData,
  setRegisterFormError,
  clearRegisterFormErrors,
  resetRegisterForm,
  updateForgotPasswordFormData,
  resetForgotPasswordForm,
  clearError,
  setLoading,
  setError,
  setSuccess,
  setAuthenticated,
  setUserRole,
  logout,
  setSentOtp,
  setEnteredOtp,
  resetOtpVerification,
  updateRegisterInstructorFormData,
} from "@/features/auth/authSlice";
import { getRoleFromToken } from "@/lib/jwt/tokenUtils";
import { UserRole } from "@/models/enum/UserRole.enum";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RootState } from "@/lib/redux/store";
import { IVerifyEmailResponse } from "@/models/auth/verifyEmail";
import { GenericResponse } from "@/models/generic/genericResponse";
import { ROUTES } from "@/constants/routes";

type AuthState = RootState["auth"];

export class AuthViewModel extends BaseViewModel<AuthState> {
  getRegisterFormData(): ISignUpRequest {
    return this.getCurrentState().registerFormData;
  }

  getErrorMessage(): string | null {
    return this.getCurrentState().errorMessage;
  }

  updateEmailOrPhoneField(value: string): void {
    this.dispatch(updateEmailOrPhone(value));
  }

  updatePasswordField(value: string): void {
    this.dispatch(updatePassword(value));
  }

  handleEmailOrPhoneChange(value: string): void {
    this.updateEmailOrPhoneField(value);
    if (this.getCurrentState().errorMessage) {
      this.clearError();
    }
  }

  handlePasswordChange(value: string): void {
    this.updatePasswordField(value);
    if (this.getCurrentState().errorMessage) {
      this.clearError();
    }
  }

  async validateSignInForm(): Promise<{ isValid: boolean; error?: string }> {
    try {
      const currentState = this.getCurrentState();
      await signInSchema.validate(currentState.formData, { abortEarly: false });
      return { isValid: true };
    } catch (err) {
      if (err instanceof ValidationError) {
        const firstError = err.errors[0];
        this.dispatch(setError(firstError));
        return { isValid: false, error: firstError };
      }
      return { isValid: false, error: "Validation failed" };
    }
  }

  async validateSignUpForm(): Promise<{
    isValid: boolean;
    errors?: Record<string, string>;
  }> {
    try {
      const currentState = this.getCurrentState();
      await signUpSchema.validate(currentState.registerFormData, {
        abortEarly: false,
      });
      this.dispatch(clearRegisterFormErrors());
      return { isValid: true };
    } catch (err) {
      if (err instanceof ValidationError) {
        const errors: Record<string, string> = {};
        err.inner.forEach((error) => {
          if (error.path) {
            errors[error.path] = error.message;
            this.dispatch(
              setRegisterFormError({
                field: error.path as any,
                error: error.message,
              })
            );
          }
        });
        return { isValid: false, errors };
      }
      return { isValid: false };
    }
  }

  async checkAuthStatus(): Promise<void> {
    await this.executeAsync(
      async () => {
        const token = await AsyncStorage.getItem(
          process.env.EXPO_PUBLIC_STORAGE_TOKEN || "@token"
        );
        if (token) {
          const roleFromToken = getRoleFromToken(token);
          if (roleFromToken) {
            this.dispatch(setUserRole(roleFromToken));
          }
          this.dispatch(setAuthenticated(true));
        }
      },
      () => {},
      () => {},
      {
        setLoading,
        setError,
        setSuccess,
      }
    );
  }

  handleGoogleLogin = async () => {};

  async handleSignOut(): Promise<void> {
    await AsyncStorage.removeItem(
      process.env.EXPO_PUBLIC_STORAGE_TOKEN || "@token"
    );
    this.dispatch(logout());
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  async handleSignIn(): Promise<{ success: boolean; userRole?: UserRole }> {
    const validation = await this.validateSignInForm();
    if (!validation.isValid) {
      return { success: false };
    }

    let userRole: UserRole | undefined;

    await this.executeAsync(
      async () => {
        const currentState = this.getCurrentState();
        const result = await this.dispatch(
          signIn(currentState.formData)
        ).unwrap();

        if (result?.value?.token) {
          const roleFromToken = getRoleFromToken(result.value.token);
          if (roleFromToken) {
            userRole = roleFromToken;
            this.dispatch(setUserRole(roleFromToken));
          }
          this.dispatch(setAuthenticated(true));
          await AsyncStorage.setItem(
            process.env.EXPO_PUBLIC_STORAGE_TOKEN || "@token",
            result.value.token
          );
        }
      },
      () => {},
      () => {},
      {
        setLoading,
        setError,
        setSuccess,
      }
    );

    return { success: true, userRole };
  }

  handleResetForm(): void {
    this.resetForm();
    this.clearError();
  }

  clearError(): void {
    this.dispatch(clearError());
  }

  resetForm(): void {
    this.dispatch(resetForm());
  }
  private validateEmail(email: string): string | undefined {
    if (!email.trim()) {
      return "Email không được để trống";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Email không đúng định dạng";
    }
    return undefined;
  }

  private validateFullname(fullname: string): string | undefined {
    if (!fullname.trim()) {
      return "Họ và tên không được để trống";
    }
    if (fullname.trim().length < 8) {
      return "Họ và tên phải có ít nhất 8 ký tự";
    }
    return undefined;
  }

  private validatePassword(password: string): string | undefined {
    if (!password) {
      return "Mật khẩu không được để trống";
    }

    const errors: string[] = [];

    if (password.length < 6) {
      errors.push("Mật khẩu phải có ít nhất 6 ký tự");
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase) {
      errors.push("Mật khẩu phải có ít nhất 1 ký tự hoa");
    }
    if (!hasNumber) {
      errors.push("Mật khẩu phải có ít nhất 1 ký tự số");
    }
    if (!hasSpecialChar) {
      errors.push("Mật khẩu phải có ít nhất 1 ký tự đặc biệt");
    }

    return errors.length > 0 ? errors.join("\n") : undefined;
  }

  private validateConfirmPassword(
    confirmPassword: string,
    password: string
  ): string | undefined {
    if (!confirmPassword) {
      return "Vui lòng nhập lại mật khẩu";
    }
    if (confirmPassword !== password) {
      return "Mật khẩu nhập lại không khớp";
    }
    return undefined;
  }

  private validatePhone(phone: string): string | undefined {
    if (!phone.trim()) {
      return "Số điện thoại không được để trống";
    }

    if (phone.length !== 10) {
      return "Số điện thoại phải có đủ 10 chữ số";
    }
    return undefined;
  }

  getRegisterFormErrors() {
    return this.getCurrentState().registerFormErrors;
  }

  isRegisterFormValid(): boolean {
    const errors = this.getCurrentState().registerFormErrors;
    const formData = this.getCurrentState().registerFormData;

    // Kiểm tra xem có lỗi nào không
    const hasErrors = Object.keys(errors).length > 0;

    // Kiểm tra acceptTerms
    const termsAccepted = formData.acceptTerms;

    // Form valid khi không có lỗi và đã chấp nhận điều khoản
    return !hasErrors && termsAccepted;
  }

  updateRegisterFormData(
    field: keyof ISignUpRequest,
    value: string | boolean
  ): void {
    this.dispatch(updateRegisterFormData({ field, value }));

    // Real-time validation - only validate if field is not acceptTerms
    if (field !== "acceptTerms") {
      const currentFormData = this.getCurrentState().registerFormData;
      let error: string | undefined;

      if (field === "email") {
        error = this.validateEmail(value as string);
        this.dispatch(setRegisterFormError({ field: "email", error }));
      } else if (field === "fullname") {
        error = this.validateFullname(value as string);
        this.dispatch(setRegisterFormError({ field: "fullname", error }));
      } else if (field === "password") {
        error = this.validatePassword(value as string);
        this.dispatch(setRegisterFormError({ field: "password", error }));
        // Also validate confirmPassword if it has value
        if (currentFormData.confirmPassword) {
          const confirmError = this.validateConfirmPassword(
            currentFormData.confirmPassword,
            value as string
          );
          this.dispatch(
            setRegisterFormError({
              field: "confirmPassword",
              error: confirmError,
            })
          );
        }
      } else if (field === "confirmPassword") {
        error = this.validateConfirmPassword(
          value as string,
          currentFormData.password
        );
        this.dispatch(
          setRegisterFormError({ field: "confirmPassword", error })
        );
      } else if (field === "phone") {
        error = this.validatePhone(value as string);
        this.dispatch(setRegisterFormError({ field: "phone", error }));
      }
    }
  }

  handleRegisterInputChange(field: keyof ISignUpRequest, value: string): void {
    this.updateRegisterFormData(field, value);
    const currentState = this.getCurrentState();
    if (currentState.errorMessage) {
      this.clearError();
    }
  }

  handleRegister = async (): Promise<void> => {
    // this.navigate(ROUTES.OTP);
    const registerFormData = this.getCurrentState().registerFormData;

    try {
      const result = await this.dispatch(
        verify({
          email: registerFormData.email,
          phoneNumber: registerFormData.phone,
        })
      ).unwrap();

      if (result?.value) {
        this.dispatch(setSentOtp(result.value));

        if (this.router) {
          this.navigate(ROUTES.OTP);
        } else if (this.navigationCallback) {
          this.navigationCallback(ROUTES.OTP);
        }
      }
    } catch (error) {
      const message =
        typeof error === "string"
          ? error
          : (error as { message?: string })?.message ||
          this.getCurrentState().errorMessage ||
          "Không thể gửi mã OTP, vui lòng thử lại.";
      this.dispatch(setError(message));
    }
  };

  handleResetRegisterForm(): void {
    this.dispatch(resetRegisterForm());
    this.clearError();
  }

  updateForgotPasswordFormData(
    field: keyof IForgotPasswordRequest,
    value: string
  ): void {
    this.dispatch(updateForgotPasswordFormData({ field, value }));
  }

  resetForgotPasswordForm(): void {
    this.dispatch(resetForgotPasswordForm());
    this.clearError();
  }

  private validateEmailOrPhone(value: string): string | undefined {
    if (!value || value.trim() === "") {
      return "Email hoặc số điện thoại không được để trống";
    }

    const trimmedValue = value.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(trimmedValue)) {
      return undefined;
    }

    const phoneRegex = /^(\+84|0)[1-9][0-9]{8,9}$/;
    const digitsOnly = trimmedValue.replace(/[\s\-\(\)]/g, "");

    if (phoneRegex.test(digitsOnly)) {
      return undefined;
    }

    return "Vui lòng nhập email hợp lệ hoặc số điện thoại Việt Nam (0xxxxxxxxx)";
  }

  async handleForgotPassword(): Promise<void> {
    await this.executeAsync(
      async () => {
        const currentState = this.getCurrentState();
        const { emailOrPhone } = currentState.forgotPasswordFormData;

        const validationError = this.validateEmailOrPhone(emailOrPhone);
        if (validationError) {
          this.dispatch(setError(validationError));
          throw new Error(validationError);
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));

        return {
          success: true,
          message: "Yêu cầu đặt lại mật khẩu đã được gửi",
        };
      },
      () => {
        console.log("Forgot password request sent successfully");
      },
      (error) => {
        console.error("Forgot password failed:", error);
      },
      {
        setLoading,
        setError,
        setSuccess,
      }
    );
  }

  handleForgotPasswordInputChange(
    field: keyof IForgotPasswordRequest,
    value: string
  ): void {
    this.updateForgotPasswordFormData(field, value);
    const currentState = this.getCurrentState();
    if (currentState.errorMessage) {
      this.clearError();
    }
  }

  async handleVerifyEmail(
    email: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const result = await this.executeAsync<IVerifyEmailResponse>(
        async () => {
          return (await this.dispatch(verifyEmail({ email })).unwrap())
            .value as IVerifyEmailResponse;
        },
        (response) => {
          console.log("response line 521", response);
        },
        (error) => {
          console.error("handleVerifyEmail error:", error);
        },
        {
          setLoading,
          setError,
          setSuccess,
        }
      );
      if (result && result.value) {
        return { success: true, message: result.value };
      }
      return { success: false, message: "Có lỗi xảy ra" };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Có lỗi xảy ra",
      };
    }
  }

  // Method to update entered OTP
  updateEnteredOtp(otp: string): void {
    this.dispatch(setEnteredOtp(otp));
  }

  // Method to verify OTP
  verifyOtp(): boolean {
    const currentState = this.getCurrentState();
    const { sentOtp, enteredOtp } = currentState.otpVerification;

    if (!sentOtp || !enteredOtp) {
      this.dispatch(setError("Mã OTP không hợp lệ"));
      return false;
    }

    if (sentOtp === enteredOtp) {
      this.dispatch(resetOtpVerification());
      return true;
    } else {
      this.dispatch(setError("Mã OTP không đúng"));
      return false;
    }
  }

  // Get OTP verification state
  getOtpVerificationState() {
    return this.getCurrentState().otpVerification;
  }

  updateRegisterInstructorFormData(
    field: keyof IRegisterInstructorRequest,
    value: string | boolean | File | null
  ): void {
    this.dispatch(updateRegisterInstructorFormData({ field, value }));
  }

  private buildRegisterInstructorFormData(): FormData {
    const data = this.getCurrentState().registerInstructorFormData;
    const formData = new FormData();

    const textFields: Array<
      | "FullName"
      | "RawPassword"
      | "Email"
      | "PhoneNumber"
      | "BirthDate"
      | "Gender"
      | "DrivingLicenseTier"
      | "TeachingTier"
    > = [
      "FullName",
      "RawPassword",
      "Email",
      "PhoneNumber",
      "BirthDate",
      "Gender",
      "DrivingLicenseTier",
      "TeachingTier",
    ];

    textFields.forEach((field) => {
      const value = data[field];
      if (value !== undefined && value !== null) {
        formData.append(field, String(value));
      }
    });

    const fileFields: Array<
      | "Avatar"
      | "DrivingLicenseFront"
      | "DrivingLicenseBack"
      | "TeachingLicenseFront"
      | "HealthCheckup"
      | "PersonalProfile"
    > = [
      "Avatar",
      "DrivingLicenseFront",
      "DrivingLicenseBack",
      "TeachingLicenseFront",
      "HealthCheckup",
      "PersonalProfile",
    ];

    fileFields.forEach((field) => {
      const value = data[field];
      if (value) {
        formData.append(field, value);
      }
    });

    return formData;
  }

  async submitRegisterInstructor() {
    const formData = this.buildRegisterInstructorFormData();
    const result = await this.dispatch(registerInstructor(formData)).unwrap();
    return result;
  }
}
