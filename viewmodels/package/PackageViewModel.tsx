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
import {
  createInstructorPackage,
  getDrivingSkills,
  getInstructorPackages,
  getRoadTypes,
} from "@/features/package/packageThunk";
import {
  CreatePackageForm,
  DrivingSkill,
  RoadType,
} from "@/models/package/package";

export class PackageViewModel extends BaseViewModel<RootState["package"]> {
  constructor(
    dispatch: AppDispatch,
    getCurrentState: () => RootState["package"]
  ) {
    super(dispatch, getCurrentState);
  }

  getPackages = async (
    instructorId: string
  ): Promise<IInstructorPackages[]> => {
    return (
      (await this.executeAsync<IInstructorPackages[]>(async () => {
        const response = await this.dispatch(
          getInstructorPackages({ id: instructorId })
        ).unwrap();
        return (response as any).value || response;
      })) ?? []
    );
  };

  getDrivingSkills = async (): Promise<DrivingSkill[]> => {
    return (
      (await this.executeAsync<DrivingSkill[]>(async () => {
        const response = await this.dispatch(getDrivingSkills()).unwrap();
        return response.value || [];
      })) ?? []
    );
  };

  getRoadTypes = async (): Promise<RoadType[]> => {
    return (
      (await this.executeAsync<RoadType[]>(async () => {
        const response = await this.dispatch(getRoadTypes()).unwrap();
        return response.value || [];
      })) ?? []
    );
  };

  createPackage = async (payload: CreatePackageForm) => {
    const response = await this.dispatch(
      createInstructorPackage(payload)
    ).unwrap();
    console.log(response);
    return (response as any).value ?? response;
  };
}
