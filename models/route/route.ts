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

// API Request/Response for session routes
export interface ISessionRouteItem {
  textInstruction: string;
  streetName: string;
  latitudeStart: number;
  longitudeStart: number;
}

// Response from GET session routes API
export interface ISessionRouteItemResponse {
  id: string;
  sessionId: string;
  textInstruction: string;
  streetName: string;
  latitudeStart: number;
  longitudeStart: number;
}

export interface IGetSessionRoutesResponse {
  sessionStartingLat: number;
  sessionStartingLong: number;
  routes: ISessionRouteItemResponse[];
}

export interface ISaveSessionRoutesRequest {
  sessionId: string;
  routes: ISessionRouteItem[];
}

// Wrapper for API call with sessionId in URL
export interface ISaveSessionRoutesPayload {
  sessionId: string;
  body: ISessionRouteItem[];
}
