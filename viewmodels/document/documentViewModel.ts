import { BaseViewModel } from "@/viewmodels/shared/BaseViewModel";
import { RootState } from "@/lib/redux/store";
import { getInstructorApplication, getUserEmergencyContact } from "@/features/document/documentThunk";
import { getUserById } from "@/features/user/userThunk";
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
import { ApplicantDocument, EmergencyContact } from "@/models/document/document";
import { IUserInfo } from "@/models/user/user.type";
import { UserRole } from "@/models/enum/UserRole.enum";
import { getUserIdFromToken } from "@/lib/jwt/tokenUtils";
import { Gender } from "@/models/user/gender.enum";
import * as ImagePicker from "expo-image-picker";

type DocumentState = RootState["document"];

export interface DocumentField {
  label: string;
  value: string;
}

export interface DocumentFile {
  label: string;
  imageUrl: string | null;
}

export interface DocumentRecord {
  id: string;
  title: string;
  description: string;
  updatedAt: string;
  reviewer?: string;
  fields: DocumentField[];
  files: DocumentFile[];
}

export interface UserProfile {
  avatar: string | null;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  emergencyContact: EmergencyContact | null;
}

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
      const user = userResponse.value as IUserInfo;

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
      return { user: null, application: null, emergencyContact: null };
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

    records.push({
      id: "driverLicense",
      title: "Bằng Lái Xe",
      description: "Bản sao bằng lái xe hiện hành của người dùng.",
      updatedAt: updatedAt,
      fields: [
        {
          label: "Hạng bằng lái",
          value: licenseTierValue,
        },
      ],
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
  updateEmail(email: string): void {
    const validation = this.validateEmail(email);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }
    this.dispatch(updateUserProfile({ email }));
  }

  updatePhone(phone: string): void {
    const validation = this.validatePhone(phone);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }
    const formattedPhone = this.formatPhone(phone);
    this.dispatch(updateUserProfile({ phone: formattedPhone }));
  }

  updatePassword(password: string, confirmPassword: string): void {
    const validation = this.validatePassword(password, confirmPassword);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }
    // Password is masked in UI, so we just update the display
    this.dispatch(updateUserProfile({ password: "••••••••" }));
  }

  updateEmergencyContact(name: string, phone: string): void {
    const validation = this.validateEmergencyContact(name, phone);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }
    const formattedPhone = this.formatPhone(phone);
    const currentProfile = this.getCurrentState().userProfile;
    this.dispatch(
      updateUserProfile({
        emergencyContact: {
          id: currentProfile?.emergencyContact?.id || "",
          name: name.trim(),
          phone: formattedPhone,
        },
      })
    );
  }

  updateAvatar(avatarUri: string | null): void {
    this.dispatch(updateUserProfile({ avatar: avatarUri }));
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
}

