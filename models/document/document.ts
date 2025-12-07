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

