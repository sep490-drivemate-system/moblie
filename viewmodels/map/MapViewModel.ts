import { SelectedRoutePoint } from "@/lib/map/useSessionMap";

export class MapViewModel {

    handleRemovePoint(pointId: string): (prev: SelectedRoutePoint[]) => SelectedRoutePoint[] {
        return (prev) =>
            prev
                .filter((p) => p.id !== pointId)
                .map((p, idx) => ({
                    ...p,
                    order: idx + 1,
                }));
    }
}
