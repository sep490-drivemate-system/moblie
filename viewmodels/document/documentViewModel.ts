import { BaseViewModel } from "@/viewmodels/shared/BaseViewModel";
import { RootState } from "@/lib/redux/store";
import { getInstructorApplication, getUserEmergencyContact, updateUserEmergencyContact, updateNoviceDriverLicense } from "@/features/document/documentThunk";
import { getUserById, editUser, updateInstructor } from "@/features/user/userThunk";
import {
  setApplication,
  setEmergencyContact,
  setLoading,
  setError,
  setSuccess,
  clearError,
  setUser,
  setUserProfile,
  updateUserProfile,
  setDocumentRecords,
} from "@/features/document/documentSlice";
import { ApplicantDocument, EmergencyContact, DocumentField, DocumentFile, DocumentRecord, UserProfile } from "@/models/document/document";
import { IUserInfo } from "@/models/user/user.type";
import { UserRole } from "@/models/enum/UserRole.enum";
import { getUserIdFromToken } from "@/lib/jwt/tokenUtils";
import { Gender } from "@/models/user/gender.enum";
import * as ImagePicker from "expo-image-picker";

type DocumentState = RootState["document"];

export class DocumentViewModel extends BaseViewModel<DocumentState> {
  /**
   * Fetch user data and application data if role is 3 (NoviceDriver)
   */
  async fetchUserAndApplication(): Promise<{
    user: IUserInfo | null;
    application: ApplicantDocument | null;
    emergencyContact: EmergencyContact | null;
  }> {
    try {
      const userId = await getUserIdFromToken();
      if (!userId || userId.trim() === "") {
        throw new Error("User ID not found");
      }

      // Fetch user data
      const userResponse = await this.dispatch(
        getUserById({ id: userId })
      ).unwrap();
      
      // Check if response value is valid
      if (!userResponse.value) {
        throw new Error("User data not found in response");
      }
      
      const user = userResponse.value as IUserInfo;
      
      // Validate user data
      if (!user || typeof user !== 'object') {
        throw new Error("Invalid user data format");
      }

      let application: ApplicantDocument | null = null;

      // Fetch application data based on role
      if (user.role === UserRole.Instructor || user.role === UserRole.NoviceDriver) {
        // Determine the ID to use for fetching application
        let applicationId: string | null = null;
        
        if (user.role === UserRole.Instructor) {
          // For Instructor role: prefer instructorId, fallback to userId
          applicationId = user.instructor?.instructorId || userId;
        } else if (user.role === UserRole.NoviceDriver) {
          // For NoviceDriver role: only use instructorId if available
          applicationId = user.instructor?.instructorId || null;
        }
        
        if (applicationId && applicationId.trim() !== "") {
          try {
            const applicationResponse = await this.dispatch(
              getInstructorApplication({ id: applicationId })
            ).unwrap();
            application = applicationResponse.value as ApplicantDocument;
            this.dispatch(setApplication(application));
          } catch (error: any) {
            // Only log error if it's not a 404 (resource not found is acceptable)
            if (error?.status !== 404 && error?.response?.status !== 404) {
              console.error("Error fetching application:", error);
            } else {
              console.log("Application not found for id:", applicationId);
            }
            // Don't throw, just continue without application
          }
        } else {
          console.log("No valid ID available for application fetch");
        }
      }

      // Fetch emergency contact - This is a separate API call from getUserById
      let emergencyContact: EmergencyContact | null = null;
      try {
        const emergencyContactResponse = await this.dispatch(
          getUserEmergencyContact({ id: userId })
        ).unwrap();
        const contacts = emergencyContactResponse.value ?? [];
        console.log("Emergency contacts received:", contacts);
        // If array has 2 or more items, get the first item. Otherwise get the first item if exists, or null
        if (contacts.length > 0) {
          emergencyContact = contacts[0];
        }
        console.log("Selected emergency contact:", emergencyContact);
        this.dispatch(setEmergencyContact(emergencyContact));
      } catch (error) {
        console.error("Error fetching emergency contact:", error);
        // Don't throw, just continue without emergency contact
      }

      // Validate user data before updating state
      if (!user.email || typeof user.email !== 'string') {
        console.warn("Invalid email in user data:", user.email);
      }
      if (!user.phone || typeof user.phone !== 'string') {
        console.warn("Invalid phone in user data:", user.phone);
      }
      
      // Update state
      this.dispatch(setUser(user));
      
      const profile = this.transformUserToProfile(user, emergencyContact);
      this.dispatch(setUserProfile(profile));

      // Transform documents based on role
      let records: DocumentRecord[] = [];
      if (user.role === UserRole.Instructor) {
        records = this.transformUserToDocumentRecords(user, application);
      } else if (user.role === UserRole.NoviceDriver) {
        // For role 3, always show driver license
        if (application) {
          records = this.transformApplicationToDocumentRecord(application, user.role);
        } else {
          // If no application, create driver license record from user data or empty
          records = this.createDriverLicenseRecordForNoviceDriver(user);
        }
      }
      this.dispatch(setDocumentRecords(records));

      return { user, application, emergencyContact };
    } catch (error) {
      console.error("Error fetching user and application:", error);
      // Re-throw the error so caller knows refresh failed
      throw error;
    }
  }

  /**
   * Load initial data and update state
   */
  async loadData(): Promise<void> {
    this.dispatch(setLoading(true));
    try {
      await this.fetchUserAndApplication();
    } catch (error) {
      console.error("Error loading data:", error);
      this.dispatch(setError("Không thể tải dữ liệu. Vui lòng thử lại."));
    } finally {
      this.dispatch(setLoading(false));
    }
  }

  /**
   * Transform user data to UserProfile format for UI
   */
  transformUserToProfile(user: IUserInfo, emergencyContact?: EmergencyContact | null): UserProfile {
    return {
      avatar: user.avatarUrl || null,
      fullName: user.fullName || "",
      email: user.email || "",
      phone: user.phone || "",
      password: "••••••••",
      emergencyContact: emergencyContact || null,
    };
  }
  transformApplicationToDocumentRecord(
    application: ApplicantDocument,
    role?: UserRole
  ): DocumentRecord[] {
    if (!application) return [];
    const records: DocumentRecord[] = [];
    const submitDate = application.submitDate
      ? new Date(application.submitDate).toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }) +
        " - " +
        new Date(application.submitDate).toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

    // Driver License - Always shown for role 3
    // For role 3 (NoviceDriver): only front image
    // For role 4 (Instructor): front + back images
    const driverLicenseFiles: DocumentFile[] = [
      {
        label: "Ảnh mặt trước",
        imageUrl: application.drivingLicenseFront || null,
      },
    ];
    
    // Only add back image for role 4 (Instructor)
    if (role === UserRole.Instructor) {
      driverLicenseFiles.push({
        label: "Ảnh mặt sau",
        imageUrl: application.drivingLicenseBack || null,
      });
    }
    
    // For role 3 (NoviceDriver), don't include "Hạng bằng lái" field
    const driverLicenseFields: DocumentField[] = [];
    if (role !== UserRole.NoviceDriver) {
      driverLicenseFields.push({
        label: "Hạng bằng lái",
        value: this.getLicenseTierText(application.drivingLicenseTier),
      });
    }
    
    records.push({
      id: "driverLicense",
      title: "Bằng Lái Xe",
      description: "Bản sao bằng lái xe hiện hành của người dùng.",
      updatedAt: submitDate,
      fields: driverLicenseFields,
      files: driverLicenseFiles,
    });

    // For role 3 (NoviceDriver), only return driver license
    if (role === UserRole.NoviceDriver) {
      return records;
    }

    // Teaching License - Only for role 4
    if (application.teachingLicenseFront) {
      records.push({
        id: "teachingLicense",
        title: "Chứng Chỉ Hành Nghề",
        description: "Chứng chỉ hành nghề giảng dạy lái xe của người dùng.",
        updatedAt: submitDate,
        fields: [
          {
            label: "Hạng xe được đào tạo giảng dạy",
            value: this.getLicenseTierText(application.teachingLicenseTier),
          },
        ],
        files: [
          {
            label: "Ảnh chứng chỉ hành nghề",
            imageUrl: application.teachingLicenseFront || null,
          },
        ],
      });
    }

      // Health Checkup - Only for role 4
      if (application.healthCheckup) {
        records.push({
          id: "healthCheckup",
          title: "Giấy Khám Sức Khỏe",
          description: "Giấy khám sức khỏe để đảm bảo đủ điều kiện sức khỏe lái xe.",
          updatedAt: submitDate,
          fields: [],
          files: [
            {
              label: "Ảnh giấy khám sức khỏe",
              imageUrl: application.healthCheckup || null,
            },
          ],
        });
      }

      // Personal Profile (Lý lịch tư pháp) - Only for role 4
      if (application.personalProfile) {
        records.push({
          id: "personalProfile",
          title: "Lý lịch tư pháp",
          description: "Lý lịch tư pháp của người dùng.",
          updatedAt: submitDate,
          fields: [],
          files: [
            {
              label: "Ảnh lý lịch tư pháp",
              imageUrl: application.personalProfile || null,
            },
          ],
        });
      }

    return records;
  }

  /**
   * Create driver license record for NoviceDriver when application is not available
   */
  private createDriverLicenseRecordForNoviceDriver(user: IUserInfo): DocumentRecord[] {
    const records: DocumentRecord[] = [];
    
    // Get data from user if available
    const updatedAt = user.noviceDriver?.drivingLicenseExpirationDate
      ? new Date(user.noviceDriver.drivingLicenseExpirationDate).toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "";

    // LicenseTier is an enum with string values, use it directly
    const licenseTierValue = user.licenseTier ? String(user.licenseTier) : "";

    // For role 3 (NoviceDriver), don't include "Hạng bằng lái" field
    const driverLicenseFields: DocumentField[] = [];
    // No fields for role 3
    
    records.push({
      id: "driverLicense",
      title: "Bằng Lái Xe",
      description: "Bản sao bằng lái xe hiện hành của người dùng.",
      updatedAt: updatedAt,
      fields: driverLicenseFields,
      files: [
        {
          label: "Ảnh mặt trước",
          imageUrl: user.noviceDriver?.drivingLicense || null,
        },
        // Role 3 (NoviceDriver) only shows front image, no back image
      ],
    });

    return records;
  }

  /**
   * Helper to convert Gender enum or string to Vietnamese text
   */
  private getGenderText(gender: Gender | string | undefined): string {
    if (gender === undefined || gender === null) {
      return "";
    }
    
    // Handle string values from API
    if (typeof gender === "string") {
      if (gender === "Male") {
        return "Nam";
      }
      if (gender === "Female") {
        return "Nữ";
      }
      return "";
    }
    
    // Handle Gender enum values
    switch (gender) {
      case Gender.Male:
        return "Nam";
      case Gender.Female:
        return "Nữ";
      default:
        return "";
    }
  }

  /**
   * Transform user data to DocumentRecord array for role 4 (Instructor)
   * This should return all document records
   */
  transformUserToDocumentRecords(user: IUserInfo, application?: ApplicantDocument | null): DocumentRecord[] {
    const records: DocumentRecord[] = [];

    // Citizen ID - Use application data when role is 4 and application exists
    const citizenName = application?.fullname || user.fullName || "";
    const citizenBirthDate = application?.birthDate || user.birthDate || "";
    const citizenGender = application?.gender ? this.getGenderText(application.gender) : "";

    records.push({
      id: "citizenId",
      title: "Căn Cước Công Dân",
      description:
        "Thông tin nhận dạng bắt buộc để xác thực tài khoản người dùng.",
      updatedAt: citizenBirthDate
        ? new Date(citizenBirthDate).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
        : "",
      fields: [
        { label: "Họ và tên", value: citizenName },
        {
          label: "Ngày sinh",
          value: citizenBirthDate
            ? new Date(citizenBirthDate).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })
            : "",
        },
        {
          label: "Giới tính",
          value: citizenGender,
        },
      ],
      files: [],
    });

    // If application data exists, use it for documents
    if (application) {
      const submitDate = application.submitDate
        ? new Date(application.submitDate).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }) +
          " - " +
          new Date(application.submitDate).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "";

      // Driver License from application
      records.push({
        id: "driverLicense",
        title: "Bằng Lái Xe",
        description: "Bản sao bằng lái xe hiện hành của người dùng.",
        updatedAt: submitDate,
        fields: [
          {
            label: "Hạng bằng lái",
            value: this.getLicenseTierText(application.drivingLicenseTier),
          },
        ],
        files: [
          {
            label: "Ảnh mặt trước",
            imageUrl: application.drivingLicenseFront || null,
          },
          {
            label: "Ảnh mặt sau",
            imageUrl: application.drivingLicenseBack || null,
          },
        ],
      });

      // Teaching License from application - Always show for Instructor role
      records.push({
        id: "teachingLicense",
        title: "Chứng Chỉ Hành Nghề",
        description: "Chứng chỉ hành nghề giảng dạy lái xe của người dùng.",
        updatedAt: submitDate,
        fields: [
          {
            label: "Hạng xe được đào tạo giảng dạy",
            value: application.teachingLicenseTier 
              ? this.getLicenseTierText(application.teachingLicenseTier)
              : "",
          },
        ],
        files: [
          {
            label: "Ảnh chứng chỉ hành nghề",
            imageUrl: application.teachingLicenseFront || null,
          },
        ],
      });

      // Health Checkup from application - Always show for Instructor role
      records.push({
        id: "healthCheckup",
        title: "Giấy Khám Sức Khỏe",
        description: "Giấy khám sức khỏe để đảm bảo đủ điều kiện sức khỏe lái xe.",
        updatedAt: submitDate,
        fields: [],
        files: [
          {
            label: "Ảnh giấy khám sức khỏe",
            imageUrl: application.healthCheckup || null,
          },
        ],
      });

      // Personal Profile (Lý lịch tư pháp) from application - Always show for Instructor role
      records.push({
        id: "personalProfile",
        title: "Lý lịch tư pháp",
        description: "Lý lịch tư pháp của người dùng.",
        updatedAt: submitDate,
        fields: [],
        files: [
          {
            label: "Ảnh lý lịch tư pháp",
            imageUrl: application.personalProfile || null,
          },
        ],
      });
    } else {
      // Fallback to user data if application is not available
      // Driver License from user data
      if (user.noviceDriver?.drivingLicense) {
        records.push({
          id: "driverLicense",
          title: "Bằng Lái Xe",
          description: "Bản sao bằng lái xe hiện hành của người dùng.",
          updatedAt: user.noviceDriver.drivingLicenseExpirationDate
            ? new Date(
                user.noviceDriver.drivingLicenseExpirationDate
              ).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })
            : "",
          fields: [
            {
              label: "Hạng bằng lái",
              value: user.licenseTier || "",
            },
          ],
          files: [
            {
              label: "Ảnh mặt trước",
              imageUrl: user.noviceDriver.drivingLicense || null,
            },
            {
              label: "Ảnh mặt sau",
              imageUrl: null, // Back image might not be in user data
            },
          ],
        });
      } else {
        // Show empty driver license if no data available
        records.push({
          id: "driverLicense",
          title: "Bằng Lái Xe",
          description: "Bản sao bằng lái xe hiện hành của người dùng.",
          updatedAt: "",
          fields: [
            {
              label: "Hạng bằng lái",
              value: "",
            },
          ],
          files: [
            {
              label: "Ảnh mặt trước",
              imageUrl: null,
            },
            {
              label: "Ảnh mặt sau",
              imageUrl: null,
            },
          ],
        });
      }

      // Teaching License - Always show for Instructor role even if no application
      records.push({
        id: "teachingLicense",
        title: "Chứng Chỉ Hành Nghề",
        description: "Chứng chỉ hành nghề giảng dạy lái xe của người dùng.",
        updatedAt: "",
        fields: [
          {
            label: "Hạng xe được đào tạo giảng dạy",
            value: "",
          },
        ],
        files: [
          {
            label: "Ảnh chứng chỉ hành nghề",
            imageUrl: null,
          },
        ],
      });

      // Health Checkup - Always show for Instructor role even if no application
      records.push({
        id: "healthCheckup",
        title: "Giấy Khám Sức Khỏe",
        description: "Giấy khám sức khỏe để đảm bảo đủ điều kiện sức khỏe lái xe.",
        updatedAt: "",
        fields: [],
        files: [
          {
            label: "Ảnh giấy khám sức khỏe",
            imageUrl: null,
          },
        ],
      });

      // Personal Profile (Lý lịch tư pháp) - Always show for Instructor role even if no application
      records.push({
        id: "personalProfile",
        title: "Lý lịch tư pháp",
        description: "Lý lịch tư pháp của người dùng.",
        updatedAt: "",
        fields: [],
        files: [
          {
            label: "Ảnh lý lịch tư pháp",
            imageUrl: null,
          },
        ],
      });
    }

    return records;
  }

  /**
   * Helper to convert license tier number to text
   */
  private getLicenseTierText(tier: number): string {
    const tierMap: { [key: number]: string } = {
      1: "B1",
      2: "B2",
      3: "C",
      4: "D",
      5: "E",
      6: "F",
    };
    return tierMap[tier] || `Hạng ${tier}`;
  }

  /**
   * Get current application from state
   */
  getApplication(): ApplicantDocument | null {
    return this.getCurrentState().application;
  }

  /**
   * Clear error message
   */
  clearErrorMessage(): void {
    this.dispatch(clearError());
  }

  /**
   * Refresh application data for role 3
   */
  async refreshApplication(instructorId: string): Promise<void> {
    await this.executeAsync(
      async () => {
        const response = await this.dispatch(
          getInstructorApplication({ id: instructorId })
        ).unwrap();
        const application = response.value as ApplicantDocument;
        this.dispatch(setApplication(application));
        return application;
      },
      () => {
        console.log("Application refreshed successfully");
      },
      (error) => {
        console.error("Failed to refresh application:", error);
      },
      {
        setLoading,
        setError,
        setSuccess,
      }
    );
  }

  /**
   * Validation methods
   */
  validateEmail(email: string): { isValid: boolean; error?: string } {
    if (!email.trim()) {
      return { isValid: false, error: "Email không được để trống" };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, error: "Email không đúng định dạng" };
    }
    return { isValid: true };
  }

  validatePhone(phone: string): { isValid: boolean; error?: string } {
    const phoneDigits = phone.replace(/\D/g, "");
    if (!phoneDigits || phoneDigits.length !== 10) {
      return { isValid: false, error: "Số điện thoại phải có đủ 10 chữ số" };
    }
    return { isValid: true };
  }

  validatePassword(password: string, confirmPassword?: string): { isValid: boolean; error?: string } {
    if (!password.trim()) {
      return { isValid: false, error: "Mật khẩu không được để trống" };
    }
    if (password.length < 6) {
      return { isValid: false, error: "Mật khẩu phải có ít nhất 6 ký tự" };
    }
    if (confirmPassword !== undefined && password !== confirmPassword) {
      return { isValid: false, error: "Mật khẩu xác nhận không khớp" };
    }
    return { isValid: true };
  }

  validateEmergencyContact(name: string, phone: string): { isValid: boolean; error?: string } {
    if (!name.trim()) {
      return { isValid: false, error: "Tên người liên hệ không được để trống" };
    }
    const phoneValidation = this.validatePhone(phone);
    if (!phoneValidation.isValid) {
      return phoneValidation;
    }
    return { isValid: true };
  }

  /**
   * Formatting methods
   */
  formatPhone(phone: string): string {
    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length === 10) {
      return phoneDigits.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3");
    }
    return phone;
  }

  /**
   * Image picker methods
   */
  async pickImageFromCamera(): Promise<string | null> {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (permissionResult.granted === false) {
        throw new Error("Cần quyền truy cập camera để chụp ảnh");
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        return result.assets[0].uri;
      }
      return null;
    } catch (error) {
      console.error("Error picking image from camera:", error);
      throw error;
    }
  }

  async pickImageFromLibrary(): Promise<string | null> {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        throw new Error("Cần quyền truy cập thư viện ảnh");
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        return result.assets[0].uri;
      }
      return null;
    } catch (error) {
      console.error("Error picking image from library:", error);
      throw error;
    }
  }

  /**
   * Update profile methods
   */
  async updateEmail(email: string): Promise<void> {
    const validation = this.validateEmail(email);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }
    
    try {
      const userId = await getUserIdFromToken();
      if (!userId || userId.trim() === "") {
        throw new Error("User ID not found");
      }

      this.dispatch(setLoading(true));
      this.dispatch(setError(null));

      try {
        const response = await this.dispatch(
          editUser({
            id: userId,
            Email: email ,
          })
        ).unwrap();
        
        console.log("[updateEmail] API Response:", response);
        
        // Check if update was successful
        if (!response.value) {
          throw new Error("Cập nhật email thất bại");
        }
        
        // Optimistically update the state immediately
        this.dispatch(updateUserProfile({ email: email }));
        
        // Also update the user object in state
        const currentUser = this.getCurrentState().user;
        if (currentUser) {
          this.dispatch(setUser({ ...currentUser, email: email }));
        }
        
        // Refresh user data from server to ensure consistency
        // Wait a bit to ensure server has processed the update
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        try {
          await this.fetchUserAndApplication();
        } catch (refreshError) {
          // If refresh fails, the optimistic update is already in place
          console.warn("[updateEmail] Failed to refresh from server, but optimistic update is applied:", refreshError);
        }
        
        // Verify the update was reflected in the fetched data
        const updatedProfile = this.getCurrentState().userProfile;
        console.log("[updateEmail] Updated profile:", updatedProfile);
        
        this.dispatch(setSuccess(true));
        this.dispatch(setLoading(false));
      } catch (error: any) {
        this.dispatch(setLoading(false));
        const errorMessage = error?.message || error || "Không thể cập nhật email";
        this.dispatch(setError(errorMessage));
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error?.message || "Không thể cập nhật email";
      throw new Error(errorMessage);
    }
  }

  async updatePhone(phone: string): Promise<void> {
    const validation = this.validatePhone(phone);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }
    
    try {
      const userId = await getUserIdFromToken();
      if (!userId || userId.trim() === "") {
        throw new Error("User ID not found");
      }

      const phoneDigits = phone.replace(/\D/g, "");
      
      this.dispatch(setLoading(true));
      this.dispatch(setError(null));

      try {
        const response = await this.dispatch(
          editUser({
            id: userId,
            PhoneNumber: phoneDigits ,
          })
        ).unwrap();
        
        console.log("[updatePhone] API Response:", response);
        
        // Check if update was successful
        if (!response.value) {
          throw new Error("Cập nhật số điện thoại thất bại");
        }
        
        // Optimistically update the state immediately
        this.dispatch(updateUserProfile({ phone: phoneDigits }));
        
        // Also update the user object in state
        const currentUser = this.getCurrentState().user;
        if (currentUser) {
          this.dispatch(setUser({ ...currentUser, phone: phoneDigits }));
        }
        
        // Refresh user data from server to ensure consistency
        // Wait a bit to ensure server has processed the update
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        try {
          await this.fetchUserAndApplication();
        } catch (refreshError) {
          // If refresh fails, the optimistic update is already in place
          console.warn("[updatePhone] Failed to refresh from server, but optimistic update is applied:", refreshError);
        }
        
        // Verify the update was reflected in the fetched data
        const updatedProfile = this.getCurrentState().userProfile;
        console.log("[updatePhone] Updated profile:", updatedProfile);
        
        this.dispatch(setSuccess(true));
        this.dispatch(setLoading(false));
      } catch (error: any) {
        this.dispatch(setLoading(false));
        const errorMessage = error?.message || error || "Không thể cập nhật số điện thoại";
        this.dispatch(setError(errorMessage));
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error?.message || "Không thể cập nhật số điện thoại";
      throw new Error(errorMessage);
    }
  }

  async updatePassword(password: string, confirmPassword: string): Promise<void> {
    const validation = this.validatePassword(password, confirmPassword);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }
    
    try {
      const userId = await getUserIdFromToken();
      if (!userId || userId.trim() === "") {
        throw new Error("User ID not found");
      }

      this.dispatch(setLoading(true));
      this.dispatch(setError(null));

      try {
        const response = await this.dispatch(
          editUser({
            id: userId,
            Password: password ,
          })
        ).unwrap();
        
        console.log("[updatePassword] API Response:", response);
        
        // Check if update was successful
        if (!response.value) {
          throw new Error("Cập nhật mật khẩu thất bại");
        }
        
        // Optimistically update the state immediately - Password is masked in UI
        this.dispatch(updateUserProfile({ password: "••••••••" }));
        
        // Refresh user data from server to ensure consistency
        // Wait a bit to ensure server has processed the update
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        try {
          await this.fetchUserAndApplication();
        } catch (refreshError) {
          // If refresh fails, the optimistic update is already in place
          console.warn("[updatePassword] Failed to refresh from server, but optimistic update is applied:", refreshError);
        }
        
        // Verify the update was reflected in the fetched data
        const updatedProfile = this.getCurrentState().userProfile;
        console.log("[updatePassword] Updated profile:", updatedProfile);
        
        this.dispatch(setSuccess(true));
        this.dispatch(setLoading(false));
      } catch (error: any) {
        this.dispatch(setLoading(false));
        const errorMessage = error?.message || error || "Không thể cập nhật mật khẩu";
        this.dispatch(setError(errorMessage));
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error?.message || "Không thể cập nhật mật khẩu";
      throw new Error(errorMessage);
    }
  }

  async updateEmergencyContactName(name: string): Promise<void> {
    if (!name.trim()) {
      throw new Error("Tên người liên hệ không được để trống");
    }
    
    try {
      const currentProfile = this.getCurrentState().userProfile;
      const currentPhone = currentProfile?.emergencyContact?.phone || "";
      
      // Get phone digits from current phone (remove formatting)
      const phoneDigits = currentPhone.replace(/\D/g, "") || "";
      
      const userId = await getUserIdFromToken();
      if (!userId || userId.trim() === "") {
        throw new Error("User ID not found");
      }
      
      this.dispatch(setLoading(true));
      this.dispatch(setError(null));

      try {
        // Use editUser API for both role 3 (NoviceDriver) and role 4 (Instructor)
        const response = await this.dispatch(
          editUser({
            id: userId,
            EmergencyContactName: name.trim(),
          })
        ).unwrap();
        
        console.log("[updateEmergencyContactName] API Response:", response);
        
        // Check if update was successful
        if (!response.value) {
          throw new Error("Cập nhật tên người liên hệ thất bại");
        }
        
        // Refresh to get the actual emergency contact data
        await new Promise(resolve => setTimeout(resolve, 1000));
        try {
          await this.fetchUserAndApplication();
        } catch (refreshError) {
          console.warn("[updateEmergencyContactName] Failed to refresh from server:", refreshError);
        }
        
        // Get the updated emergency contact from refreshed data
        const refreshedProfile = this.getCurrentState().userProfile;
        const refreshedEmergencyContact = refreshedProfile?.emergencyContact;
        
        // Optimistically update the state immediately
        const formattedPhone = currentPhone || (phoneDigits ? this.formatPhone(phoneDigits) : "");
        const emergencyContactId = refreshedEmergencyContact?.id || "";
        
        if (emergencyContactId) {
          this.dispatch(
            updateUserProfile({
              emergencyContact: {
                id: emergencyContactId,
                name: name.trim(),
                phone: formattedPhone,
              },
            })
          );
          
          // Also update emergencyContact in state
          this.dispatch(
            setEmergencyContact({
              id: emergencyContactId,
              name: name.trim(),
              phone: formattedPhone,
            })
          );
        }
        
        const updatedProfile = this.getCurrentState().userProfile;
        console.log("[updateEmergencyContactName] Updated profile:", updatedProfile);
        
        this.dispatch(setSuccess(true));
        this.dispatch(setLoading(false));
      } catch (error: any) {
        this.dispatch(setLoading(false));
        const errorMessage = error?.message || error || "Không thể cập nhật tên người liên hệ";
        this.dispatch(setError(errorMessage));
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error?.message || "Không thể cập nhật tên người liên hệ";
      throw new Error(errorMessage);
    }
  }

  async updateEmergencyContactPhone(phone: string): Promise<void> {
    const phoneValidation = this.validatePhone(phone);
    if (!phoneValidation.isValid) {
      throw new Error(phoneValidation.error);
    }
    
    try {
      const currentProfile = this.getCurrentState().userProfile;
      const currentName = currentProfile?.emergencyContact?.name || "";
      
      const phoneDigits = phone.replace(/\D/g, "");
      
      const userId = await getUserIdFromToken();
      if (!userId || userId.trim() === "") {
        throw new Error("User ID not found");
      }
      
      this.dispatch(setLoading(true));
      this.dispatch(setError(null));

      try {
        // Use editUser API for both role 3 (NoviceDriver) and role 4 (Instructor)
        const response = await this.dispatch(
          editUser({
            id: userId,
            EmergencyContactName: currentName || undefined,
            EmergencyContactPhone: phoneDigits,
          })
        ).unwrap();
        
        console.log("[updateEmergencyContactPhone] API Response:", response);
        
        // Check if update was successful
        if (!response.value) {
          throw new Error("Cập nhật số điện thoại liên hệ khẩn cấp thất bại");
        }
        
        // Refresh to get the actual emergency contact data
        await new Promise(resolve => setTimeout(resolve, 1000));
        try {
          await this.fetchUserAndApplication();
        } catch (refreshError) {
          console.warn("[updateEmergencyContactPhone] Failed to refresh from server:", refreshError);
        }
        
        // Get the updated emergency contact from refreshed data
        const refreshedProfile = this.getCurrentState().userProfile;
        const refreshedEmergencyContact = refreshedProfile?.emergencyContact;
        
        // Optimistically update the state immediately
        const formattedPhone = this.formatPhone(phoneDigits);
        const emergencyContactId = refreshedEmergencyContact?.id || "";
        
        if (emergencyContactId) {
          this.dispatch(
            updateUserProfile({
              emergencyContact: {
                id: emergencyContactId,
                name: currentName,
                phone: formattedPhone,
              },
            })
          );
          
          // Also update emergencyContact in state
          this.dispatch(
            setEmergencyContact({
              id: emergencyContactId,
              name: currentName,
              phone: formattedPhone,
            })
          );
        }
        
        const updatedProfile = this.getCurrentState().userProfile;
        console.log("[updateEmergencyContactPhone] Updated profile:", updatedProfile);
        
        this.dispatch(setSuccess(true));
        this.dispatch(setLoading(false));
      } catch (error: any) {
        this.dispatch(setLoading(false));
        const errorMessage = error?.message || error || "Không thể cập nhật số điện thoại liên hệ khẩn cấp";
        this.dispatch(setError(errorMessage));
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error?.message || "Không thể cập nhật số điện thoại liên hệ khẩn cấp";
      throw new Error(errorMessage);
    }
  }

  async updateAvatar(avatarUri: string | null): Promise<void> {
    try {
      const userId = await getUserIdFromToken();
      if (!userId || userId.trim() === "") {
        throw new Error("User ID not found");
      }

      // If avatarUri is null, we might want to clear the avatar
      // For now, we'll only update if there's a URI
      if (avatarUri) {
        this.dispatch(setLoading(true));
        this.dispatch(setError(null));

        try {
          const response = await this.dispatch(
            editUser({
              id: userId,
              ProfileAvatar: avatarUri ,
            })
          ).unwrap();
          
          console.log("[updateAvatar] API Response:", response);
          
          // Check if update was successful
          if (!response.value) {
            throw new Error("Cập nhật ảnh đại diện thất bại");
          }
          
          // Optimistically update the state immediately
          this.dispatch(updateUserProfile({ avatar: avatarUri }));
          
          // Also update the user object in state
          const currentUser = this.getCurrentState().user;
          if (currentUser) {
            this.dispatch(setUser({ ...currentUser, avatarUrl: avatarUri }));
          }
          
          // Refresh user data from server to ensure consistency
          // Wait a bit to ensure server has processed the update
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          try {
            await this.fetchUserAndApplication();
          } catch (refreshError) {
            // If refresh fails, the optimistic update is already in place
            console.warn("[updateAvatar] Failed to refresh from server, but optimistic update is applied:", refreshError);
          }
          
          // Verify the update was reflected in the fetched data
          const updatedProfile = this.getCurrentState().userProfile;
          console.log("[updateAvatar] Updated profile:", updatedProfile);
          
          this.dispatch(setSuccess(true));
          this.dispatch(setLoading(false));
        } catch (error: any) {
          this.dispatch(setLoading(false));
          const errorMessage = error?.message || error || "Không thể cập nhật ảnh đại diện";
          this.dispatch(setError(errorMessage));
          throw new Error(errorMessage);
        }
      } else {
        // If avatarUri is null, just update local state (clearing avatar)
        this.dispatch(updateUserProfile({ avatar: null }));
      }
    } catch (error: any) {
      const errorMessage = error?.message || "Không thể cập nhật ảnh đại diện";
      throw new Error(errorMessage);
    }
  }

  /**
   * Get current user profile from state
   */
  getUserProfile(): UserProfile | null {
    return this.getCurrentState().userProfile;
  }

  /**
   * Get current user from state
   */
  getUser(): IUserInfo | null {
    return this.getCurrentState().user;
  }

  /**
   * Get document records from state
   */
  getDocumentRecords(): DocumentRecord[] {
    return this.getCurrentState().documentRecords;
  }

  /**
   * Update instructor bio
   */
  async updateInstructorBio(bio: string): Promise<void> {
    try {
      const currentUser = this.getCurrentState().user;
      if (!currentUser || !currentUser.instructor) {
        throw new Error("Instructor information not found");
      }

      const instructorId = currentUser.instructor.instructorId;
      if (!instructorId || instructorId.trim() === "") {
        throw new Error("Instructor ID not found");
      }

      this.dispatch(setLoading(true));
      this.dispatch(setError(null));

      try {
        const response = await this.dispatch(
          updateInstructor({
            id: instructorId,
            bio: bio,
          })
        ).unwrap();
        
        console.log("[updateInstructorBio] API Response:", response);
        
        // Check if update was successful
        if (!response.value) {
          throw new Error("Cập nhật mô tả thất bại");
        }
        
        // Optimistically update the state immediately
        const updatedUser = { ...currentUser };
        if (updatedUser.instructor) {
          updatedUser.instructor = {
            ...updatedUser.instructor,
            bio: bio,
          };
        }
        this.dispatch(setUser(updatedUser));
        
        // Refresh user data from server to ensure consistency
        // Wait a bit to ensure server has processed the update
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        try {
          await this.fetchUserAndApplication();
        } catch (refreshError) {
          // If refresh fails, the optimistic update is already in place
          console.warn("[updateInstructorBio] Failed to refresh from server, but optimistic update is applied:", refreshError);
        }
        
        this.dispatch(setSuccess(true));
        this.dispatch(setLoading(false));
      } catch (error: any) {
        this.dispatch(setLoading(false));
        const errorMessage = error?.message || error || "Không thể cập nhật mô tả";
        this.dispatch(setError(errorMessage));
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error?.message || "Không thể cập nhật mô tả";
      throw new Error(errorMessage);
    }
  }

  /**
   * Update full name for role 3 (NoviceDriver)
   */
  async updateFullName(fullName: string): Promise<void> {
    if (!fullName.trim()) {
      throw new Error("Họ và tên không được để trống");
    }
    
    try {
      const userId = await getUserIdFromToken();
      if (!userId || userId.trim() === "") {
        throw new Error("User ID not found");
      }

      this.dispatch(setLoading(true));
      this.dispatch(setError(null));

      try {
        const response = await this.dispatch(
          editUser({
            id: userId,
            Fullname: fullName.trim(),
          })
        ).unwrap();
        
        console.log("[updateFullName] API Response:", response);
        
        // Check if update was successful
        if (!response.value) {
          throw new Error("Cập nhật họ và tên thất bại");
        }
        
        // Optimistically update the state immediately
        this.dispatch(updateUserProfile({ fullName: fullName.trim() }));
        
        // Also update the user object in state
        const currentUser = this.getCurrentState().user;
        if (currentUser) {
          this.dispatch(setUser({ ...currentUser, fullName: fullName.trim() }));
        }
        
        // Refresh user data from server to ensure consistency
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        try {
          await this.fetchUserAndApplication();
        } catch (refreshError) {
          console.warn("[updateFullName] Failed to refresh from server, but optimistic update is applied:", refreshError);
        }
        
        this.dispatch(setSuccess(true));
        this.dispatch(setLoading(false));
      } catch (error: any) {
        this.dispatch(setLoading(false));
        const errorMessage = error?.message || error || "Không thể cập nhật họ và tên";
        this.dispatch(setError(errorMessage));
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error?.message || "Không thể cập nhật họ và tên";
      throw new Error(errorMessage);
    }
  }

  /**
   * Update driver license image for role 3 (NoviceDriver)
   */
  async updateDriverLicenseImage(imageUri: string | null): Promise<void> {
    try {
      const currentUser = this.getCurrentState().user;
      if (!currentUser || currentUser.role !== UserRole.NoviceDriver) {
        throw new Error("Chỉ người dùng role 3 mới có thể cập nhật ảnh bằng lái xe");
      }

      const userId = await getUserIdFromToken();
      if (!userId || userId.trim() === "") {
        throw new Error("User ID not found");
      }

      if (imageUri) {
        this.dispatch(setLoading(true));
        this.dispatch(setError(null));

        try {
          // Use the new API PUT /novice-driver/{id}/license
          const response = await this.dispatch(
            updateNoviceDriverLicense({
              id: userId,
              image: imageUri,
            })
          ).unwrap();
          
          console.log("[updateDriverLicenseImage] API Response:", response);
          
          // Check if update was successful
          if (!response.value) {
            throw new Error("Cập nhật ảnh bằng lái xe thất bại");
          }
          
          // Refresh user data from server to ensure consistency
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          try {
            await this.fetchUserAndApplication();
          } catch (refreshError) {
            console.warn("[updateDriverLicenseImage] Failed to refresh from server:", refreshError);
          }
          
          this.dispatch(setSuccess(true));
          this.dispatch(setLoading(false));
        } catch (error: any) {
          this.dispatch(setLoading(false));
          const errorMessage = error?.message || error || "Không thể cập nhật ảnh bằng lái xe";
          this.dispatch(setError(errorMessage));
          throw new Error(errorMessage);
        }
      }
    } catch (error: any) {
      const errorMessage = error?.message || "Không thể cập nhật ảnh bằng lái xe";
      throw new Error(errorMessage);
    }
  }

  /**
   * Update license tier for role 3 (NoviceDriver)
   */
  async updateLicenseTier(licenseTier: string): Promise<void> {
    if (!licenseTier.trim()) {
      throw new Error("Hạng bằng lái không được để trống");
    }
    
    try {
      const currentUser = this.getCurrentState().user;
      if (!currentUser || currentUser.role !== UserRole.NoviceDriver) {
        throw new Error("Chỉ người dùng role 3 mới có thể cập nhật hạng bằng lái");
      }

      const userId = await getUserIdFromToken();
      if (!userId || userId.trim() === "") {
        throw new Error("User ID not found");
      }

      // Convert license tier string to number if needed
      // Based on getLicenseTierText, the mapping is: 1=B1, 2=B2, 3=C, 4=D, 5=E, 6=F
      const tierMap: { [key: string]: number } = {
        "B1": 1,
        "B2": 2,
        "C": 3,
        "D": 4,
        "E": 5,
        "F": 6,
      };
      
      const tierNumber = tierMap[licenseTier.toUpperCase()];
      if (!tierNumber) {
        throw new Error("Hạng bằng lái không hợp lệ");
      }

      this.dispatch(setLoading(true));
      this.dispatch(setError(null));

      try {
        // Note: This assumes the API accepts license tier through editUser
        // If there's a separate endpoint or field, it should be used here
        // For now, we'll need to check if there's a LicenseTier field in EditUserPayload
        const response = await this.dispatch(
          editUser({
            id: userId,
            // LicenseTier might need to be added to EditUserPayload
            // For now, this is a placeholder
          })
        ).unwrap();
        
        console.log("[updateLicenseTier] API Response:", response);
        
        // Check if update was successful
        if (!response.value) {
          throw new Error("Cập nhật hạng bằng lái thất bại");
        }
        
        // Optimistically update the state immediately
        const updatedUser = { ...currentUser };
        updatedUser.licenseTier = licenseTier as any; // Update license tier
        
        this.dispatch(setUser(updatedUser));
        
        // Refresh user data from server to ensure consistency
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        try {
          await this.fetchUserAndApplication();
        } catch (refreshError) {
          console.warn("[updateLicenseTier] Failed to refresh from server, but optimistic update is applied:", refreshError);
        }
        
        this.dispatch(setSuccess(true));
        this.dispatch(setLoading(false));
      } catch (error: any) {
        this.dispatch(setLoading(false));
        const errorMessage = error?.message || error || "Không thể cập nhật hạng bằng lái";
        this.dispatch(setError(errorMessage));
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error?.message || "Không thể cập nhật hạng bằng lái";
      throw new Error(errorMessage);
    }
  }
}

