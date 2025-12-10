export interface ApplicantDocument {
   applicationId: string,
    instructorId: string,
    fullname: string,
    email: string,
    phone: string,
    gender: string,
    birthDate: string,
    submitDate: string,
    dateUntilAutoRejection: string,
    avatar: string,
    drivingLicenseFront: string,
    drivingLicenseBack: string,
    teachingLicenseFront: string,
    teachingLicenseTier: number,
    drivingLicenseTier: number,
    healthCheckup: string,
    personalProfile: string,
    applicationStatus: number,
    trackingHistories: string[],
}

export interface EmergencyContact {
    id: string,
    name: string,
    phone: string,
}

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

export interface licenseNovice {
  image: string | null;
}