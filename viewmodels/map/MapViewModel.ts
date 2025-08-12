import { BaseViewModel } from '@/viewmodels/shared/BaseViewModel';
import { IUserLocation, IMapRegion, IMarker, ILocationError } from '@/models/map/location';
import {
    requestLocationPermission,
    getCurrentLocation,
    startLocationTracking,
    getAddressFromCoordinates,
} from '@/features/map/mapThunk';
import {
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
} from '@/features/map/mapSlice';
import { RootState } from '@/lib/redux/store';
import * as Location from 'expo-location';

type MapState = RootState['map'];

export class MapViewModel extends BaseViewModel<MapState> {
    private locationSubscription: Location.LocationSubscription | null = null;

    // ===========================================
    // 🗺️ LOCATION PERMISSION MANAGEMENT
    // ===========================================

    async requestLocationPermission(): Promise<void> {
        await this.executeAsync(
            async () => {
                const result = await this.dispatch(requestLocationPermission()).unwrap();
                this.dispatch(setLocationPermission(result));

                if (result) {
                    console.log('✅ Location permission granted');
                    // Automatically get current location after permission granted
                    await this.getCurrentLocation();
                } else {
                    console.log('❌ Location permission denied');
                }
            },
            () => {
                console.log('Location permission request completed');
            },
            (error) => {
                console.error('Location permission request failed:', error);
                this.dispatch(setLocationPermission(false));
            },
            {
                setLoading,
                setError,
                setSuccess
            }
        );
    }

    async checkLocationPermission(): Promise<boolean> {
        try {
            const { status } = await Location.getForegroundPermissionsAsync();
            const hasPermission = status === 'granted';
            this.dispatch(setLocationPermission(hasPermission));
            return hasPermission;
        } catch (error) {
            console.error('Error checking location permission:', error);
            this.dispatch(setLocationPermission(false));
            return false;
        }
    }

    // ===========================================
    // 📍 LOCATION TRACKING
    // ===========================================

    async getCurrentLocation(): Promise<void> {
        this.dispatch(setLocationLoading(true));

        await this.executeAsync(
            async () => {
                const userLocation = await this.dispatch(getCurrentLocation()).unwrap();
                this.dispatch(setUserLocation(userLocation));

                console.log('📍 Current location obtained:', {
                    lat: userLocation.coords.latitude,
                    lng: userLocation.coords.longitude,
                    accuracy: userLocation.coords.accuracy
                });
            },
            () => {
                console.log('Current location request completed');
            },
            (error) => {
                console.error('Failed to get current location:', error);
                if (typeof error === 'object' && error !== null && 'code' in error) {
                    this.dispatch(setLocationError(error as ILocationError));
                } else {
                    this.dispatch(setLocationError({
                        code: 'UNKNOWN_ERROR',
                        message: 'Failed to get current location'
                    }));
                }
            },
            {
                setLoading: setLocationLoading,
                setError,
                setSuccess
            }
        );
    }

    async startLocationTracking(): Promise<void> {
        // Check if already tracking
        if (this.locationSubscription) {
            console.log('⚠️ Location tracking already active');
            return;
        }

        try {
            // Set loading state
            this.dispatch(setLocationLoading(true));

            // Check permission first
            const hasPermission = await this.checkLocationPermission();
            if (!hasPermission) {
                throw new Error('Location permission not granted');
            }

            // Create the subscription directly without using thunk
            this.locationSubscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 5000,
                    distanceInterval: 10,
                },
                (location) => {
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

                    this.dispatch(setUserLocation(userLocation));
                    console.log('📍 Location updated:', {
                        lat: userLocation.coords.latitude,
                        lng: userLocation.coords.longitude
                    });
                }
            );

            // Update state
            this.dispatch(setLocationEnabled(true));
            this.dispatch(setLocationLoading(false));
            console.log('🎯 Location tracking started successfully');
        } catch (error) {
            console.error('Failed to start location tracking:', error);
            this.dispatch(setLocationLoading(false));

            if (typeof error === 'object' && error !== null && 'code' in error) {
                this.dispatch(setLocationError(error as ILocationError));
            } else {
                this.dispatch(setLocationError({
                    code: 'TRACKING_ERROR',
                    message: error instanceof Error ? error.message : 'Failed to start location tracking'
                }));
            }
        }
    }

    stopLocationTracking(): void {
        if (this.locationSubscription) {
            this.locationSubscription.remove();
            this.locationSubscription = null;
            this.dispatch(setLocationEnabled(false));
            console.log('🛑 Location tracking stopped');
        }
    }

    // ===========================================
    // 🗺️ MAP MANAGEMENT
    // ===========================================

    updateMapRegion(region: IMapRegion): void {
        this.dispatch(setMapRegion(region));
        console.log('🗺️ Map region updated:', region);
    }

    setFollowingUser(following: boolean): void {
        this.dispatch(setFollowingUser(following));
        console.log(`🎯 Following user: ${following}`);
    }

    centerOnUserLocation(): void {
        const currentState = this.getCurrentState();

        if (currentState.userLocation) {
            const region: IMapRegion = {
                latitude: currentState.userLocation.coords.latitude,
                longitude: currentState.userLocation.coords.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            };

            this.dispatch(setMapRegion(region));
            this.dispatch(setFollowingUser(true));
            console.log('🎯 Centered on user location');
        } else {
            console.log('⚠️ No user location available to center on');
        }
    }

    // ===========================================
    // 📌 MARKERS MANAGEMENT
    // ===========================================

    addMarker(marker: IMarker): void {
        this.dispatch(addMarker(marker));
        console.log('📌 Marker added:', marker.title);
    }

    removeMarker(markerId: string): void {
        this.dispatch(removeMarker(markerId));
        console.log('🗑️ Marker removed:', markerId);
    }

    updateMarker(marker: IMarker): void {
        this.dispatch(updateMarker(marker));
        console.log('✏️ Marker updated:', marker.title);
    }

    clearAllMarkers(): void {
        this.dispatch(clearMarkers());
        console.log('🧹 All markers cleared');
    }

    // ===========================================
    // 🏠 GEOCODING
    // ===========================================

    async getAddressFromCoordinates(latitude: number, longitude: number): Promise<void> {
        await this.executeAsync(
            async () => {
                const address = await this.dispatch(
                    getAddressFromCoordinates({ latitude, longitude })
                ).unwrap();

                console.log('🏠 Address obtained:', address);
                return address;
            },
            () => {
                console.log('Geocoding request completed');
            },
            (error) => {
                console.error('Failed to get address:', error);
            },
            {
                setLoading,
                setError,
                setSuccess
            }
        );
    }

    // ===========================================
    // 🔧 UTILITY METHODS
    // ===========================================

    clearError(): void {
        this.dispatch(clearError());
    }

    resetMapState(): void {
        this.stopLocationTracking();
        this.dispatch(resetMapState());
        console.log('🔄 Map state reset');
    }

    // Handler methods for UI
    handleRequestLocationPermission = async (): Promise<void> => {
        await this.requestLocationPermission();
    };

    handleGetCurrentLocation = async (): Promise<void> => {
        const hasPermission = await this.checkLocationPermission();
        if (!hasPermission) {
            await this.requestLocationPermission();
            return;
        }
        await this.getCurrentLocation();
    };

    handleStartLocationTracking = async (): Promise<void> => {
        await this.startLocationTracking();
    };

    handleStopLocationTracking = (): void => {
        this.stopLocationTracking();
    };

    handleCenterOnUser = (): void => {
        this.centerOnUserLocation();
    };

    handleMapRegionChange = (region: IMapRegion): void => {
        this.updateMapRegion(region);
        // Stop following user when manually changing region
        this.setFollowingUser(false);
    };

    // Cleanup method (call when component unmounts)
    cleanup(): void {
        this.stopLocationTracking();
    }
}
