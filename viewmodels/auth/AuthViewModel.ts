import { BaseViewModel } from "@/viewmodels/shared/BaseViewModel";
import { ISignInRequest } from "@/models/auth/signin";
import { ISignUpRequest } from "@/models/auth/signup";
import { IForgotPasswordRequest } from "@/models/auth/forgotPassword";
import { signIn, signUp } from "@/features/auth/authThunk";
import {
  updateFormData,
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
} from "@/features/auth/authSlice";
import { getRoleFromToken } from "@/lib/jwt/tokenUtils";
import { UserRole } from "@/models/enum/UserRole.enum";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RootState } from "@/lib/redux/store";

type AuthState = RootState["auth"];

export class AuthViewModel extends BaseViewModel<AuthState> {

  getRegisterFormData(): ISignUpRequest {
    return this.getCurrentState().registerFormData;
  }

  updateFormData(field: keyof ISignInRequest, value: string): void {
    this.dispatch(updateFormData({ field, value }));
  }
  async checkAuthStatus(): Promise<void> {
    await this.executeAsync(
      async () => {
        const token = await AsyncStorage.getItem(
          process.env.EXPO_PUBLIC_STORAGE_TOKEN || "@token"
        );
        if (token) {
          // Decode token và lấy role
          const roleFromToken = getRoleFromToken(token);

          if (roleFromToken) {
            // Lưu role vào Redux state
            this.dispatch(setUserRole(roleFromToken));
          }

          this.dispatch(setAuthenticated(true));
        }
      },
      undefined,
      undefined,
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
    await this.executeAsync(
      async () => {
        const currentState = this.getCurrentState();
        const result = await this.dispatch(
          signIn(currentState.formData)
        ).unwrap();

        if (result?.value?.token) {
          const roleFromToken = getRoleFromToken(result.value.token);
          if (roleFromToken) {
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

    return { success: true };
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
  // Validation functions
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

  updateRegisterFormData(field: keyof ISignUpRequest, value: string | boolean): void {
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
          this.dispatch(setRegisterFormError({ field: "confirmPassword", error: confirmError }));
        }
      } else if (field === "confirmPassword") {
        error = this.validateConfirmPassword(
          value as string,
          currentFormData.password
        );
        this.dispatch(setRegisterFormError({ field: "confirmPassword", error }));
      } else if (field === "phone") {
        error = this.validatePhone(value as string);
        this.dispatch(setRegisterFormError({ field: "phone", error }));
      }
    }

    // Log registerFormData sau mỗi lần cập nhật
    const updatedFormData = this.getCurrentState().registerFormData;
    console.log("📝 Register Form Data Updated:");
    console.log("Field:", field, "→", value);
    console.log("Current Form Data:", JSON.stringify(updatedFormData, null, 2));
  }

  async signup(): Promise<void> {
    await this.executeAsync(
      async () => {
        const currentState = this.getCurrentState();

        if (!this.validateRegisterForm(currentState.registerFormData)) {
          throw new Error("Please fill in all required fields correctly");
        }

        const result = await this.dispatch(
          signUp(currentState.registerFormData)
        ).unwrap();
      },
      () => {},
      (error) => {},
      {
        setLoading,
        setError,
        setSuccess,
      }
    );
  }

  private validateRegisterForm(formData: ISignUpRequest): boolean {
    // Check required fields
    if (
      !formData.fullname ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.phone
    ) {
      this.dispatch(setError("All fields are required."));
      return false;
    }

    // Check name length
    if (formData.fullname.length < 2) {
      this.dispatch(setError("Fullname must be at least 2 characters long."));
      return false;
    }

    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      this.dispatch(setError("Please enter a valid email address."));
      return false;
    }

    // Check password strength
    if (formData.password.length < 6) {
      this.dispatch(setError("Password must be at least 6 characters."));
      return false;
    }

    // Check password match
    if (formData.password !== formData.confirmPassword) {
      this.dispatch(setError("Passwords do not match."));
      return false;
    }

    return true;
  }

  handleRegisterInputChange(field: keyof ISignUpRequest, value: string): void {
    this.updateRegisterFormData(field, value);
    const currentState = this.getCurrentState();
    if (currentState.errorMessage) {
      this.clearError();
    }
  }

  handleRegister = async (): Promise<void> => {
    const registerFormData = this.getCurrentState().registerFormData;
    console.log("🚀 Register Button Pressed!");
    console.log("📋 Complete Register Form Data:");
    console.log(JSON.stringify(registerFormData, null, 2));
    console.log("---");
    console.log("Email:", registerFormData.email);
    console.log("Fullname:", registerFormData.fullname);
    console.log("Password:", registerFormData.password ? "***" : "");
    console.log("Confirm Password:", registerFormData.confirmPassword ? "***" : "");
    console.log("Phone:", registerFormData.phone);
    console.log("Accept Terms:", registerFormData.acceptTerms);
    
    // Navigate to OTP screen
    this.navigate("/(onboarding)/otp");
    // await this.signup();
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
}
