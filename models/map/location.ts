export interface ILocationCoords {
    latitude: number;
    longitude: number;
    altitude?: number | null;
    accuracy?: number | null;
    altitudeAccuracy?: number | null;
    heading?: number | null;
    speed?: number | null;
}

export interface IUserLocation {
    coords: ILocationCoords;
    timestamp: number;
}

export interface IMapRegion {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
}

export interface IMarker {
    id: string;
    coordinate: {
        latitude: number;
        longitude: number;
    };
    title: string;
    description?: string;
    type: 'user' | 'poi' | 'custom';
}

export interface ILocationError {
    code: string;
    message: string;
}
