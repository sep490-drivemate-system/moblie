import { useCallback, useEffect, useMemo, useState } from "react";

import {
    IInstructorSchedule,
    IInstructorBookedSession,
} from "@/features/booking/bookingThunk";
import {
    getInstructorSchedule,
    getInstructorBookedSessions,
} from "@/features/schedule/scheduleThunk";
import { IInstructorPackages } from "@/models/instructor/instructor.type";
import { BaseViewModel } from "../shared/BaseViewModel";
import { AppDispatch, RootState } from "@/lib/redux/store";
import { getInstructorPackages } from "@/features/package/packageThunk";



export class PackageViewModel extends BaseViewModel<RootState["package"]> {
    constructor(dispatch: AppDispatch, getCurrentState: () => RootState["package"]) {
        super(dispatch, getCurrentState);
    }

    getPackages = async (instructorId: string): Promise<IInstructorPackages[]> => {
        return (await this.executeAsync<IInstructorPackages[]>(async () => {
            const response = await this.dispatch(getInstructorPackages({ id: instructorId })).unwrap();
            return (response as any).value || response;
        })) ?? [];
    };

}

