import { createThunk } from "../genericCreateThunk";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { HttpMethod } from "@/models/enum/HttpMethods";
import { ApplicantDocument, EmergencyContact, licenseNovice } from "@/models/document/document";
import { GenericResponse } from "@/models/generic/genericResponse";
import axiosInstance from "@/lib/axios/axiosInstance";

export const INSTRUCTOR_PATH = "instructors";
export const USER_PATH = "users";
export const NOVICE_DRIVER_PATH = "novice-driver";

export const getInstructorApplication = createThunk<
  ApplicantDocument,
  { id: string }
>(
  HttpMethod.GET,
  "getInstructorApplication",
  `/${INSTRUCTOR_PATH}/:id/applicants`,
  {
    buildUrl: (payload) => {
      if (!payload.id || payload.id.trim() === "") {
        throw new Error("Instructor ID is required");
      }
      return `/${INSTRUCTOR_PATH}/${payload.id}/applicants`;
    },
  }
);

export const getUserEmergencyContact = createThunk<
  EmergencyContact[],
  { id: string }
>(
  HttpMethod.GET,
  "getUserEmergencyContact",
  `/${USER_PATH}/:id/emergency-contact`,
  {
    buildUrl: (payload) => {
      if (!payload.id || payload.id.trim() === "") {
        throw new Error("User ID is required");
      }
      return `/${USER_PATH}/${payload.id}/emergency-contact`;
    },
  }
);

export const updateUserEmergencyContact = createThunk<
  boolean,
  EmergencyContact
>(
  HttpMethod.PUT,
  "updateUserEmergencyContact",
  `/${USER_PATH}/emergency-contact/:id`,
  {
    buildUrl: (payload) => {
      if (!payload.id || payload.id.trim() === "") {
        throw new Error("Emergency contact ID is required");
      }
      return `/${USER_PATH}/emergency-contact/${payload.id}`;
    },
  }
);

/**
 * Helper function to convert licenseNovice payload to FormData
 * In React Native, file URIs need to be formatted as objects with uri, type, and name
 */
function createLicenseNoviceFormData(image: string | null): FormData {
  const formData = new FormData();
  
  if (image !== null && image !== undefined) {
    // In React Native, if image is a local file URI, format it correctly for FormData
    if (image.startsWith("file://") || image.startsWith("content://")) {
      // Extract file extension from URI to determine type
      const uri = image;
      const extension = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const mimeType = extension === 'png' ? 'image/png' : 
                     extension === 'jpeg' || extension === 'jpg' ? 'image/jpeg' : 
                     'image/jpeg';
      
      // Format for React Native FormData
      formData.append("image", {
        uri: uri,
        type: mimeType,
        name: `license.${extension}`,
      } as any);
    } else {
      // This might be a URL or base64 string - append as string
      formData.append("image", image);
    }
  }
  
  return formData;
}

/**
 * Update novice driver license image
 * PUT /novice-driver/{id}/license
 * Request body: multipart/form-data with image field
 */
export const updateNoviceDriverLicense = createAsyncThunk<
  GenericResponse<licenseNovice>,
  { id: string; image: string | null },
  { rejectValue: string }
>("updateNoviceDriverLicense", async (payload, { rejectWithValue }) => {
  if (!payload.id || payload.id.trim() === "") {
    return rejectWithValue("Novice driver ID is required");
  }

  const url = `/${NOVICE_DRIVER_PATH}/${payload.id}/license`;
  const formData = createLicenseNoviceFormData(payload.image);

  try {
    const response = await axiosInstance.put<GenericResponse<licenseNovice>>(
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

    // Log error ra console để debug
    console.log(`[Thunk Error] PUT ${url}:`, error);

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

    return rejectWithValue(message);
  }
});

