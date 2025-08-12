import AsyncStorage from '@react-native-async-storage/async-storage';

export interface TrackingRecord {
    id: string;
    startTime: Date;
    endTime: Date;
    distance: number; // in meters
    duration: number; // in seconds
    routePoints: number[][]; // array of [lat, lng] coordinates
    startLocation: number[]; // [lat, lng]
    endLocation: number[]; // [lat, lng]
    averageSpeed: number; // km/h
    maxSpeed: number; // km/h
    createdAt: string;
    updatedAt: string;
}

export interface TrackingStats {
    totalDistance: number;
    totalDuration: number;
    totalTracks: number;
    averageSpeed: number;
    fastestSpeed: number;
    longestTrack: number;
}

class TrackingService {
    private readonly STORAGE_KEY = 'tracking_records';

    // Save tracking record to local storage
    async saveTrackingRecord(record: Omit<TrackingRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        try {
            const id = Date.now().toString();
            const now = new Date().toISOString();

            const trackingRecord: TrackingRecord = {
                ...record,
                id,
                createdAt: now,
                updatedAt: now
            };

            // Get existing records
            const existingRecords = await this.getAllTrackingRecords();
            existingRecords.push(trackingRecord);

            // Save back to storage
            await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingRecords));

            console.log('✅ Tracking record saved:', id);
            return id;
        } catch (error) {
            console.error('❌ Error saving tracking record:', error);
            throw error;
        }
    }

    // Get all tracking records
    async getAllTrackingRecords(): Promise<TrackingRecord[]> {
        try {
            const data = await AsyncStorage.getItem(this.STORAGE_KEY);
            if (data) {
                const records = JSON.parse(data);
                // Convert string dates back to Date objects
                return records.map((record: any) => ({
                    ...record,
                    startTime: new Date(record.startTime),
                    endTime: new Date(record.endTime)
                }));
            }
            return [];
        } catch (error) {
            console.error('❌ Error getting tracking records:', error);
            return [];
        }
    }

    // Get tracking record by ID
    async getTrackingRecord(id: string): Promise<TrackingRecord | null> {
        try {
            const records = await this.getAllTrackingRecords();
            const record = records.find(r => r.id === id);
            return record || null;
        } catch (error) {
            console.error('❌ Error getting tracking record:', error);
            return null;
        }
    }

    // Delete tracking record
    async deleteTrackingRecord(id: string): Promise<boolean> {
        try {
            const records = await this.getAllTrackingRecords();
            const filteredRecords = records.filter(r => r.id !== id);
            await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredRecords));

            console.log('✅ Tracking record deleted:', id);
            return true;
        } catch (error) {
            console.error('❌ Error deleting tracking record:', error);
            return false;
        }
    }

    // Get tracking statistics
    async getTrackingStats(): Promise<TrackingStats> {
        try {
            const records = await this.getAllTrackingRecords();

            if (records.length === 0) {
                return {
                    totalDistance: 0,
                    totalDuration: 0,
                    totalTracks: 0,
                    averageSpeed: 0,
                    fastestSpeed: 0,
                    longestTrack: 0
                };
            }

            const totalDistance = records.reduce((sum, record) => sum + record.distance, 0);
            const totalDuration = records.reduce((sum, record) => sum + record.duration, 0);
            const totalTracks = records.length;
            const averageSpeed = totalDuration > 0 ? (totalDistance / 1000) / (totalDuration / 3600) : 0;
            const fastestSpeed = Math.max(...records.map(r => r.maxSpeed));
            const longestTrack = Math.max(...records.map(r => r.distance));

            return {
                totalDistance,
                totalDuration,
                totalTracks,
                averageSpeed,
                fastestSpeed,
                longestTrack
            };
        } catch (error) {
            console.error('❌ Error getting tracking stats:', error);
            return {
                totalDistance: 0,
                totalDuration: 0,
                totalTracks: 0,
                averageSpeed: 0,
                fastestSpeed: 0,
                longestTrack: 0
            };
        }
    }

    // Get recent tracking records (last N records)
    async getRecentTrackingRecords(limit: number = 10): Promise<TrackingRecord[]> {
        try {
            const records = await this.getAllTrackingRecords();
            return records
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, limit);
        } catch (error) {
            console.error('❌ Error getting recent tracking records:', error);
            return [];
        }
    }

    // Calculate speed from distance and duration
    calculateSpeed(distance: number, duration: number): number {
        if (duration <= 0) return 0;
        return (distance / 1000) / (duration / 3600); // km/h
    }

    // Calculate distance between two points using Haversine formula
    calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371e3; // Earth's radius in meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    // Calculate total distance from route points
    calculateTotalDistance(routePoints: number[][]): number {
        if (routePoints.length < 2) return 0;

        let totalDistance = 0;
        for (let i = 1; i < routePoints.length; i++) {
            const [lat1, lon1] = routePoints[i - 1];
            const [lat2, lon2] = routePoints[i];
            totalDistance += this.calculateDistance(lat1, lon1, lat2, lon2);
        }

        return totalDistance;
    }

    // Calculate speed statistics from route points
    calculateSpeedStats(routePoints: number[][], duration: number): { averageSpeed: number; maxSpeed: number } {
        if (routePoints.length < 2 || duration <= 0) {
            return { averageSpeed: 0, maxSpeed: 0 };
        }

        const totalDistance = this.calculateTotalDistance(routePoints);
        const averageSpeed = (totalDistance / 1000) / (duration / 3600); // km/h

        // Calculate max speed from consecutive points
        let maxSpeed = 0;
        for (let i = 1; i < routePoints.length; i++) {
            const [lat1, lon1] = routePoints[i - 1];
            const [lat2, lon2] = routePoints[i];
            const distance = this.calculateDistance(lat1, lon1, lat2, lon2);
            const speed = (distance / 1000) / (duration / 3600 / routePoints.length); // km/h
            maxSpeed = Math.max(maxSpeed, speed);
        }

        return { averageSpeed, maxSpeed };
    }

    // Export tracking data (for backup or sharing)
    async exportTrackingData(): Promise<string> {
        try {
            const records = await this.getAllTrackingRecords();
            const exportData = {
                exportDate: new Date().toISOString(),
                totalRecords: records.length,
                records: records
            };
            return JSON.stringify(exportData, null, 2);
        } catch (error) {
            console.error('❌ Error exporting tracking data:', error);
            throw error;
        }
    }

    // Import tracking data (for restore)
    async importTrackingData(data: string): Promise<boolean> {
        try {
            const importData = JSON.parse(data);
            if (importData.records && Array.isArray(importData.records)) {
                await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(importData.records));
                console.log('✅ Tracking data imported successfully');
                return true;
            }
            return false;
        } catch (error) {
            console.error('❌ Error importing tracking data:', error);
            return false;
        }
    }

    // Clear all tracking data
    async clearAllTrackingData(): Promise<boolean> {
        try {
            await AsyncStorage.removeItem(this.STORAGE_KEY);
            console.log('✅ All tracking data cleared');
            return true;
        } catch (error) {
            console.error('❌ Error clearing tracking data:', error);
            return false;
        }
    }
}

export const trackingService = new TrackingService();
