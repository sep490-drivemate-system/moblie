export interface ISignInRequest {
    emailOrPhone: string;
    password: string;
}

export interface ISignInResponse {
    accessToken: string;
    refreshToken: string;
}
