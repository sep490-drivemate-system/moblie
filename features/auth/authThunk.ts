import { createThunk } from "../genericCreateThunk";
import { ISignInRequest, ISignInResponse } from "@/models/auth/signin";
import { ISignUpRequest, ISignUpResponse } from "@/models/auth/signup";
import { HttpMethod } from "@/models/enum/HttpMethods";

export const AUTH_PATH = "auth";

export const signIn = createThunk<ISignInResponse, ISignInRequest>(
    HttpMethod.POST,
    `signin`,
    `/${AUTH_PATH}/signin`,
);

export const signInWithGoogle = createThunk<void, void>(
    HttpMethod.GET,
    "signin-google",
    `${AUTH_PATH}/signin-google`,
);

export const signUp = createThunk<ISignUpResponse, ISignUpRequest>(
    HttpMethod.POST,
    `signup`,
    `${AUTH_PATH}/signup`,
);

