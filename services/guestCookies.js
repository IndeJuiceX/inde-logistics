'use server'

import { cookies } from 'next/headers'

export async function deleteGuestCookie() {
    return cookies().delete('guest')
}

export async function getGuestCookie() {
    // return cookies().get('guest')
    const cookieStore = cookies()
    return cookieStore.get('guest')
}