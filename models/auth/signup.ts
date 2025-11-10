export interface ISignUpRequest {
    email: string;
    fullname: string;
    password: string;
    confirmPassword: string;
    phone: string;
    acceptTerms: boolean;
}

export interface ISignUpResponse {
    success: boolean;
    message: string;
}
