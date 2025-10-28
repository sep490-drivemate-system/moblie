import { BaseViewModel } from "@/viewmodels/shared/BaseViewModel";
import { ISignInRequest } from "@/models/auth/signin";
import { ISignUpRequest } from "@/models/auth/signup";
import { signIn, signUp } from "@/features/auth/authThunk";
import {
  updateFormData,
  resetForm,
  updateRegisterFormData,
  resetRegisterForm,
  clearError,
  setLoading,
  setError,
  setSuccess,
  setAuthenticated,
} from "@/features/auth/authSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RootState } from "@/lib/redux/store";
import { Alert } from "react-native";



type AuthState = RootState["auth"];

export class AuthViewModel extends BaseViewModel<AuthState> {

  updateFormData(field: keyof ISignInRequest, value: string): void {
    this.dispatch(updateFormData({ field, value }));
  }


  async checkAuthStatus(): Promise<void> {
    await this.executeAsync(
      async () => {
        const token = await AsyncStorage.getItem(process.env.EXPO_PUBLIC_STORAGE_ACCESS_TOKEN || '@access_token');
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
      // handle logic signin google    
  };
  async handleLogin(): Promise<void> {
    await this.executeAsync(
      async () => {
        const currentState = this.getCurrentState();  
       
        const result = await this.dispatch(
          signIn(currentState.formData)
        ).unwrap();
        if (result?.value?.accessToken) {
          this.dispatch(
           setAuthenticated(true)
          );
          await AsyncStorage.setItem(
            process.env.EXPO_PUBLIC_STORAGE_ACCESS_TOKEN || '@access_token',
            result.value.accessToken
          );
          await AsyncStorage.setItem(
            process.env.EXPO_PUBLIC_STORAGE_REFRESH_TOKEN || '@refresh_token',
            result.value.refreshToken
          );
        }
      
      },
      () => {
        console.log("Login completed successfully");
      },
      (error) => {
        console.error("Login failed:", error);
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
}
