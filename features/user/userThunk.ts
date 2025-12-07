import { IUserInfo, EditUserPayload, InstructorDetailDTO } from "@/models/user/user.type";
import { createThunk } from "../genericCreateThunk";
import { HttpMethod } from "@/models/enum/HttpMethods";
import { INoviceDriverAddress } from "../booking/bookingThunk";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/lib/axios/axiosInstance";
import { GenericResponse } from "@/models/generic/genericResponse";

export const USER_PATH = "users";
export const NOVICE_DRIVER_PATH = "novice-driver";
export const INSTRUCTOR_PATH = "instructors";

export const getUserById = createThunk<
    IUserInfo,
    { id: string }
>(
    HttpMethod.GET,
    "getUserById",
    `/${USER_PATH}`,
    {
        buildUrl: (payload) => {
            if (!payload.id || payload.id.trim() === "") {
                throw new Error("User ID is required");
            }
            return `/${USER_PATH}/${payload.id}`;
        }
    }
);

/**
 * Helper function to convert EditUserPayload to FormData
 * In React Native, file URIs need to be formatted as objects with uri, type, and name
 */
function createEditUserFormData(payload: EditUserPayload): FormData {
    const formData = new FormData();
    
    if (payload.Email !== undefined) {
        formData.append("Email", payload.Email);
    }
    if (payload.PhoneNumber !== undefined) {
        formData.append("PhoneNumber", payload.PhoneNumber);
    }
    if (payload.Password !== undefined) {
        formData.append("Password", payload.Password);
    }
    if (payload.Fullname !== undefined) {
        formData.append("Fullname", payload.Fullname);
    }
    if (payload.EmergencyContactName !== undefined) {
        formData.append("EmergencyContactName", payload.EmergencyContactName);
    }
    if (payload.EmergencyContactPhone !== undefined) {
        formData.append("EmergencyContactPhone", payload.EmergencyContactPhone);
    }
    if (payload.ProfileAvatar !== undefined && payload.ProfileAvatar !== null) {
        // In React Native, if ProfileAvatar is a local file URI, format it correctly for FormData
        if (payload.ProfileAvatar.startsWith("file://") || payload.ProfileAvatar.startsWith("content://")) {
            // Extract file extension from URI to determine type
            const uri = payload.ProfileAvatar;
            const extension = uri.split('.').pop()?.toLowerCase() || 'jpg';
            const mimeType = extension === 'png' ? 'image/png' : 
                           extension === 'jpeg' || extension === 'jpg' ? 'image/jpeg' : 
                           'image/jpeg';
            
            // Format for React Native FormData
            formData.append("ProfileAvatar", {
                uri: uri,
                type: mimeType,
                name: `avatar.${extension}`,
            } as any);
        } else {
            // This might be a URL or base64 string - append as string
            formData.append("ProfileAvatar", payload.ProfileAvatar);
        }
    }
    
    return formData;
}

/**
 * Edit user thunk that accepts id and optional fields, converts to FormData
 */
export const editUser = createAsyncThunk<
    GenericResponse<boolean>,
    EditUserPayload,
    { rejectValue: string }
>("editUser", async (payload, { rejectWithValue }) => {
    if (!payload.id || payload.id.trim() === "") {
        return rejectWithValue("User ID is required");
    }

    const url = `/${USER_PATH}/${payload.id}`;
    const formData = createEditUserFormData(payload);

    try {
        const response = await axiosInstance.patch<GenericResponse<boolean>>(
            url,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        console.log(`[Thunk] Response:`, response.data);
        return response.data;
    } catch (err) {
        const error = err as unknown as {
            response?: { data?: { message?: string } };
            message?: string;
        };

        console.log(`[Thunk Error] PATCH ${url}:`, error);

        let message = "";
        if (error.response?.data?.message) {
            message = error.response.data.message;
        } else if (error.message) {
            message = error.message;
        } else {
            message = "Đã xảy ra lỗi. Vui lòng thử lại.";
        }

        return rejectWithValue(message);
    }
});

export const getLicenseValidity = createThunk<
    boolean,
    void
>(
    HttpMethod.GET,
    "getLicenseValidity",
    `/${NOVICE_DRIVER_PATH}/license-validity`
);


export const getNoviceDriverAddresses = createThunk<
    INoviceDriverAddress[],
    void
>(
    HttpMethod.GET,
    "getNoviceDriverAddresses",
    `/${USER_PATH}/address`
);

/**
 * Payload for updating instructor details
 */
export interface UpdateInstructorPayload {
    id: string;
    bio?: string;
    experienceYear?: number;
}

/**
 * Helper function to convert UpdateInstructorPayload to FormData
 */
function createUpdateInstructorFormData(payload: UpdateInstructorPayload): FormData {
    const formData = new FormData();
    
    if (payload.bio !== undefined) {
        formData.append("Bio", payload.bio);
    }
    if (payload.experienceYear !== undefined) {
        formData.append("ExperienceYear", payload.experienceYear.toString());
    }
    
    return formData;
}

/**
 * Update instructor thunk that accepts id and optional fields, converts to FormData
 * PATCH /instructors/{id}
 */
export const updateInstructor = createAsyncThunk<
    GenericResponse<InstructorDetailDTO>,
    UpdateInstructorPayload,
    { rejectValue: string }
>("updateInstructor", async (payload, { rejectWithValue }) => {
    if (!payload.id || payload.id.trim() === "") {
        return rejectWithValue("Instructor ID is required");
    }

    const url = `/${INSTRUCTOR_PATH}/${payload.id}`;
    const formData = createUpdateInstructorFormData(payload);

    try {
        const response = await axiosInstance.patch<GenericResponse<InstructorDetailDTO>>(
            url,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        console.log(`[Thunk] Response:`, response.data);
        return response.data;
    } catch (err) {
        const error = err as unknown as {
            response?: { data?: { message?: string } };
            message?: string;
        };

        console.log(`[Thunk Error] PATCH ${url}:`, error);

        let message = "";
        if (error.response?.data?.message) {
            message = error.response.data.message;
        } else if (error.message) {
            message = error.message;
        } else {
            message = "Đã xảy ra lỗi. Vui lòng thử lại.";
        }

        return rejectWithValue(message);
    }
});

