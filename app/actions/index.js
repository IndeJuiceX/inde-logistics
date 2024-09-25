'use server'

import { signIn, signOut } from "@/auth"

export async function doLogIn(formData){
    try{
        const result = await signIn('credentials',{
            email : formData.get('email'),
            password : formData.get('password'),
            redirect :false
        });
        return result;
    }catch(error) {
        throw new Error(error)
    }
}

export async function doLogOut(){
   await signOut({redirectTo :'/'});
}