'use server'

import { signIn, signOut, auth } from "@/auth"
import { AuthError } from "next-auth";


export async function doLogIn(formData) {
    try {
        const result = await signIn('credentials', {
            email: formData.get('email'),
            password: formData.get('password'),
            redirect: false
        });
        if (result.error) {
            return { error: result.error };
        }

        return result;
    } catch (error) {
        switch (error.type) {
            case "CallbackRouteError" || "CredentialsSignin":
                return { error: "Invalid Credentials!" };
            default:
                return { error: "Something went wrong!" };
        }
        throw new Error(error)
    }
}

export async function doLogOut() {
    await signOut({ redirectTo: '/' });
}

export async function getLoggedInUser() {
    const session = await auth();
    return session?.user;
}