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
  getPackages,
  getRecommendedPackages,
  getRoadTypes,
} from "@/features/package/packageThunk";
import { setIsRefreshing } from "@/features/package/packageSlice";
import {
  CreatePackageForm,
  DrivingSkill,
  GetPackagesParams,
  Package,
  PaginatedPackagesResponse,
  RoadType,
} from "@/models/package/package";

export class PackageViewModel extends BaseViewModel<RootState["package"]> {
  constructor(
    dispatch: AppDispatch,
    getCurrentState: () => RootState["package"]
  ) {
    super(dispatch, getCurrentState);
  }

  getPackagesByInstructorId = async (
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

  refreshPackages = async (
    instructorId: string
  ): Promise<IInstructorPackages[]> => {
    this.dispatch(setIsRefreshing(true));
    try {
      return await this.getPackagesByInstructorId(instructorId);
    } finally {
      this.dispatch(setIsRefreshing(false));
    }
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

  getPackages = async (
    params?: GetPackagesParams
  ): Promise<PaginatedPackagesResponse> => {
    return (
      (await this.executeAsync<PaginatedPackagesResponse>(async () => {
        const response = await this.dispatch(
          getPackages(params || {})
        ).unwrap();
        return (
          (response as any).value || {
            currentPage: 1,
            pageSize: 12,
            totalCount: 0,
            pageContent: [],
          }
        );
      })) ?? {
        currentPage: 1,
        pageSize: 12,
        totalCount: 0,
        pageContent: [],
      }
    );
  };

  getRecommendedPackages = async (): Promise<Package[]> => {
    return (
      (await this.executeAsync<Package[]>(async () => {
        const response = await this.dispatch(getRecommendedPackages()).unwrap();
        return response.value || [];
      })) ?? []
    );
  };
}
