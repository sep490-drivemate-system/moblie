import axiosInstance from "@/lib/axios/axiosInstance";
import { HttpMethod } from "@/models/enum/HttpMethods";
import { GenericResponse } from "@/models/generic/genericResponse";
import { ThunkOptions } from "@/models/generic/thunkOptions";
import { createAsyncThunk } from "@reduxjs/toolkit";

export function createThunk<ResponseType = void, RequestType = void>(
  method: HttpMethod,
  typePrefix: string,
  defaultUrl: string,
  options?: ThunkOptions<RequestType, ResponseType>
) {
  return createAsyncThunk<
    GenericResponse<ResponseType>,
    RequestType,
    { rejectValue: string }
  >(typePrefix, async (payload, { rejectWithValue }) => {
    const url = options?.buildUrl?.(payload) ?? defaultUrl;
    const config = options?.config?.(payload);

    try {
      let response;

      switch (method) {
        case HttpMethod.GET:
          response = await axiosInstance.get<GenericResponse<ResponseType>>(
            url,
            config
          );
          break;
        case HttpMethod.POST:
          response = await axiosInstance.post<GenericResponse<ResponseType>>(
            url,
            payload,
            config
          );
          break;
        case HttpMethod.PUT:
          response = await axiosInstance.put<GenericResponse<ResponseType>>(
            url,
            payload,
            config
          );
          break;
        case HttpMethod.PATCH:
          response = await axiosInstance.patch<GenericResponse<ResponseType>>(
            url,
            payload,
            config
          );
          break;
        case HttpMethod.DELETE:
          response = await axiosInstance.delete<GenericResponse<ResponseType>>(
            url,
            config
          );
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      console.log(`[Thunk] Response:`, response.data);

      options?.onSuccess?.(response.data, payload);
      return response.data;
    } catch (err) {
      const error = err as unknown as {
        response?: { data?: { message?: string } };
        message?: string;
      };

      // Log error ra console để debug
      console.log(`[Thunk Error] ${method.toUpperCase()} ${url}:`, error);

      // Lấy message từ backend response hoặc từ error object (cho Network Error)
      let message = "";
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message) {
        // Handle Network Error và các lỗi khác không có response
        message = error.message;
      } else {
        // Fallback message cho các trường hợp không xác định
        message = "Đã xảy ra lỗi. Vui lòng thử lại.";
      }

      options?.onError?.(error, payload);
      return rejectWithValue(message);
    } finally {
      options?.onFinally?.(payload);
    }
  });
}
