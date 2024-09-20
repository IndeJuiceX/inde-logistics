import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { deleteGuestCookie, getGuestCookie } from "@/services/guestCookies";
import {verifyPassword } from "@/services/password"
import { getItem } from "@/lib/dynamodb"

export const {
    handlers: { GET, POST },
    auth,
} = NextAuth({
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {},
            async authorize(credentials) {
                const guestData = await getGuestCookie();
                let guest = guestData ? guestData.value : null;
                
                const res = await getItem('USER#' + credentials.email, 'USER#' + credentials.email)
                const resp = res//.json();
                if (resp.success == false) {
                    throw new Error("User not found.")
                }


                if (resp && resp.data) {
                    const passMatch = await verifyPassword(credentials.password, resp.data.password)
                    if (!passMatch) {
                        throw new Error("Invalid Email or Password")
                    }
                    console.log('PASS MATCHED--')
                    
                }
                const user = resp.data;
                if (user) {
                    deleteGuestCookie();
                    return user;
                } else {
                    throw new Error(error);
                }
            },
        }),
    ],

    pages: {
        signIn: "/login",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) token.user = user;
            return token;
        },
        async session({ session, token }) {
            session.user = token.user;
            return session;
        },
    },
});
