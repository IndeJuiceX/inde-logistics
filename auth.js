import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
// Your own logic for dealing with plaintext password strings; be careful!
import { hashPassword, verifyPassword } from "@/services/password"
import { getItem } from "@/lib/dynamodb"

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            // You can specify which fields should be submitted, by adding keys to the `credentials` object.
            // e.g. domain, username, password, 2FA token, etc.
            credentials: {
                email: {},
                password: {},
            },
            authorize: async (credentials) => {
                try {
                    console.log(credentials)
                    let user = null
                    console.log('Attempting to AUTHORIZE')
                    // logic to salt and hash password
                    const pwHash = await hashPassword(credentials.password)
                    // logic to verify if the user exists
                    const res = await getItem('USER#' + credentials.email, 'USER#' + credentials.email)
                    console.log('RESPONSE FROM DB')
                    console.log(res)


                    if (res.success == false) {
                        // No user found, so this is their first attempt to login
                        // meaning this is also the place you could do registration
                        throw new Error("User not found.")
                    }


                    if (res && res.data) {
                        const passMatch = await verifyPassword(credentials.password, pwHash)
                        if (!passMatch) {
                            throw new Error("Invalid Email or Password")
                        }
                        return res.data
                    }

                    // return user object with their profile data
                    //return res.data
                } catch (error) {
                    console.log('AUTH ERROR')
                    console.log(error)
                }

            },
        }),
    ],
})