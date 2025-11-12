export interface IVerifyEmailRequest {
    email: string;
}

export interface IVerifyEmailResponse {
    isSuccess: boolean,
    message: string,
    errorCode: string | null,
    value: string
}

