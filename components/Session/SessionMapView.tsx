import React, { RefObject } from "react";
import { View, Text, StyleSheet } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { Car } from "lucide-react-native";
import { AppColors } from "@/constants/Colors";
import { ISessionRoutes } from "@/models/route/route";

interface RouteSegment {
  coordinates: Array<{ latitude: number; longitude: number }>;
  distance: string;
  duration: string;
}

interface SelectedRoutePoint {
  id: string;
  latitude: number;
  longitude: number;
  streetName?: string;
  order: number;
}

interface SessionMapViewProps {
  startLat: number;
  startLong: number;
  endLat?: number;
  endLong?: number;
  routePoints: ISessionRoutes[];
  routeSegments: RouteSegment[];
  currentPosition?: {
    latitude: number;
    longitude: number;
    heading: number;
    speed: number;
  } | null;
  isSimulating?: boolean;
  mapRef?: RefObject<MapView>;
  onMapPress?: (event: any) => void;
  selectedRoutePoints?: SelectedRoutePoint[];
  enableMapPress?: boolean;
}

export default function SessionMapView({
  startLat,
  startLong,
  endLat,
  endLong,
  routePoints,
  routeSegments,
  currentPosition,
  isSimulating = false,
  mapRef,
  onMapPress,
  selectedRoutePoints = [],
  enableMapPress = false,
}: SessionMapViewProps) {
  const internalMapRef = React.useRef<MapView>(null);
  const finalMapRef = mapRef || internalMapRef;

  const parseCoordinateValue = (
    value: number | string | undefined | null
  ): number | null => {
    if (value === null || value === undefined) return null;
    if (typeof value === "number") return Number.isFinite(value) ? value : null;
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (
        trimmed === "" ||
        trimmed.toLowerCase() === "null" ||
        trimmed.toLowerCase() === "undefined"
      ) {
        return null;
      }
      const parsed = Number(trimmed);
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  };

  return (
    <View style={styles.mapContainer}>
      <MapView
        ref={finalMapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: startLat,
          longitude: startLong,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={false}
        showsMyLocationButton={false}
        mapType="standard"
        onPress={enableMapPress ? onMapPress : undefined}
      >
        {/* Starting Point Marker */}
        <Marker
          coordinate={{
            latitude: startLat,
            longitude: startLong,
          }}
          title="Điểm bắt đầu"
          pinColor="green"
        />

        {/* Route Points Markers */}
        {routePoints.map((point, index) => {
          const markerLat = parseCoordinateValue(point.latitudeStart as any);
          const markerLong = parseCoordinateValue(point.longitudeStart as any);
          if (markerLat === null || markerLong === null) {
            return null;
          }
          return (
            <Marker
              key={point.id}
              coordinate={{
                latitude: markerLat,
                longitude: markerLong,
              }}
              title={`Điểm ${index + 2}`}
              description={point.streetName}
              pinColor={index === routePoints.length - 1 ? "red" : "blue"}
            />
          );
        })}

        {/* Selected Route Points (from map clicks - Planning mode) */}
        {selectedRoutePoints.map((point, index) => (
          <Marker
            key={point.id}
            coordinate={{
              latitude: point.latitude,
              longitude: point.longitude,
            }}
            title={`Điểm ${point.order + routePoints.length + 1}`}
            description={point.streetName || "Điểm mới"}
            pinColor="orange"
          />
        ))}

        {/* Dropoff Point Marker if available */}
        {endLat !== undefined && endLong !== undefined && (
          <Marker
            coordinate={{
              latitude: endLat,
              longitude: endLong,
            }}
            title="Điểm trả"
            pinColor="red"
          />
        )}

        {/* Route Segments */}
        {routeSegments.map((segment, index) => (
          <Polyline
            key={`segment-${index}`}
            coordinates={segment.coordinates}
            strokeColor="#3b82f6"
            strokeWidth={4}
          />
        ))}

        {/* Polyline connecting selected route points (Planning mode) */}
        {selectedRoutePoints.length > 0 && (
          <>
            {/* Connect start point to first selected point */}
            {selectedRoutePoints.length > 0 && (
              <Polyline
                coordinates={[
                  { latitude: startLat, longitude: startLong },
                  {
                    latitude: selectedRoutePoints[0].latitude,
                    longitude: selectedRoutePoints[0].longitude,
                  },
                ]}
                strokeColor="#f59e0b"
                strokeWidth={3}
                lineDashPattern={[5, 5]}
              />
            )}
            {/* Connect selected points to each other */}
            {selectedRoutePoints.map((point, index) => {
              if (index === selectedRoutePoints.length - 1) {
                // Last point - connect to end point if available
                if (endLat !== undefined && endLong !== undefined) {
                  return (
                    <Polyline
                      key={`selected-to-end-${index}`}
                      coordinates={[
                        {
                          latitude: point.latitude,
                          longitude: point.longitude,
                        },
                        { latitude: endLat, longitude: endLong },
                      ]}
                      strokeColor="#f59e0b"
                      strokeWidth={3}
                      lineDashPattern={[5, 5]}
                    />
                  );
                }
                return null;
              }
              return (
                <Polyline
                  key={`selected-${index}`}
                  coordinates={[
                    {
                      latitude: point.latitude,
                      longitude: point.longitude,
                    },
                    {
                      latitude: selectedRoutePoints[index + 1].latitude,
                      longitude: selectedRoutePoints[index + 1].longitude,
                    },
                  ]}
                  strokeColor="#f59e0b"
                  strokeWidth={3}
                  lineDashPattern={[5, 5]}
                />
              );
            })}
          </>
        )}

        {/* Simulated Vehicle Marker */}
        {currentPosition && isSimulating && (
          <Marker
            coordinate={{
              latitude: currentPosition.latitude,
              longitude: currentPosition.longitude,
            }}
            anchor={{ x: 0.5, y: 0.5 }}
            flat={true}
            rotation={currentPosition.heading}
          >
            <View style={styles.vehicleMarker}>
              <Car size={24} color="#fff" strokeWidth={2.5} />
            </View>
          </Marker>
        )}
      </MapView>

      {/* Route Info */}
      {routeSegments.length > 0 && (
        <View style={styles.routeInfoContainer}>
          <Text style={styles.routeInfoTitle}>Thông tin lộ trình:</Text>
          {routeSegments.map((segment, index) => (
            <Text key={index} style={styles.routeInfoText}>
              • Đoạn {index + 1}: {segment.distance} - {segment.duration}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    marginTop: 8,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  map: {
    height: 260,
    width: "100%",
  },
  vehicleMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AppColors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  routeInfoContainer: {
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  routeInfoTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 8,
  },
  routeInfoText: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 4,
  },
});

