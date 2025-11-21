import React, { useMemo } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SessionStatus } from "@/models/session/session.enum";
import RouteDetail from "../../../components/Session/RouteDetail";
import SessionsList, {
  StatusFilter,
} from "@/components/Session/Sessions";

const mapStatusToFilter = (status?: string | number): StatusFilter => {
  if (status === undefined || status === null) return "all";
  const statusNumber =
    typeof status === "string" ? parseInt(status, 10) : Number(status);

  switch (statusNumber) {
    case SessionStatus.Planning:
      return "planning";
    case SessionStatus.Upcoming:
      return "upcoming";
    case SessionStatus.InProgress:
      return "in_progress";
    case SessionStatus.Completed:
      return "completed";
    case SessionStatus.Reschedule:
      return "reschedule";
    case SessionStatus.Cancelled:
      return "cancelled";
    default:
      return "all";
  }
};

export default function RoutesScreen() {
  const params = useLocalSearchParams<{
    sessionId?: string;
    status?: string;
  }>();
  const router = useRouter();

  if (params.sessionId) {
    return <RouteDetail />;
  }

  const initialStatus = useMemo<StatusFilter>(
    () => mapStatusToFilter(params.status),
    [params.status]
  );

  return (
    <SessionsList
      initialStatus={initialStatus}
      onSessionPress={(session) =>
        router.push({
          pathname: "/(main)/(no-tabs)/routes" as any,
          params: {
            sessionId: session.id,
            status: session.status?.toString() ?? "",
            pickupLocation: session.displayStartLocationName || "Điểm đón",
            startingLatitude: session.startingLatitude?.toString() || "",
            startingLongtitude: session.startingLongtitude?.toString() || "",
            duration: session.duration?.toString() || "",
            displayStartLocationName: session.displayStartLocationName || "",
            displayEndLocationName: session.displayEndLocationName || "",
            endingLatitude: session.endingLatitude?.toString() || "",
            endingLongtitude: session.endingLongtitude?.toString() || "",
          },
        })
      }
      showHeader
      enableScroll
    />
  );
}
