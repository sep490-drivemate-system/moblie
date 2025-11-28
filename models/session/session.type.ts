import { SessionStatus } from "@/models/session/session.enum";

export interface ISessionDetailDTO {
    startTime: string;
    endTime: string;
    priceForCar?: number | null;
    actualStart: string;
    actualEnd: string;
    totalDistance: number;
    averageSpeed: number;
    displayStartLocationName: string;
    startingLatitude: number;
    startingLongtitude: number;
    displayEndLocationName: string;
    endingLatitude: number;
    endingLongtitude: number;
    noviceDriverNote?: string | null;
    instructorNote?: string | null;
    status: SessionStatus;
    routeDetails?: IRouteDetailDTO[] | null;
    logDetails?: ILogDetailDTO[] | null;
}
export interface IRouteDetailDTO {
    textInstruction: string;
    streetName: string;
    latitudeStart: number;
    longitudeStart: number;
}
export interface ILogDetailDTO {
    streetName: string;
    latitude: number;
    longitude: number;
    heading: string;
    speed: number;
}
