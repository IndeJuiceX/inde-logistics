'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';  // Use the NextAuth client-side helper

export default function SignIn() {
    const [errorMessage, setErrorMessage] = useState('');  // Track error message
    const [loading, setLoading] = useState(false);  // Track loading state

    const handleSignIn = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage('');

        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');

        try {
            const res = await signIn("credentials", {
                redirect: false,
                email,
                password,
            });
            console.log(res)
            if (!res.ok) {
                setErrorMessage('Invalid email or password');
            } else {
              //  window.location.href = '/';  // Adjust as per your app route
            }
        } catch (error) {
            alert(error)
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
            <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
                <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
                    Sign In to Your Account
                </h2>

                {errorMessage && (
                    <div className="bg-red-100 text-red-700 p-2 rounded-md mb-4">
                        {errorMessage}
                    </div>
                )}

                <form onSubmit={handleSignIn} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            name="email"
                            type="email"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter your email"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            name="password"
                            type="password"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter your password"
                        />
                    </div>

                    <div className="flex justify-between items-center mt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
