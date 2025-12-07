import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BaseState } from "@/models/generic/baseState";
import { ApplicantDocument, EmergencyContact, UserProfile, DocumentRecord } from "@/models/document/document";
import { getInstructorApplication, getUserEmergencyContact, updateUserEmergencyContact } from "./documentThunk";
import { IUserInfo } from "@/models/user/user.type";

export interface DocumentState extends BaseState {
  application: ApplicantDocument | null;
  emergencyContact: EmergencyContact | null;
  user: IUserInfo | null;
  userProfile: UserProfile | null;
  documentRecords: DocumentRecord[];
}

const initialState: DocumentState = {
  isLoading: false,
  errorMessage: null,
  isSuccess: false,
  application: null,
  emergencyContact: null,
  user: null,
  userProfile: null,
  documentRecords: [],
};

const documentSlice = createSlice({
  name: "document",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.errorMessage = action.payload;
      if (action.payload) {
        state.isLoading = false;
      }
    },
    setSuccess: (state, action: PayloadAction<boolean>) => {
      state.isSuccess = action.payload;
    },
    setApplication: (state, action: PayloadAction<ApplicantDocument | null>) => {
      state.application = action.payload;
    },
    clearApplication: (state) => {
      state.application = null;
    },
    clearError: (state) => {
      state.errorMessage = null;
    },
    setEmergencyContact: (state, action: PayloadAction<EmergencyContact | null>) => {
      state.emergencyContact = action.payload;
    },
    clearEmergencyContact: (state) => {
      state.emergencyContact = null;
    },
    setUser: (state, action: PayloadAction<IUserInfo | null>) => {
      state.user = action.payload;
    },
    setUserProfile: (state, action: PayloadAction<UserProfile | null>) => {
      state.userProfile = action.payload;
    },
    updateUserProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.userProfile) {
        state.userProfile = { ...state.userProfile, ...action.payload };
      }
    },
    setDocumentRecords: (state, action: PayloadAction<DocumentRecord[]>) => {
      state.documentRecords = action.payload;
    },
    clearDocumentData: (state) => {
      state.user = null;
      state.userProfile = null;
      state.documentRecords = [];
      state.application = null;
      state.emergencyContact = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getInstructorApplication.pending, (state) => {
        state.isLoading = true;
        state.errorMessage = null;
        state.isSuccess = false;
      })
      .addCase(getInstructorApplication.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.application = action.payload.value ?? null;
        state.errorMessage = null;
      })
      .addCase(getInstructorApplication.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.errorMessage = action.payload ?? "Đã xảy ra lỗi khi tải dữ liệu";
      })
      .addCase(getUserEmergencyContact.pending, (state) => {
        state.isLoading = true;
        state.errorMessage = null;
      })
      .addCase(getUserEmergencyContact.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // Get first item if array has 2 or more items, otherwise get the first item or null
        const contacts = action.payload.value ?? [];
        state.emergencyContact = contacts.length >= 2 ? contacts[0] : (contacts.length === 1 ? contacts[0] : null);
        state.errorMessage = null;
      })
      .addCase(getUserEmergencyContact.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.errorMessage = action.payload ?? "Đã xảy ra lỗi khi tải thông tin liên hệ khẩn cấp";
      })
      .addCase(updateUserEmergencyContact.pending, (state) => {
        state.isLoading = true;
        state.errorMessage = null;
        state.isSuccess = false;
      })
      .addCase(updateUserEmergencyContact.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.errorMessage = null;
      })
      .addCase(updateUserEmergencyContact.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.errorMessage = action.payload ?? "Đã xảy ra lỗi khi cập nhật thông tin liên hệ khẩn cấp";
      });
  },
});

export const {
  setLoading,
  setError,
  setSuccess,
  setApplication,
  clearApplication,
  clearError,
  setEmergencyContact,
  clearEmergencyContact,
  setUser,
  setUserProfile,
  updateUserProfile,
  setDocumentRecords,
  clearDocumentData,
} = documentSlice.actions;

export default documentSlice.reducer;

