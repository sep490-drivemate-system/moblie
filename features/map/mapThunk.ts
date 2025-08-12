import { createAsyncThunk } from '@reduxjs/toolkit';
import * as Location from 'expo-location';
import { IUserLocation, ILocationError } from '@/models/map/location';

// Request location permission
export const requestLocationPermission = createAsyncThunk(
    'map/requestLocationPermission',
    async (_, { rejectWithValue }) => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                throw new Error('Location permission denied');
            }

            return true;
        } catch (error: any) {
            const locationError: ILocationError = {
                code: 'PERMISSION_DENIED',
                message: error.message || 'Failed to get location permission'
            };
            return rejectWithValue(locationError);
        }
    }
);

// Get current location
export const getCurrentLocation = createAsyncThunk(
    'map/getCurrentLocation',
    async (_, { rejectWithValue }) => {
        try {
            // Check if location services are enabled
            const isLocationServiceEnabled = await Location.hasServicesEnabledAsync();

            if (!isLocationServiceEnabled) {
                throw new Error('Location services are disabled');
            }

            // Get current position
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
                timeInterval: 5000,
                distanceInterval: 10,
            });

            const userLocation: IUserLocation = {
                coords: {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    altitude: location.coords.altitude,
                    accuracy: location.coords.accuracy,
                    altitudeAccuracy: location.coords.altitudeAccuracy,
                    heading: location.coords.heading,
                    speed: location.coords.speed,
                },
                timestamp: location.timestamp,
            };

            return userLocation;
        } catch (error: any) {
            const locationError: ILocationError = {
                code: error.code || 'LOCATION_ERROR',
                message: error.message || 'Failed to get current location'
            };
            return rejectWithValue(locationError);
        }
    }
);

// Watch position (for continuous tracking)
export const startLocationTracking = createAsyncThunk(
    'map/startLocationTracking',
    async (_, { rejectWithValue }) => {
        try {
            // Just return success status, don't return the subscription
            // The ViewModel will handle the actual subscription
            return { success: true };
        } catch (error: any) {
            const locationError: ILocationError = {
                code: error.code || 'TRACKING_ERROR',
                message: error.message || 'Failed to start location tracking'
            };
            return rejectWithValue(locationError);
        }
    }
);

// Get address from coordinates (reverse geocoding)
export const getAddressFromCoordinates = createAsyncThunk(
    'map/getAddressFromCoordinates',
    async (
        params: { latitude: number; longitude: number },
        { rejectWithValue }
    ) => {
        try {
            const address = await Location.reverseGeocodeAsync({
                latitude: params.latitude,
                longitude: params.longitude,
            });

            return address;
        } catch (error: any) {
            const locationError: ILocationError = {
                code: 'GEOCODING_ERROR',
                message: error.message || 'Failed to get address from coordinates'
            };
            return rejectWithValue(locationError);
        }
    }
);
