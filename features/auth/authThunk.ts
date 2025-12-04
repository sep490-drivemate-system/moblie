import { createThunk } from "../genericCreateThunk";
import { ISignInRequest, ISignInResponse } from "@/models/auth/signin";
import { ISignUpRequest, ISignUpResponse } from "@/models/auth/signup";
import {
  IVerifyEmailRequest,
  IVerifyEmailResponse,
} from "@/models/auth/verifyEmail";
import { IVerifyRequest } from "@/models/auth/verify";
import { HttpMethod } from "@/models/enum/HttpMethods";
import { Policy } from "@/models/policy/policy";

export const AUTH_PATH = "auth";

export const signIn = createThunk<ISignInResponse, ISignInRequest>(
  HttpMethod.POST,
  `signin`,
  `/${AUTH_PATH}/signin`
);

export const signInWithGoogle = createThunk<void, void>(
  HttpMethod.GET,
  "signin-google",
  `${AUTH_PATH}/signin-google`
);

export const signUp = createThunk<ISignUpResponse, ISignUpRequest>(
  HttpMethod.POST,
  `signup`,
  `${AUTH_PATH}/signup`
);

export const verifyEmail = createThunk<
  IVerifyEmailResponse,
  IVerifyEmailRequest
>(HttpMethod.POST, `verify-email`, `/${AUTH_PATH}/verify-email`);

export const verify = createThunk<string, IVerifyRequest>(
  HttpMethod.POST,
  `verify`,
  `/${AUTH_PATH}/verify`
);

export const registerInstructor = createThunk<string, FormData>(
  HttpMethod.POST,
  `register-instructor`,
  `/instructors/register`,
  {
    config: () => ({
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  }
);

export const getInstructorPolicy = createThunk<Policy[], { type: number }>(
  HttpMethod.GET,
  `instructor-policy`,
  `policy`,
  {
    buildUrl: (payload) => `policy?policyType=${payload.type}`,
  }
);
