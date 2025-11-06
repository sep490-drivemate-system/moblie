import { BaseViewModel } from "@/viewmodels/shared/BaseViewModel";
import { ISignInRequest } from "@/models/auth/signin";
import { ISignUpRequest } from "@/models/auth/signup";
import { IForgotPasswordRequest } from "@/models/auth/forgotPassword";
import { signIn, signUp } from "@/features/auth/authThunk";
import {
  updateFormData,
  resetForm,
  updateRegisterFormData,
  resetRegisterForm,
  updateForgotPasswordFormData,
  resetForgotPasswordForm,
  clearError,
  setLoading,
  setError,
  setSuccess,
  setAuthenticated,
} from "@/features/auth/authSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RootState } from "@/lib/redux/store";
import axios from "axios";



type AuthState = RootState["auth"];

export class AuthViewModel extends BaseViewModel<AuthState> {

  updateFormData(field: keyof ISignInRequest, value: string): void {
    this.dispatch(updateFormData({ field, value }));
  }


  async checkAuthStatus(): Promise<void> {
    await this.executeAsync(
      async () => {
        const token = await AsyncStorage.getItem(process.env.EXPO_PUBLIC_STORAGE_TOKEN || '@token');
        if (token) {
          this.dispatch(
            setAuthenticated(true)
          );
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
  handleGoogleLogin = async () => {
  };
  async handleLogin(): Promise<void> {
    await this.executeAsync(
      async () => {


        const resulttt = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/skills`, {

        });
        console.log("resulttt", resulttt.data);


        const currentState = this.getCurrentState();

        const result = await this.dispatch(
          signIn(currentState.formData)
        ).unwrap();
        if (result?.value?.token) {
          this.dispatch(
            setAuthenticated(true)
          );
          await AsyncStorage.setItem(
            process.env.EXPO_PUBLIC_STORAGE_TOKEN || '@token',
            result.value.token
          );

        }

      },
      () => {
      },
      () => {
      },
      {
        setLoading,
        setError,
        setSuccess,
      }
    );
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
  updateRegisterFormData(field: keyof ISignUpRequest, value: string): void {
    this.dispatch(updateRegisterFormData({ field, value }));
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
      () => {
        console.log("Registration successful");
      },
      (error) => {
        console.error("Registration failed:", error);
      },
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
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      this.dispatch(setError("All fields are required."));
      return false;
    }

    // Check name length
    if (formData.name.length < 2) {
      this.dispatch(setError("Name must be at least 2 characters long."));
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

  async handleRegister(): Promise<void> {
    await this.signup();
  }

  handleResetRegisterForm(): void {
    this.dispatch(resetRegisterForm());
    this.clearError();
  }

  updateForgotPasswordFormData(field: keyof IForgotPasswordRequest, value: string): void {
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

        await new Promise(resolve => setTimeout(resolve, 1000));

        return { success: true, message: "Yêu cầu đặt lại mật khẩu đã được gửi" };
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

  handleForgotPasswordInputChange(field: keyof IForgotPasswordRequest, value: string): void {
    this.updateForgotPasswordFormData(field, value);
    const currentState = this.getCurrentState();
    if (currentState.errorMessage) {
      this.clearError();
    }
  }
}
