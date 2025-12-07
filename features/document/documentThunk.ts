import { createThunk } from "../genericCreateThunk";
import { HttpMethod } from "@/models/enum/HttpMethods";
import { ApplicantDocument, EmergencyContact } from "@/models/document/document";

export const INSTRUCTOR_PATH = "instructors";
export const USER_PATH = "users";

export const getInstructorApplication = createThunk<
  ApplicantDocument,
  { id: string }
>(
  HttpMethod.GET,
  "getInstructorApplication",
  `/${INSTRUCTOR_PATH}/:id/applicants`,
  {
    buildUrl: (payload) => {
      if (!payload.id || payload.id.trim() === "") {
        throw new Error("Instructor ID is required");
      }
      return `/${INSTRUCTOR_PATH}/${payload.id}/applicants`;
    },
  }
);

export const getUserEmergencyContact = createThunk<
  EmergencyContact[],
  { id: string }
>(
  HttpMethod.GET,
  "getUserEmergencyContact",
  `/${USER_PATH}/:id/emergency-contact`,
  {
    buildUrl: (payload) => {
      if (!payload.id || payload.id.trim() === "") {
        throw new Error("User ID is required");
      }
      return `/${USER_PATH}/${payload.id}/emergency-contact`;
    },
  }
);

