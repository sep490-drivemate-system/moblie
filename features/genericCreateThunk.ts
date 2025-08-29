import axiosInstance from "@/lib/axios/axiosInstance";
import { HttpMethod } from "@/models/enum/HttpMethod";
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

    console.log(`[Thunk] Sending request - ${method} ${url}`);
    console.log(`[Thunk] Payload:`, payload);

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
      };
      const message =
        error.response?.data?.message ||
        `${method.toUpperCase()} request failed`;

      console.error(`[Thunk] Error:`, error);
      options?.onError?.(error, payload);
      return rejectWithValue(message);
    } finally {
      options?.onFinally?.(payload);
    }
  });
}
