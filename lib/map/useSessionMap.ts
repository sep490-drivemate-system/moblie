import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";
import MapView from "react-native-maps";
import { useAppDispatch } from "@/lib/redux/hooks";
import { addSessionLog } from "@/features/booking/bookingThunk";
import { ISessionDetailDTO } from "@/models/session/session.type";
import { ISessionRoutes } from "@/models/route/route";
import { parseCoordinateValue, decodePolyline, calculateHeading } from "@/lib/map/mapUtils";

interface RouteSegment {
    coordinates: Array<{ latitude: number; longitude: number }>;
    distance: string;
    duration: string;
    durationValue?: number;
}

interface SelectedRoutePoint {
    id: string;
    latitude: number;
    longitude: number;
    streetName?: string;
    order: number;
}

interface UseSessionMapOptions {
    sessionId: string | string[] | undefined;
    sessionDetail: ISessionDetailDTO | null;
    routesData: ISessionRoutes[] | null;
    pickupDetails: { lat?: number | string | null; long?: number | string | null };
    dropoffDetails: { lat?: number | string | null; long?: number | string | null };
    endDetails: { lat: number | null; long: number | null };
    shouldShowMapForPlanning: boolean;
    goongApiKey?: string;
    maxDurationMinutes?: number | null;
    onSimulationComplete?: () => void;
}

interface UseSessionMapResult {
    mapRef: React.MutableRefObject<MapView | null>;
    selectedRoutePoints: SelectedRoutePoint[];
    setSelectedRoutePoints: React.Dispatch<
        React.SetStateAction<SelectedRoutePoint[]>
    >;
    handleMapPress: (event: any) => void;
    updateSelectedPointLocation: (
        pointId: string,
        latitude: number,
        longitude: number
    ) => void;
    routeSegments: RouteSegment[];
    effectiveRouteSegments: RouteSegment[];
    isSimulating: boolean;
    simulationProgress: number;
    currentPosition: {
        latitude: number;
        longitude: number;
        heading: number;
        speed: number;
    } | null;
    startSimulation: () => void;
    stopSimulation: () => void;
}

export function useSessionMap({
    sessionId,
    sessionDetail,
    routesData,
    pickupDetails,
    dropoffDetails,
    endDetails,
    shouldShowMapForPlanning,
    goongApiKey,
    maxDurationMinutes,
    onSimulationComplete,
}: UseSessionMapOptions): UseSessionMapResult {
    const dispatch = useAppDispatch();
    const mapRef = useRef<MapView | null>(null);
    const [routeSegments, setRouteSegments] = useState<RouteSegment[]>([]);
    const [selectedRoutePoints, setSelectedRoutePoints] = useState<SelectedRoutePoint[]>([]);
    const [isSimulating, setIsSimulating] = useState(false);
    const lastAddedPointIdRef = useRef<string | null>(null);
    const lastActionRef = useRef<"add" | null>(null);
    const [currentPosition, setCurrentPosition] = useState<{
        latitude: number;
        longitude: number;
        heading: number;
        speed: number;
    } | null>(null);
    const [simulationProgress, setSimulationProgress] = useState(0);
    const simulationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const logIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const allRouteCoordinates = useRef<Array<{ latitude: number; longitude: number }>>([]);
    const fetchDirectionsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const mapStartLat = parseCoordinateValue(pickupDetails.lat as any);
    const mapStartLong = parseCoordinateValue(pickupDetails.long as any);

    const fallbackSegments = useMemo(() => {
        if (
            pickupDetails.lat === undefined ||
            pickupDetails.long === undefined ||
            dropoffDetails.lat === undefined ||
            dropoffDetails.long === undefined
        ) {
            return [];
        }

        return [
            {
                coordinates: [
                    {
                        latitude: Number(pickupDetails.lat),
                        longitude: Number(pickupDetails.long),
                    },
                    {
                        latitude: Number(dropoffDetails.lat),
                        longitude: Number(dropoffDetails.long),
                    },
                ],
                distance: "N/A",
                duration: "N/A",
            },
        ];
    }, [pickupDetails.lat, pickupDetails.long, dropoffDetails.lat, dropoffDetails.long]);

    const effectiveRouteSegments =
        routeSegments.length > 0 ? routeSegments : fallbackSegments;

    const getStreetName = useCallback(
        async (lat: number, lng: number): Promise<string> => {
            try {
                if (!goongApiKey) {
                    return "Đường không xác định";
                }
                const url = `https://rsapi.goong.io/Geocode?latlng=${lat},${lng}&api_key=${goongApiKey}`;
                const response = await fetch(url);
                const json = await response.json();

                if (json.status === "OK" && json.results && json.results.length > 0) {
                    const address =
                        json.results[0].formatted_address ||
                        json.results[0].address_components?.[0]?.long_name;
                    return address || "Đường không xác định";
                }
                return "Đường không xác định";
            } catch (error) {
                console.error("Error getting street name:", error);
                return "Đường không xác định";
            }
        },
        [goongApiKey]
    );

    const fetchGoongDirections = useCallback(
        async (routes: ISessionRoutes[], startLat?: number, startLng?: number) => {
            try {
                let startPointLat = startLat;
                let startPointLng = startLng;

                if (startPointLat === undefined || startPointLng === undefined) {
                    const sessionLat = parseCoordinateValue(
                        sessionDetail?.startingLatitude as any
                    );
                    const sessionLng = parseCoordinateValue(
                        sessionDetail?.startingLongtitude as any
                    );
                    startPointLat = sessionLat ?? undefined;
                    startPointLng = sessionLng ?? undefined;
                }

                if (
                    (startPointLat === undefined || startPointLng === undefined) &&
                    routes.length > 0
                ) {
                    const routeLat = parseCoordinateValue(routes[0].latitudeStart as any);
                    const routeLng = parseCoordinateValue(routes[0].longitudeStart as any);
                    startPointLat = routeLat ?? undefined;
                    startPointLng = routeLng ?? undefined;
                }

                if (startPointLat === undefined || startPointLng === undefined) {
                    console.warn(" Goong directions skipped: invalid start coordinates");
                    return;
                }

                const endLatFromSession = parseCoordinateValue(
                    sessionDetail?.endingLatitude as any
                );
                const endLngFromSession = parseCoordinateValue(
                    sessionDetail?.endingLongtitude as any
                );
                const endPointLat =
                    typeof endDetails.lat === "number"
                        ? endDetails.lat
                        : endLatFromSession ?? undefined;
                const endPointLng =
                    typeof endDetails.long === "number"
                        ? endDetails.long
                        : endLngFromSession ?? undefined;

                const allPoints = [
                    { lat: startPointLat, lng: startPointLng },
                    ...routes
                        .map((r) => {
                            const lat = parseCoordinateValue(r.latitudeStart as any);
                            const lng = parseCoordinateValue(r.longitudeStart as any);
                            if (lat === null || lng === null) return null;
                            return { lat, lng };
                        })
                        .filter(
                            (point): point is { lat: number; lng: number } => point !== null
                        ),
                ];

                if (endPointLat !== undefined && endPointLng !== undefined) {
                    allPoints.push({ lat: endPointLat, lng: endPointLng });
                }

                if (allPoints.length < 2) {
                    console.warn("⚠️ Goong directions skipped: not enough points (need at least 2)");
                    return;
                }

                const segments: RouteSegment[] = [];

                for (let i = 0; i < allPoints.length - 1; i++) {
                    const origin = allPoints[i];
                    const destination = allPoints[i + 1];

                    const url = `https://rsapi.goong.io/Direction?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&vehicle=car&api_key=${goongApiKey}`;
                    const response = await fetch(url);
                    const json = await response.json();

                    if (json.error) {
                        segments.push({
                            coordinates: [
                                { latitude: origin.lat, longitude: origin.lng },
                                { latitude: destination.lat, longitude: destination.lng },
                            ],
                            distance: "N/A",
                            duration: "N/A",
                        });
                    } else if (json.routes && json.routes[0]) {
                        const route = json.routes[0];

                        if (route.overview_polyline && route.overview_polyline.points) {
                            try {
                                const coordinates = decodePolyline(
                                    route.overview_polyline.points
                                );

                                segments.push({
                                    coordinates,
                                    distance: route.legs?.[0]?.distance?.text || "N/A",
                                    duration: route.legs?.[0]?.duration?.text || "N/A",
                                    durationValue:
                                        route.legs?.[0]?.duration?.value ?? undefined,
                                });
                            } catch (decodeError) {
                                console.error(
                                    `❌ Error decoding polyline for segment ${i + 1}:`,
                                    decodeError
                                );
                            }
                        }
                    }
                }

                if (segments.length === 0) {
                    const fallbackSegments = allPoints.slice(0, -1).map((point, index) => ({
                        coordinates: [
                            { latitude: point.lat, longitude: point.lng },
                            { latitude: allPoints[index + 1].lat, longitude: allPoints[index + 1].lng },
                        ],
                        distance: "N/A",
                        duration: "N/A",
                    }));
                    setRouteSegments(fallbackSegments);
                    return;
                }

                setRouteSegments(segments);
            } catch (error) {
                console.error("❌ Error fetching Goong directions:", error);
                setRouteSegments([]);
            }
        },
        [endDetails.lat, endDetails.long, goongApiKey, sessionDetail?.endingLatitude, sessionDetail?.endingLongtitude, sessionDetail?.startingLatitude, sessionDetail?.startingLongtitude]
    );

    const requestDirections = useCallback(
        (routes: ISessionRoutes[], startLat?: number, startLng?: number) => {
            if (fetchDirectionsTimeoutRef.current) {
                clearTimeout(fetchDirectionsTimeoutRef.current);
            }
            fetchDirectionsTimeoutRef.current = setTimeout(() => {
                fetchGoongDirections(routes, startLat, startLng);
            }, 700);
        },
        [fetchGoongDirections]
    );

    useEffect(() => {
        const startLat = parseCoordinateValue(pickupDetails.lat as any) ?? undefined;
        const startLng = parseCoordinateValue(pickupDetails.long as any) ?? undefined;
        const dataForDirections = routesData ?? [];

        if (!dataForDirections || dataForDirections.length === 0) {
            return;
        }

        requestDirections(
            dataForDirections as unknown as ISessionRoutes[],
            startLat,
            startLng
        );
    }, [
        routesData,
        pickupDetails.lat,
        pickupDetails.long,
        requestDirections,
    ]);

    useEffect(() => {
        if (!shouldShowMapForPlanning) {
            return;
        }

        if (typeof mapStartLat !== "number" || typeof mapStartLong !== "number") {
            return;
        }

        const normalizedSessionId =
            typeof sessionId === "string"
                ? sessionId
                : Array.isArray(sessionId) && sessionId.length > 0
                    ? sessionId[0]
                    : "temp-session";

        if (selectedRoutePoints.length === 0) {
            // Không refetch bằng dữ liệu rỗng để tránh mất polyline hiện có
            return;
        }

        const planningRoutes = selectedRoutePoints.map((point, index) => ({
            id: point.id,
            sessionId: normalizedSessionId,
            streetName: point.streetName || `Điểm mới ${index + 1}`,
            textInstruction: point.streetName || `Điểm mới ${index + 1}`,
            latitudeStart: point.latitude,
            longitudeStart: point.longitude,
        }));

        requestDirections(
            planningRoutes as unknown as ISessionRoutes[],
            mapStartLat as number,
            mapStartLong as number
        );
    }, [
        selectedRoutePoints,
        shouldShowMapForPlanning,
        mapStartLat,
        mapStartLong,
        sessionId,
        routesData,
        requestDirections,
    ]);

    useEffect(() => {
        return () => {
            if (fetchDirectionsTimeoutRef.current) {
                clearTimeout(fetchDirectionsTimeoutRef.current);
            }
        };
    }, []);

    const sendSessionLog = useCallback(
        async (lat: number, lng: number, heading: number, speed: number, isCompleted: boolean = false) => {
            if (!sessionId || typeof sessionId !== "string") return;

            try {
                const streetName = await getStreetName(lat, lng);
                await dispatch(
                    addSessionLog({
                        sessionId,
                        logData: {
                            streetName,
                            latitude: lat,
                            longitude: lng,
                            heading: heading.toFixed(2) + "°",
                            speed: Math.round(speed),
                            isCompleted: isCompleted,
                        },
                    })
                ).unwrap();
            } catch {
                // ignore logging errors for now
            }
        },
        [dispatch, getStreetName, sessionId]
    );

    const handleMapPress = useCallback(
        async (event: any) => {
            if (!shouldShowMapForPlanning) return;

            const { latitude, longitude } = event.nativeEvent.coordinate;
            const streetName = await getStreetName(latitude, longitude);

            const newPoint: SelectedRoutePoint = {
                id: `point-${Date.now()}`,
                latitude,
                longitude,
                streetName,
                order: selectedRoutePoints.length + 1,
            };

            lastAddedPointIdRef.current = newPoint.id;
            lastActionRef.current = "add";
            setSelectedRoutePoints((prev) => [...prev, newPoint]);
        },
        [getStreetName, selectedRoutePoints.length, shouldShowMapForPlanning]
    );

    const updateSelectedPointLocation = useCallback(
        async (pointId: string, latitude: number, longitude: number) => {
            const streetName = await getStreetName(latitude, longitude);
            setSelectedRoutePoints((prev) =>
                prev.map((point) =>
                    point.id === pointId
                        ? {
                            ...point,
                            latitude,
                            longitude,
                            streetName,
                        }
                        : point
                )
            );
        },
        [getStreetName]
    );

    useEffect(() => {
        if (
            !shouldShowMapForPlanning ||
            typeof maxDurationMinutes !== "number" ||
            lastActionRef.current !== "add"
        ) {
            return;
        }

        const totalMinutes = routeSegments.reduce((sum, segment) => {
            if (typeof segment.durationValue === "number") {
                return sum + segment.durationValue / 60;
            }
            return sum;
        }, 0);

        if (
            totalMinutes > maxDurationMinutes &&
            lastAddedPointIdRef.current
        ) {
            const pointIdToRemove = lastAddedPointIdRef.current;
            Alert.alert(
                "Vượt quá thời gian",
                `Lộ trình vượt quá ${maxDurationMinutes} phút. Vui lòng giảm số điểm trên lộ trình.`
            );
            setSelectedRoutePoints((prev) =>
                prev.filter((point) => point.id !== pointIdToRemove)
            );
        }

        lastAddedPointIdRef.current = null;
        lastActionRef.current = null;
    }, [
        routeSegments,
        maxDurationMinutes,
        shouldShowMapForPlanning,
        setSelectedRoutePoints,
    ]);

    const startSimulation = useCallback(() => {
        if (!effectiveRouteSegments.length || isSimulating) return;

        const allCoordinates: Array<{ latitude: number; longitude: number }> = [];
        effectiveRouteSegments.forEach((segment) => {
            allCoordinates.push(...segment.coordinates);
        });

        if (allCoordinates.length === 0) {
            return;
        }
        allRouteCoordinates.current = allCoordinates;
        setIsSimulating(true);
        setSimulationProgress(0);

        const startPos = allCoordinates[0];
        const nextPos = allCoordinates[1] || startPos;
        const initialHeading = calculateHeading(startPos, nextPos);
        const speedKmh = 40;

        setCurrentPosition({
            ...startPos,
            heading: initialHeading,
            speed: speedKmh,
        });

        const SIMULATION_DURATION = 120000;
        const SAVE_INTERVAL = 15000;
        const UPDATE_INTERVAL = 100;

        const startTime = Date.now();
        const totalPoints = allCoordinates.length;

        sendSessionLog(startPos.latitude, startPos.longitude, initialHeading, speedKmh, false);
        let lastSaveTime = 0;

        simulationIntervalRef.current = setInterval(() => {
            const elapsed = Date.now() - startTime;

            if (elapsed >= SIMULATION_DURATION) {
                const finalIndex = Math.min(
                    Math.floor((99.9 / 100) * totalPoints),
                    totalPoints - 1
                );
                const finalPos = allCoordinates[finalIndex];
                const finalNextPos =
                    allCoordinates[Math.min(finalIndex + 1, totalPoints - 1)] || finalPos;
                const finalHeading = calculateHeading(finalPos, finalNextPos);
                sendSessionLog(
                    finalPos.latitude,
                    finalPos.longitude,
                    finalHeading,
                    speedKmh,
                    true // Điểm cuối cùng: isCompleted = true
                );
                // Đặt progress = 100 để đảm bảo tất cả điểm có tích
                setSimulationProgress(100);
                stopSimulation();
                // Gọi callback khi simulation hoàn thành
                if (onSimulationComplete) {
                    onSimulationComplete();
                }
                return;
            }

            const progress = (elapsed / SIMULATION_DURATION) * 100;
            setSimulationProgress(progress);

            const currentIndex = Math.min(
                Math.floor((progress / 100) * totalPoints),
                totalPoints - 1
            );

            const currentPos = allCoordinates[currentIndex];
            const nextPos =
                allCoordinates[Math.min(currentIndex + 1, totalPoints - 1)] ||
                currentPos;
            const heading = calculateHeading(currentPos, nextPos);

            setCurrentPosition({
                ...currentPos,
                heading,
                speed: speedKmh + Math.random() * 10 - 5,
            });

            if (mapRef.current) {
                mapRef.current.animateToRegion(
                    {
                        latitude: currentPos.latitude,
                        longitude: currentPos.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    },
                    500
                );
            }

            if (elapsed - lastSaveTime >= SAVE_INTERVAL) {
                lastSaveTime = elapsed;
                const currentSpeed = speedKmh + Math.random() * 10 - 5;
                sendSessionLog(
                    currentPos.latitude,
                    currentPos.longitude,
                    heading,
                    currentSpeed,
                    false // Các điểm giữa chừng: isCompleted = false
                );
            }
        }, UPDATE_INTERVAL);
    }, [
        effectiveRouteSegments,
        isSimulating,
        sendSessionLog,
        onSimulationComplete,
    ]);

    const stopSimulation = useCallback(() => {
        if (simulationIntervalRef.current) {
            clearInterval(simulationIntervalRef.current);
            simulationIntervalRef.current = null;
        }
        if (logIntervalRef.current) {
            clearInterval(logIntervalRef.current);
            logIntervalRef.current = null;
        }
        setIsSimulating(false);
        setSimulationProgress(0);
    }, []);

    useEffect(() => {
        return () => {
            stopSimulation();
        };
    }, [stopSimulation]);

    return {
        mapRef,
        selectedRoutePoints,
        setSelectedRoutePoints,
        handleMapPress,
        updateSelectedPointLocation,
        routeSegments,
        effectiveRouteSegments,
        isSimulating,
        simulationProgress,
        currentPosition,
        startSimulation,
        stopSimulation,
    };
}

export type { SelectedRoutePoint };

