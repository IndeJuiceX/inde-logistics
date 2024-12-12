import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { deleteGuestCookie, getGuestCookie } from "@/services/guestCookies";
import { verifyPassword } from "@/services/utils/password"
import { getItem } from "@/services/external/dynamo/wrapper"

export const {
    handlers, signIn, signOut, auth
} = NextAuth({
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: 'jwt'
    },
    providers: [
        Credentials({
            name: 'Credentials',

            async authorize(credentials) {
                try {
                    const guestData = await getGuestCookie();
                    let guest = guestData ? guestData.value : null;

                    const res = await getItem('USER#' + credentials.email, 'USER#' + credentials.email)
                    const resp = res//.json();
                    if (resp.success == false) {
                        throw new Error("User not found.")
                        //return { error: 'User not found' }
                    }


                    if (resp && resp.data) {
                        const passMatch = await verifyPassword(credentials.password, resp.data.password)
                        if (!passMatch) {
                            throw new Error("Invalid Email or Password")
                            // return { error: 'Invalid Email or Password' }
                        }


                    }
                    const user = resp.data;
                    if (user) {
                        deleteGuestCookie();
                        return user
                    }
                    return null;
                } catch (error) {
                    throw new Error(error)
                }
            },
        }),
    ],

    pages: {
        signIn: "/login", // Custom login page
    },
    callbacks: {
        jwt({ token, user }) {
            if (user) {
                token.role = user.user_type; // Adding user_type to the token
                token.vendor = user?.vendor_id
            }
            return token;
        },
        session({ session, token }) {
            session.user.role = token.role;  // Adding role (user_type) to the session
            session.user.vendor = token.vendor
            return session;
        },


    },

});
