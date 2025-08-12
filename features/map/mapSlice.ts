import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BaseState } from '@/models/generic/baseState';
import { IUserLocation, IMapRegion, IMarker, ILocationError } from '@/models/map/location';

interface MapState extends BaseState {
    userLocation: IUserLocation | null;
    mapRegion: IMapRegion | null;
    markers: IMarker[];
    isLocationEnabled: boolean;
    isLocationLoading: boolean;
    locationError: ILocationError | null;
    hasLocationPermission: boolean;
    isFollowingUser: boolean;
}

const initialState: MapState = {
    userLocation: null,
    mapRegion: null,
    markers: [],
    isLocationEnabled: false,
    isLocationLoading: false,
    locationError: null,
    hasLocationPermission: false,
    isFollowingUser: true,
    isLoading: false,
    errorMessage: null,
    isSuccess: false,
};

const mapSlice = createSlice({
    name: 'map',
    initialState,
    reducers: {
        // Location Management
        setUserLocation: (state, action: PayloadAction<IUserLocation>) => {
            state.userLocation = action.payload;
            state.isLocationLoading = false;
            state.locationError = null;

            // Auto-update map region when following user
            if (state.isFollowingUser) {
                state.mapRegion = {
                    latitude: action.payload.coords.latitude,
                    longitude: action.payload.coords.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                };
            }
        },

        setLocationLoading: (state, action: PayloadAction<boolean>) => {
            state.isLocationLoading = action.payload;
            if (action.payload) {
                state.locationError = null;
            }
        },

        setLocationError: (state, action: PayloadAction<ILocationError>) => {
            state.locationError = action.payload;
            state.isLocationLoading = false;
        },

        setLocationPermission: (state, action: PayloadAction<boolean>) => {
            state.hasLocationPermission = action.payload;
        },

        setLocationEnabled: (state, action: PayloadAction<boolean>) => {
            state.isLocationEnabled = action.payload;
        },

        // Map Region Management
        setMapRegion: (state, action: PayloadAction<IMapRegion>) => {
            state.mapRegion = action.payload;
        },

        setFollowingUser: (state, action: PayloadAction<boolean>) => {
            state.isFollowingUser = action.payload;
        },

        // Markers Management
        addMarker: (state, action: PayloadAction<IMarker>) => {
            state.markers.push(action.payload);
        },

        removeMarker: (state, action: PayloadAction<string>) => {
            state.markers = state.markers.filter(marker => marker.id !== action.payload);
        },

        updateMarker: (state, action: PayloadAction<IMarker>) => {
            const index = state.markers.findIndex(marker => marker.id === action.payload.id);
            if (index !== -1) {
                state.markers[index] = action.payload;
            }
        },

        clearMarkers: (state) => {
            state.markers = [];
        },

        // General State Management
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },

        setError: (state, action: PayloadAction<string | null>) => {
            state.errorMessage = action.payload;
            state.isLoading = false;
        },

        clearError: (state) => {
            state.errorMessage = null;
            state.locationError = null;
        },

        setSuccess: (state, action: PayloadAction<boolean>) => {
            state.isSuccess = action.payload;
        },

        // Reset State
        resetMapState: () => initialState,
    },
});

export const {
    setUserLocation,
    setLocationLoading,
    setLocationError,
    setLocationPermission,
    setLocationEnabled,
    setMapRegion,
    setFollowingUser,
    addMarker,
    removeMarker,
    updateMarker,
    clearMarkers,
    setLoading,
    setError,
    clearError,
    setSuccess,
    resetMapState,
} = mapSlice.actions;

export default mapSlice.reducer;
