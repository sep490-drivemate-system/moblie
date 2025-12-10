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

export interface PaginatedGeneric<T> {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    pageContent: T[];
}
