import * as Yup from "yup";

// Validation schema cho Sign In
export const signInSchema = Yup.object().shape({
  emailOrPhone: Yup.string()
    .required("Email hoặc số điện thoại không được để trống")
    .test(
      "email-or-phone",
      "Vui lòng nhập email hợp lệ hoặc số điện thoại Việt Nam",
      function (value) {
        if (!value) return false;

        // Check if it's a valid email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(value)) {
          return true;
        }

        // Check if it's a valid Vietnamese phone number
        const phoneRegex = /^(\+84|0)[1-9][0-9]{8,9}$/;
        const digitsOnly = value.replace(/[\s\-\(\)]/g, "");
        if (phoneRegex.test(digitsOnly)) {
          return true;
        }

        return false;
      }
    ),
  password: Yup.string()
    .required("Mật khẩu không được để trống")
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

// Validation schema cho Sign Up
export const signUpSchema = Yup.object().shape({
  fullname: Yup.string()
    .required("Họ tên không được để trống")
    .min(2, "Họ tên phải có ít nhất 2 ký tự")
    .max(50, "Họ tên không được quá 50 ký tự"),
  email: Yup.string()
    .required("Email không được để trống")
    .email("Email không hợp lệ"),
  phone: Yup.string()
    .required("Số điện thoại không được để trống")
    .matches(
      /^(\+84|0)[1-9][0-9]{8,9}$/,
      "Số điện thoại không hợp lệ (VD: 0901234567)"
    ),
  password: Yup.string()
    .required("Mật khẩu không được để trống")
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Mật khẩu phải có chữ hoa, chữ thường và số"
    ),
  confirmPassword: Yup.string()
    .required("Vui lòng xác nhận mật khẩu")
    .oneOf([Yup.ref("password")], "Mật khẩu xác nhận không khớp"),
  acceptTerms: Yup.boolean()
    .required("Bạn phải đồng ý với điều khoản")
    .oneOf([true], "Bạn phải đồng ý với điều khoản"),
});

// Validation schema cho Forgot Password
export const forgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .required("Email không được để trống")
    .email("Email không hợp lệ"),
});

// Type exports
export type SignInFormData = Yup.InferType<typeof signInSchema>;
export type SignUpFormData = Yup.InferType<typeof signUpSchema>;
export type ForgotPasswordFormData = Yup.InferType<typeof forgotPasswordSchema>;
