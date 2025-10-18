import { BaseViewModel } from "@/viewmodels/shared/BaseViewModel";
import { ISignInRequest } from "@/models/auth/signin";
import { ISignUpRequest } from "@/models/auth/signup";
import { signIn, signUp } from "@/features/auth/authThunk";
import {
  updateFormData,
  resetForm,
  updateRegisterFormData,
  resetRegisterForm,
  setUser,
  setAuthenticated,
  clearError,
  logout,
  setLoading,
  setError,
  setSuccess,
} from "@/features/auth/authSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RootState } from "@/lib/redux/store";


type AuthState = RootState["auth"];

export class AuthViewModel extends BaseViewModel<AuthState> {
  updateFormData(field: keyof ISignInRequest, value: string): void {
    this.dispatch(updateFormData({ field, value }));
  }

  // Validation logic trong ViewModel
  private validateLoginForm(formData: ISignInRequest): boolean {
    if (!formData.email || !formData.password) {
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      this.dispatch(setError("Please enter a valid email address"));
      return false;
    }

    // Password validation
    if (formData.password.length < 6) {
      this.dispatch(setError("Password must be at least 6 characters"));
      return false;
    }

    return true;
  }

  // async logout(): Promise<void> {
  //   await this.executeAsync(
  //     async () => {
  //       // Xóa tokens và user data
  //       await AsyncStorage.multiRemove([
  //         ENV.STORAGE_KEYS.ACCESS_TOKEN,
  //         ENV.STORAGE_KEYS.REFRESH_TOKEN,
  //         ENV.STORAGE_KEYS.USER_DATA,
  //       ]);

  //       // Reset state
  //       this.dispatch(logout());
  //     },
  //     () => {
  //       console.log("Logout successful");
  //     },
  //     (error) => {
  //       console.error("Logout failed:", error);
  //     },
  //     {
  //       setLoading,
  //       setError,
  //       setSuccess,
  //     }
  //   );
  // }

  // async checkAuthStatus(): Promise<void> {
  //   await this.executeAsync(
  //     async () => {
  //       const token = await AsyncStorage.getItem(ENV.STORAGE_KEYS.ACCESS_TOKEN);

  //       if (token) {
  //         /**
  //          * 🎯 TRƯỜNG HỢP: Token tồn tại
  //          *
  //          * BƯỚC 1: Set user data vào Redux state
  //          * - Có thể hardcode tạm hoặc fetch từ API
  //          * - Việc gọi setUser() sẽ tự động set isAuthenticated = true
  //          *   (xem authSlice.ts - setUser reducer)
  //          *
  //          * BƯỚC 2: State sẽ thay đổi:
  //          * - isAuthenticated: false → true
  //          * - user: null → { email, name? }
  //          * - isLoading: true → false
  //          *
  //          * BƯỚC 3: _layout.tsx sẽ detect state change và navigate
  //          */
  //         console.log("✅ Token exists → Setting user as authenticated");

  //         this.dispatch(
  //           setUser({
  //             email: "user@example.com", // 📝 TODO: Fetch từ API profile endpoint
  //             name: "John Doe", // 📝 TODO: Có thể thêm name từ API
  //           })
  //         );

  //         console.log(
  //           "🔄 User state updated → _layout.tsx will handle navigation"
  //         );
  //         // 🚨 QUAN TRỌNG: Không navigate ở đây!
  //         // _layout.tsx sẽ detect isAuthenticated = true và tự động navigate
  //       }
  //     },
  //     () => {
  //       console.log("✅ Auth status check completed successfully");
  //     },
  //     (error) => {
  //       console.error("❌ Failed to check auth status:", error);
  //       // Nếu có lỗi, user sẽ bị redirect về login
  //     },
  //     {
  //       setLoading,
  //       setError,
  //       setSuccess,
  //     }
  //   );
  // }

  // // Handle input change với debouncing (optional)
  // handleInputChange(field: keyof ISignInRequest, value: string): void {
  //   this.updateFormData(field, value);

  //   // Clear error khi user bắt đầu nhập
  //   const currentState = this.getCurrentState();
  //   if (currentState.errorMessage) {
  //     this.clearError();
  //   }
  // }

  // // Handle login với tất cả logic
  // async handleLogin(): Promise<void> {
  //   await this.executeAsync(
  //     async () => {
  //       const currentState = this.getCurrentState();

  //       // Validation logic trong ViewModel
  //       // if (!this.validateLoginForm(currentState.formData)) {
  //       //   throw new Error("Please fill in all required fields");
  //       // }

  //       console.log("Attempting login with", currentState.formData.email);
  //       console.log("Attempting login with", currentState.formData.password);
  //       // Gọi signIn thunk để call API
  //       const result = await this.dispatch(
  //         signIn(currentState.formData)
  //       ).unwrap();

  //       // Lưu token vào AsyncStorage
  //       if (result?.data?.accessToken) {
  //         await AsyncStorage.setItem(
  //           ENV.STORAGE_KEYS.ACCESS_TOKEN,
  //           result.data.accessToken
  //         );
  //         await AsyncStorage.setItem(
  //           ENV.STORAGE_KEYS.REFRESH_TOKEN,
  //           result.data.refreshToken
  //         );
  //       }

  //       // Cập nhật user info
  //       this.dispatch(
  //         setUser({
  //           email: currentState.formData.email,
  //         })
  //       );

  //       console.log("Login successful");
  //     },
  //     () => {
  //       console.log("Login completed successfully");
  //     },
  //     (error) => {
  //       console.error("Login failed:", error);
  //     },
  //     {
  //       setLoading,
  //       setError,
  //       setSuccess,
  //     }
  //   );
  // }

  // Handle reset form
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

  async register(): Promise<void> {
    await this.executeAsync(
      async () => {
        const currentState = this.getCurrentState();

        // Validation logic trong ViewModel
        if (!this.validateRegisterForm(currentState.registerFormData)) {
          throw new Error("Please fill in all required fields correctly");
        }

        const result = await this.dispatch(
          signUp(currentState.registerFormData)
        ).unwrap();

        // Set user data và authenticate
        this.dispatch(
          setUser({
            email: currentState.registerFormData.email,
            name: currentState.registerFormData.name,
          })
        );

        console.log("✅ Registration successful");
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

  // Handler methods for register UI
  handleRegisterInputChange(field: keyof ISignUpRequest, value: string): void {
    this.updateRegisterFormData(field, value);
    const currentState = this.getCurrentState();
    if (currentState.errorMessage) {
      this.clearError();
    }
  }

  async handleRegister(): Promise<void> {
    await this.register();
  }

  handleResetRegisterForm(): void {
    this.dispatch(resetRegisterForm());
    this.clearError();
  }

  // ===========================================
  // 🧪 TEST METHODS - CHỈ DÙNG CHO DEVELOPMENT
  // ===========================================

  /**
   * 🧪 TEST: Simulate user đã authenticated với token
   *
   * MỤCDÍCH: Test trường hợp isAuthenticated = true
   * - Có thể gọi từ console: authViewModel.simulateAuthenticatedUser()
   * - Hoặc thêm button test trong UI
   */
  simulateAuthenticatedUser(): void {
    console.log("🧪 TEST: Simulating authenticated user...");

    // Giả lập set user data (như thể đã có token)
    this.dispatch(
      setUser({
        email: "test@example.com",
        name: "Test User",
      })
    );

    console.log(
      "✅ TEST: User set as authenticated - Check _layout.tsx navigation"
    );
  }

  /**
   * 🧪 TEST: Simulate chỉ set isAuthenticated = true (không có user data)
   *
   * MỤCDÍCH: Test CASE 2 trong _layout.tsx
   * - isAuthenticated = true
   * - user = null
   */
  simulateAuthenticatedOnly(): void {
    console.log("🧪 TEST: Simulating authenticated only (no user data)...");

    // Chỉ set authenticated, không set user
    this.dispatch(setAuthenticated(true));

    console.log(
      "✅ TEST: Only isAuthenticated = true - Check _layout.tsx navigation"
    );
  }

  /**
   * 🧪 TEST: Force logout để test trường hợp isAuthenticated = false
   */
  // testLogout(): void {
  //   console.log("🧪 TEST: Force logout...");
  //   this.logout();
  //   console.log("✅ TEST: User logged out - Should navigate to /login");
  // }
}
