import { LicenseTier } from "../car/car";
import { UserRole } from "../enum/UserRole.enum";

export interface IUserInfo {
    userId: string;
    avatarUrl: string;
    phone: string;
    email: string;
    fullName: string;
    licenseTier: LicenseTier;
    birthDate: string;
    role: UserRole;
    instructor: InstructorDetailDTO | null;
    noviceDriver: NoviceDriverDetailDTO | null;
}

export interface InstructorDetailDTO {
    instructorId: string;
    bio: string;
    experienceYear: number;
}

export interface NoviceDriverDetailDTO {
    noviceDriverId: string;
    drivingLicense: string;
    drivingLicenseExpirationDate: string;
}
