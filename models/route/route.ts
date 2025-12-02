export type RouteStatus = 'draft' | 'sent' | 'accepted' | 'rejected';

export interface IRoutePoint {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  order: number;
  skills: string[];
  isStart?: boolean;
  isEnd?: boolean;
}

export interface IInstructorRoute {
  id: string;
  bookingId: string;
  points: IRoutePoint[];
  status: RouteStatus;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface IRoute {
  id: string;
  name: string;
  points: IRoutePoint[];
  status: RouteStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface IRouteData {
  id: string;
  studentName: string;
  instructorName: string;
  points: IRoutePoint[];
  status: RouteStatus;
  notes?: string;
  createdAt: string;
}


export interface ISessionRoutes {
  id: string;
  sessionId: string;
  textInstruction: string;
  streetName: string;
  latitudeStart: number;
  longitudeStart: number;
}

