export interface IVerifyRequest {
    email: string;
    phoneNumber: string;
}

export interface IVerifyResponse {
    value: string; // OTP code
}
