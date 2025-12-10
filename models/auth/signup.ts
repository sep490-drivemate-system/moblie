export interface ISignUpRequest {
  email: string;
  fullname: string;
  password: string;
  confirmPassword: string;
  phone: string;
  acceptTerms: boolean;
}

export interface ISignUpResponse {
  success: boolean;
  message: string;
}

export interface IRegisterInstructorRequest {
  FullName: string;
  RawPassword: string;
  Email: string;
  PhoneNumber: string;
  Avatar: File | null;
  BirthDate: string;
  Gender: string;
  DrivingLicenseFront: File | null;
  DrivingLicenseBack: File | null;
  DrivingLicenseTier: string;
  TeachingLicenseFront: File | null;
  TeachingTier: string;
  HealthCheckup: File | null;
  PersonalProfile: File | null;
}

export interface IRegisterNoviceDriverRequest {
  email: string;
  phoneNumber: string;
  password: string;
}
