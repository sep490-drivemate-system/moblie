export const parseCoordinateValue = (
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

export const decodePolyline = (encoded: string) => {
    const points: { latitude: number; longitude: number }[] = [];
    let index = 0;
    const len = encoded.length;
    let lat = 0;
    let lng = 0;

    while (index < len) {
        let b;
        let shift = 0;
        let result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
        lat += dlat;

        shift = 0;
        result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
        lng += dlng;

        points.push({
            latitude: lat / 1e5,
            longitude: lng / 1e5,
        });
    }

    return points;
};

export const calculateHeading = (
    from: { latitude: number; longitude: number },
    to: { latitude: number; longitude: number }
): number => {
    const lat1 = (from.latitude * Math.PI) / 180;
    const lat2 = (to.latitude * Math.PI) / 180;
    const deltaLng = ((to.longitude - from.longitude) * Math.PI) / 180;

    const x = Math.sin(deltaLng) * Math.cos(lat2);
    const y =
        Math.cos(lat1) * Math.sin(lat2) -
        Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);

    const heading = Math.atan2(x, y);
    const headingDegrees = (heading * 180) / Math.PI;
    return (headingDegrees + 360) % 360;
};

const encodeCoordinateComponent = (current: number, previous: number): string => {
    let coordinate = current - previous;
    coordinate <<= 1;
    if (current - previous < 0) {
        coordinate = ~coordinate;
    }

    let output = "";
    while (coordinate >= 0x20) {
        output += String.fromCharCode((0x20 | (coordinate & 0x1f)) + 63);
        coordinate >>= 5;
    }
    output += String.fromCharCode(coordinate + 63);
    return output;
};

export const encodePolyline = (
    coordinates: Array<{ latitude: number; longitude: number }>
): string => {
    if (!Array.isArray(coordinates) || coordinates.length === 0) {
        return "";
    }

    let previousLat = 0;
    let previousLng = 0;
    let result = "";

    coordinates.forEach(({ latitude, longitude }) => {
        const scaledLat = Math.round(latitude * 1e5);
        const scaledLng = Math.round(longitude * 1e5);

        result += encodeCoordinateComponent(scaledLat, previousLat);
        result += encodeCoordinateComponent(scaledLng, previousLng);

        previousLat = scaledLat;
        previousLng = scaledLng;
    });

    return result;
};