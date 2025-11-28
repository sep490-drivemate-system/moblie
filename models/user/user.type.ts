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
    instructor: any | null;
    noviceDriver: any | null;
}