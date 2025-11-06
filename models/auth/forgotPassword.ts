export interface IForgotPasswordRequest {
  emailOrPhone: string;
}

export interface IForgotPasswordResponse {
  message: string;
  success: boolean;
}

