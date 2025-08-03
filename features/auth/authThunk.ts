import { createThunk } from "../genericCreateThunk";
import { HttpMethod } from "@/models/enum/httpMethod";
import { ISignInRequest, ISignInResponse } from "@/models/auth/signin";

export const signIn = createThunk<ISignInResponse, ISignInRequest>(
    HttpMethod.POST,
    `signin`,
    `auth/signin`,
    {
        onSuccess: (res) => {
            console.log(res);
        },
    }
);

export const signIWithGoogle = createThunk<void, void>(
    HttpMethod.GET,
    "signin-google",
    `auth/signin-google`,
    {
        onSuccess: (res) => {
            console.log("Google signin initiated:", res);
        },
        onError: (error) => {
            console.error("Error initiating Google login:", error);
        },
    }
);

export const signInWithFacebook = createThunk<void, void>(
    HttpMethod.GET,
    "signin-facebook",
    `auth/signin-facebook`,
    {
        onSuccess: (res) => {
            console.log("Facebook signin initiated:", res);
        },
        onError: (error) => {
            console.error("Error initiating Facebook login:", error);
        },
    }
);

export const signInWithZalo = createThunk<void, void>(
    HttpMethod.GET,
    "signin-zalo",
    `auth/signin-zalo`,
    {
        onSuccess: (res) => {
            console.log("Zalo signin initiated:", res);
        },
        onError: (error) => {
            console.error("Error initiating Zalo login:", error);
        },
    }
);

export const signUp = createThunk<boolean, ISignInRequest>(
    HttpMethod.POST,
    `signup`,
    `auth/signup`,
);
