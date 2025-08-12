import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { WebView } from 'react-native-webview';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapViewModel } from '@/viewmodels/map/MapViewModel';
import { useViewModel } from '@/viewmodels/shared/BaseViewModel';
import { RootState } from '@/lib/redux/store';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { trackingService, TrackingRecord } from '@/services/TrackingService';
import { AddressSearchModal } from '@/components/AddressSearchModal';

const mapSelector = (state: RootState) => state.map;

export default function MapScreen() {
    const [mapState, mapViewModel] = useViewModel(MapViewModel, mapSelector);
    const [mapHtml, setMapHtml] = useState<string>('');
    const [trackingData, setTrackingData] = useState({
        isTracking: false,
        startTime: null as Date | null,
        endTime: null as Date | null,
        distance: 0,
        duration: 0,
        routePoints: [] as number[][],
        startLocation: null as any,
        endLocation: null as any
    });
    const [showAddressSearch, setShowAddressSearch] = useState(false);
    const webViewRef = useRef<WebView>(null);

    // Initialize location services on component mount
    useEffect(() => {
        const initializeLocation = async () => {
            console.log('📍 Initializing location services...');

            // Check if we already have location permission
            const hasPermission = await mapViewModel.checkLocationPermission();

            if (hasPermission) {
                console.log('✅ Location permission already granted, getting current location');
                await mapViewModel.getCurrentLocation();
            } else {
                console.log('⚠️ No location permission, will request when user taps location button');
            }
        };

        initializeLocation();

        // Cleanup on unmount
        return () => {
            mapViewModel.cleanup();
        };
    }, []);

    // Generate map HTML when location changes
    useEffect(() => {
        if (mapState.userLocation) {
            const { latitude, longitude } = mapState.userLocation.coords;
            const html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
                    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
                    <script src="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.js"></script>
                    <link rel="stylesheet" href="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css" />
                    <style>
                        body { margin: 0; padding: 0; }
                        #map { width: 100%; height: 100vh; }
                        .location-info {
                            position: absolute;
                            top: 10px;
                            left: 10px;
                            background: white;
                            padding: 10px;
                            border-radius: 5px;
                            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                            z-index: 1000;
                            font-family: Arial, sans-serif;
                            font-size: 12px;
                            max-width: 200px;
                        }
                        .tracking-info {
                            position: absolute;
                            top: 10px;
                            right: 10px;
                            background: white;
                            padding: 10px;
                            border-radius: 5px;
                            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                            z-index: 1000;
                            font-family: Arial, sans-serif;
                            font-size: 12px;
                            max-width: 200px;
                        }
                        .route-controls {
                            position: absolute;
                            bottom: 20px;
                            left: 10px;
                            background: white;
                            padding: 10px;
                            border-radius: 5px;
                            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                            z-index: 1000;
                            font-family: Arial, sans-serif;
                            font-size: 12px;
                        }
                    </style>
                </head>
                <body>
                    <div id="map"></div>
                    <div class="location-info">
                        <strong>📍 Current Location</strong><br>
                        Lat: ${latitude.toFixed(6)}<br>
                        Lng: ${longitude.toFixed(6)}
                    </div>
                    <div class="tracking-info" id="trackingInfo" style="display: none;">
                        <strong>🎯 Tracking Active</strong><br>
                        <span id="trackingTime">00:00:00</span><br>
                        <span id="trackingDistance">0.0 km</span><br>
                        <span id="trackingSpeed">0 km/h</span>
                    </div>
                    <div class="route-controls">
                        <button onclick="startRoutePlanning()" style="margin: 2px; padding: 5px 10px;">🗺️ Plan Route</button>
                        <button onclick="clearRoute()" style="margin: 2px; padding: 5px 10px;">🗑️ Clear Route</button>
                    </div>
                    <script>
                        let map, marker, accuracyCircle, routeControl, trackingPolyline;
                        let routePoints = [];
                        let isTracking = false;
                        let startTime = null;
                        let totalDistance = 0;
                        let lastPosition = null;
                        
                        // Initialize map
                        map = L.map('map').setView([${latitude}, ${longitude}], 15);
                        
                        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                            attribution: '© OpenStreetMap contributors'
                        }).addTo(map);
                        
                        // Add user location marker
                        marker = L.marker([${latitude}, ${longitude}]).addTo(map);
                        marker.bindPopup('<b>Your Location</b><br>Lat: ${latitude.toFixed(6)}<br>Lng: ${longitude.toFixed(6)}');
                        
                        // Add accuracy circle
                        const accuracy = ${mapState.userLocation.coords.accuracy || 10};
                        accuracyCircle = L.circle([${latitude}, ${longitude}], {
                            color: 'blue',
                            fillColor: '#3388ff',
                            fillOpacity: 0.2,
                            radius: accuracy
                        }).addTo(map);
                        
                        // Route planning function
                        function startRoutePlanning() {
                            const destination = prompt('Enter destination address:');
                            if (destination) {
                                // Check if it's coordinates first
                                const coords = destination.split(',').map(c => parseFloat(c.trim()));
                                if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
                                    planRoute([${latitude}, ${longitude}], coords);
                                } else {
                                    // Geocode the address
                                    geocodeAddress(destination);
                                }
                            }
                        }
                        
                        // Geocode address using Nominatim API
                        async function geocodeAddress(address) {
                            try {
                                const response = await fetch(\`https://nominatim.openstreetmap.org/search?format=json&q=\${encodeURIComponent(address)}&limit=5&addressdetails=1\`);
                                const data = await response.json();
                                
                                if (data && data.length > 0) {
                                    if (data.length === 1) {
                                        // Single result, use it directly
                                        const location = data[0];
                                        planRoute([${latitude}, ${longitude}], [parseFloat(location.lat), parseFloat(location.lon)]);
                                        
                                        // Show location info
                                        const displayName = location.display_name.split(',').slice(0, 3).join(',');
                                        alert(\`Route planned to:\\n\${displayName}\`);
                                    } else {
                                        // Multiple results, show selection dialog
                                        showLocationSelection(data);
                                    }
                                } else {
                                    alert('No locations found for this address. Please try a different search term.');
                                }
                            } catch (error) {
                                console.error('Geocoding error:', error);
                                alert('Error finding location. Please check your internet connection and try again.');
                            }
                        }
                        
                        // Show location selection dialog
                        function showLocationSelection(locations) {
                            const locationList = locations.map((loc, index) => {
                                const displayName = loc.display_name.split(',').slice(0, 3).join(',');
                                return \`\${index + 1}. \${displayName}\`;
                            }).join('\\n');
                            
                            const selection = prompt(\`Multiple locations found. Please select one:\\n\\n\${locationList}\\n\\nEnter number (1-\${locations.length}):\`);
                            const index = parseInt(selection) - 1;
                            
                            if (index >= 0 && index < locations.length) {
                                const selectedLocation = locations[index];
                                planRoute([${latitude}, ${longitude}], [parseFloat(selectedLocation.lat), parseFloat(selectedLocation.lon)]);
                                
                                const displayName = selectedLocation.display_name.split(',').slice(0, 3).join(',');
                                alert(\`Route planned to:\\n\${displayName}\`);
                            }
                        }
                        
                        function planRoute(start, end) {
                            if (routeControl) {
                                map.removeControl(routeControl);
                            }
                            
                            // Add destination marker
                            if (window.destinationMarker) {
                                map.removeLayer(window.destinationMarker);
                            }
                            window.destinationMarker = L.marker([end[0], end[1]], {
                                icon: L.divIcon({
                                    className: 'destination-marker',
                                    html: '<div style="background-color: #ff4444; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                                    iconSize: [20, 20],
                                    iconAnchor: [10, 10]
                                })
                            }).addTo(map);
                            
                            routeControl = L.Routing.control({
                                waypoints: [
                                    L.latLng(start[0], start[1]),
                                    L.latLng(end[0], end[1])
                                ],
                                routeWhileDragging: true,
                                showAlternatives: false,
                                fitSelectedRoutes: true,
                                lineOptions: {
                                    styles: [{ color: '#007cbf', weight: 4, opacity: 0.8 }]
                                },
                                createMarker: function() { return null; } // Don't create default markers
                            }).addTo(map);
                            
                            routeControl.on('routesfound', function(e) {
                                const routes = e.routes;
                                if (routes && routes.length > 0) {
                                    const summary = routes[0].summary;
                                    const distance = (summary.totalDistance / 1000).toFixed(2);
                                    const duration = Math.round(summary.totalTime / 60);
                                    
                                    // Send route info to React Native
                                    window.ReactNativeWebView.postMessage(JSON.stringify({
                                        type: 'routePlanned',
                                        data: {
                                            distance: summary.totalDistance,
                                            duration: summary.totalTime,
                                            distanceText: distance + ' km',
                                            durationText: duration + ' min',
                                            start: start,
                                            end: end
                                        }
                                    }));
                                    
                                    // Show route info on map
                                    const routeInfo = L.control({ position: 'topright' });
                                    routeInfo.onAdd = function() {
                                        const div = L.DomUtil.create('div', 'route-info');
                                        div.innerHTML = \`
                                            <div style="background: white; padding: 10px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.2); font-family: Arial, sans-serif; font-size: 12px;">
                                                <strong>🗺️ Route Info</strong><br>
                                                Distance: \${distance} km<br>
                                                Duration: \${duration} min
                                            </div>
                                        \`;
                                        return div;
                                    };
                                    routeInfo.addTo(map);
                                    window.routeInfoControl = routeInfo;
                                }
                            });
                            
                            routeControl.on('routingerror', function(e) {
                                console.error('Routing error:', e);
                                alert('Could not find route to destination. Please try a different location.');
                            });
                        }
                        
                        function clearRoute() {
                            if (routeControl) {
                                map.removeControl(routeControl);
                                routeControl = null;
                            }
                            if (window.destinationMarker) {
                                map.removeLayer(window.destinationMarker);
                                window.destinationMarker = null;
                            }
                            if (window.routeInfoControl) {
                                map.removeControl(window.routeInfoControl);
                                window.routeInfoControl = null;
                            }
                            if (trackingPolyline) {
                                map.removeLayer(trackingPolyline);
                                trackingPolyline = null;
                            }
                        }
                        
                        // Tracking functions
                        function startTracking() {
                            isTracking = true;
                            startTime = new Date();
                            routePoints = [[${latitude}, ${longitude}]];
                            totalDistance = 0;
                            lastPosition = [${latitude}, ${longitude}];
                            
                            // Create tracking polyline
                            trackingPolyline = L.polyline(routePoints, {
                                color: 'red',
                                weight: 3,
                                opacity: 0.8
                            }).addTo(map);
                            
                            document.getElementById('trackingInfo').style.display = 'block';
                            updateTrackingDisplay();
                        }
                        
                        function stopTracking() {
                            isTracking = false;
                            document.getElementById('trackingInfo').style.display = 'none';
                            
                            // Send tracking data to React Native
                            const trackingData = {
                                startTime: startTime,
                                endTime: new Date(),
                                distance: totalDistance,
                                routePoints: routePoints,
                                duration: (new Date() - startTime) / 1000
                            };
                            
                            window.ReactNativeWebView.postMessage(JSON.stringify({
                                type: 'trackingComplete',
                                data: trackingData
                            }));
                        }
                        
                        function updateLocation(lat, lng) {
                            // Update marker position
                            marker.setLatLng([lat, lng]);
                            accuracyCircle.setLatLng([lat, lng]);
                            
                            // Update tracking if active
                            if (isTracking) {
                                routePoints.push([lat, lng]);
                                trackingPolyline.setLatLngs(routePoints);
                                
                                if (lastPosition) {
                                    const distance = calculateDistance(lastPosition[0], lastPosition[1], lat, lng);
                                    totalDistance += distance;
                                }
                                lastPosition = [lat, lng];
                                
                                updateTrackingDisplay();
                            }
                        }
                        
                        function updateTrackingDisplay() {
                            if (isTracking && startTime) {
                                const elapsed = Math.floor((new Date() - startTime) / 1000);
                                const hours = Math.floor(elapsed / 3600);
                                const minutes = Math.floor((elapsed % 3600) / 60);
                                const seconds = elapsed % 60;
                                
                                document.getElementById('trackingTime').textContent = 
                                    String(hours).padStart(2, '0') + ':' + 
                                    String(minutes).padStart(2, '0') + ':' + 
                                    String(seconds).padStart(2, '0');
                                
                                document.getElementById('trackingDistance').textContent = 
                                    (totalDistance / 1000).toFixed(2) + ' km';
                                
                                const speed = elapsed > 0 ? (totalDistance / 1000) / (elapsed / 3600) : 0;
                                document.getElementById('trackingSpeed').textContent = 
                                    speed.toFixed(1) + ' km/h';
                            }
                        }
                        
                        function calculateDistance(lat1, lon1, lat2, lon2) {
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
                        
                        // Expose functions to React Native
                        window.startTracking = startTracking;
                        window.stopTracking = stopTracking;
                        window.updateLocation = updateLocation;
                        
                        // Handle messages from React Native
                        window.addEventListener('message', function(event) {
                            try {
                                const message = JSON.parse(event.data);
                                if (message.type === 'startTracking') {
                                    startTracking();
                                } else if (message.type === 'stopTracking') {
                                    stopTracking();
                                } else if (message.type === 'planRoute') {
                                    planRoute(message.data.start, message.data.end);
                                }
                            } catch (error) {
                                console.error('Error handling message:', error);
                            }
                        });
                        
                        // Update tracking display every second
                        setInterval(updateTrackingDisplay, 1000);
                        
                        // Notify React Native that map is ready
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                            type: 'mapReady',
                            data: { latitude: ${latitude}, longitude: ${longitude} }
                        }));
                    </script>
                </body>
                </html>
            `;
            setMapHtml(html);
        } else {
            // Default map centered on Vietnam
            const defaultHtml = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
                    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
                    <style>
                        body { margin: 0; padding: 0; }
                        #map { width: 100%; height: 100vh; }
                        .location-info {
                            position: absolute;
                            top: 10px;
                            left: 10px;
                            background: white;
                            padding: 10px;
                            border-radius: 5px;
                            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                            z-index: 1000;
                            font-family: Arial, sans-serif;
                            font-size: 12px;
                        }
                    </style>
                </head>
                <body>
                    <div id="map"></div>
                    <div class="location-info">
                        <strong>🗺️ Vietnam</strong><br>
                        Default location view
                    </div>
                    <script>
                        const map = L.map('map').setView([21.0285, 105.8542], 6);
                        
                        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                            attribution: '© OpenStreetMap contributors'
                        }).addTo(map);
                    </script>
                </body>
                </html>
            `;
            setMapHtml(defaultHtml);
        }
    }, [mapState.userLocation]);

    // Handle messages from WebView
    const handleWebViewMessage = (event: any) => {
        try {
            const message = JSON.parse(event.nativeEvent.data);
            if (message.type === 'trackingComplete') {
                handleTrackingComplete(message.data);
            } else if (message.type === 'routePlanned') {
                console.log('Route planned successfully:', message.data);
            } else if (message.type === 'mapReady') {
                console.log('Map is ready:', message.data);
            }
        } catch (error) {
            console.error('Error parsing WebView message:', error);
        }
    };

    // Handle tracking completion
    const handleTrackingComplete = (trackingData: any) => {
        console.log('Tracking completed:', trackingData);

        // Save to database (you can implement this)
        saveTrackingToDatabase(trackingData);

        // Update local state
        setTrackingData(prev => ({
            ...prev,
            isTracking: false,
            endTime: new Date(),
            distance: trackingData.distance,
            duration: trackingData.duration,
            routePoints: trackingData.routePoints
        }));

        Alert.alert(
            'Tracking Complete',
            `Distance: ${(trackingData.distance / 1000).toFixed(2)} km\nDuration: ${Math.round(trackingData.duration / 60)} minutes`
        );
    };

    // Save tracking data to database
    const saveTrackingToDatabase = async (data: any) => {
        try {
            const { averageSpeed, maxSpeed } = trackingService.calculateSpeedStats(data.routePoints, data.duration);

            const trackingRecord = {
                startTime: new Date(data.startTime),
                endTime: new Date(data.endTime),
                distance: data.distance,
                duration: data.duration,
                routePoints: data.routePoints,
                startLocation: data.routePoints[0] || [0, 0],
                endLocation: data.routePoints[data.routePoints.length - 1] || [0, 0],
                averageSpeed,
                maxSpeed
            };

            const recordId = await trackingService.saveTrackingRecord(trackingRecord);
            console.log('✅ Tracking record saved with ID:', recordId);

            // Show success message
            Alert.alert(
                'Tracking Saved',
                `Route tracking data has been saved successfully!\nRecord ID: ${recordId}`
            );

        } catch (error) {
            console.error('❌ Error saving tracking data:', error);
            Alert.alert('Error', 'Failed to save tracking data');
        }
    };

    const handleLocationRequest = async () => {
        if (!mapState.hasLocationPermission) {
            await mapViewModel.handleRequestLocationPermission();
        } else {
            await mapViewModel.handleGetCurrentLocation();
        }
    };

    const handleStartTracking = async () => {
        if (mapState.isLocationEnabled) {
            mapViewModel.handleStopLocationTracking();
            // Stop tracking on map
            webViewRef.current?.postMessage(JSON.stringify({ type: 'stopTracking' }));
        } else {
            await mapViewModel.handleStartLocationTracking();
            // Start tracking on map
            webViewRef.current?.postMessage(JSON.stringify({ type: 'startTracking' }));
        }
    };

    const handleStartRouteTracking = () => {
        if (!trackingData.isTracking) {
            setTrackingData(prev => ({
                ...prev,
                isTracking: true,
                startTime: new Date(),
                startLocation: mapState.userLocation?.coords
            }));
            webViewRef.current?.postMessage(JSON.stringify({ type: 'startTracking' }));
        }
    };

    const handleStopRouteTracking = () => {
        if (trackingData.isTracking) {
            webViewRef.current?.postMessage(JSON.stringify({ type: 'stopTracking' }));
        }
    };

    // Handle location selection from address search
    const handleLocationSelect = (lat: number, lng: number, displayName: string) => {
        console.log('📍 Selected destination:', { lat, lng, displayName });

        // Send route planning message to WebView
        webViewRef.current?.postMessage(JSON.stringify({
            type: 'planRoute',
            data: {
                start: [mapState.userLocation?.coords.latitude || 0, mapState.userLocation?.coords.longitude || 0],
                end: [lat, lng],
                displayName
            }
        }));

        // Show initial alert
        Alert.alert(
            'Planning Route',
            `Planning route to:\n${displayName}\n\nLat: ${lat.toFixed(6)}\nLng: ${lng.toFixed(6)}\n\nRoute information will appear on the map.`
        );
    };

    // Show loading while getting initial location
    if (mapState.isLoading) {
        return <LoadingSpinner message="Loading map..." />;
    }

    return (
        <View style={styles.container}>
            {/* Map View */}
            <View style={styles.mapContainer}>
                <WebView
                    ref={webViewRef}
                    source={{ html: mapHtml }}
                    style={styles.map}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    startInLoadingState={true}
                    onMessage={handleWebViewMessage}
                    renderLoading={() => (
                        <View style={styles.loadingContainer}>
                            <LoadingSpinner message="Loading map..." />
                        </View>
                    )}
                />
            </View>

            {/* Floating Controls */}
            <View style={styles.floatingControls}>
                {/* Location Status Card */}
                {(mapState.locationError || mapState.isLocationLoading || mapState.userLocation) && (
                    <Card className="p-3 bg-card shadow-lg mb-3">
                        {mapState.isLocationLoading && (
                            <View className="flex-row items-center space-x-2">
                                <LoadingSpinner size="small" message="" />
                                <Text className="text-sm text-foreground">Getting location...</Text>
                            </View>
                        )}

                        {mapState.locationError && (
                            <View className="space-y-1">
                                <Text className="text-sm font-medium text-destructive">
                                    ❌ Location Error
                                </Text>
                                <Text className="text-xs text-muted-foreground">
                                    {mapState.locationError.message}
                                </Text>
                            </View>
                        )}

                        {mapState.userLocation && !mapState.isLocationLoading && (
                            <View className="space-y-1">
                                <Text className="text-sm font-medium text-foreground">
                                    ✅ Current Location
                                </Text>
                                <Text className="text-xs text-muted-foreground">
                                    Lat: {mapState.userLocation.coords.latitude.toFixed(6)}
                                </Text>
                                <Text className="text-xs text-muted-foreground">
                                    Lng: {mapState.userLocation.coords.longitude.toFixed(6)}
                                </Text>
                                {mapState.userLocation.coords.accuracy && (
                                    <Text className="text-xs text-muted-foreground">
                                        Accuracy: {mapState.userLocation.coords.accuracy.toFixed(0)}m
                                    </Text>
                                )}
                            </View>
                        )}
                    </Card>
                )}

                {/* Control Buttons */}
                <View className="space-y-2">
                    {!mapState.hasLocationPermission ? (
                        <Button
                            onPress={handleLocationRequest}
                            disabled={mapState.isLocationLoading}
                            className="w-full"
                        >
                            <Text className="text-primary-foreground text-sm">
                                📍 Enable Location
                            </Text>
                        </Button>
                    ) : (
                        <>
                            <Button
                                onPress={mapViewModel.handleGetCurrentLocation}
                                disabled={mapState.isLocationLoading}
                                variant="outline"
                                className="w-full"
                            >
                                <Text className="text-foreground text-sm">
                                    📍 Get Location
                                </Text>
                            </Button>

                            <Button
                                onPress={() => setShowAddressSearch(true)}
                                disabled={!mapState.userLocation}
                                variant="outline"
                                className="w-full"
                            >
                                <Text className="text-foreground text-sm">
                                    🗺️ Plan Route
                                </Text>
                            </Button>

                            <Button
                                onPress={handleStartTracking}
                                disabled={mapState.isLocationLoading}
                                variant="solid"
                                className="w-full"
                            >
                                <Text className={`text-sm ${mapState.isLocationEnabled
                                    ? 'text-destructive-foreground'
                                    : 'text-primary-foreground'
                                    }`}>
                                    {mapState.isLocationEnabled ? '⏹️ Stop Tracking' : '▶️ Start Tracking'}
                                </Text>
                            </Button>

                            {mapState.isLocationEnabled && (
                                <>
                                    <Button
                                        onPress={handleStartRouteTracking}
                                        disabled={trackingData.isTracking}
                                        variant="outline"
                                        className="w-full"
                                    >
                                        <Text className="text-foreground text-sm">
                                            🛣️ Start Route Tracking
                                        </Text>
                                    </Button>

                                    {trackingData.isTracking && (
                                        <Button
                                            onPress={handleStopRouteTracking}
                                            variant="solid"
                                            className="w-full"
                                        >
                                            <Text className="text-destructive-foreground text-sm">
                                                🛑 Stop Route Tracking
                                            </Text>
                                        </Button>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </View>

                {/* Tracking Info */}
                {trackingData.isTracking && (
                    <Card className="p-3 bg-card shadow-lg mt-3">
                        <Text className="text-sm font-medium text-foreground mb-2">
                            🎯 Route Tracking Active
                        </Text>
                        <Text className="text-xs text-muted-foreground">
                            Distance: {(trackingData.distance / 1000).toFixed(2)} km
                        </Text>
                        <Text className="text-xs text-muted-foreground">
                            Duration: {trackingData.duration > 0 ? Math.round(trackingData.duration / 60) : 0} min
                        </Text>
                    </Card>
                )}
            </View>

            {/* Address Search Modal */}
            <AddressSearchModal
                visible={showAddressSearch}
                onClose={() => setShowAddressSearch(false)}
                onLocationSelect={handleLocationSelect}
                currentLocation={{
                    latitude: mapState.userLocation?.coords.latitude || 21.0285,
                    longitude: mapState.userLocation?.coords.longitude || 105.8542
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
    },
    mapContainer: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
    },
    floatingControls: {
        position: 'absolute',
        top: 20,
        right: 20,
        left: 20,
        zIndex: 1,
    },
});
