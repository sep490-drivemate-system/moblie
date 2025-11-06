export interface ISignInRequest {
    emailOrPhone: string;
    password: string;
}

export interface ISignInResponse {
    token: string;
}
