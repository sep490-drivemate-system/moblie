export interface ISignUpRequest {
    email: string;
    password: string;
    confirmPassword: string;
    name: string;
}

export interface ISignUpResponse {
    success: boolean;
    message: string;
}
