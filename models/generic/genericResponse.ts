export interface ServiceError {
    code: string;
    message: string;
}

export interface GenericResponse<T> {
    isSuccess: boolean;
    message: string;
    errorCode?: string | null;
    value?: T;
}
