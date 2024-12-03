'use client'

import { useState } from 'react';
import Breadcrumbs from '@/components/layout/common/Breadcrumbs';

export default function Profile({ vendorId, profileData }) {
    const apiKeyLabel = process.env.APP_ENV === 'staging' ? 'Sandbox Api Key' : 'Api Key';

    const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);

    const toggleApiKeyVisibility = () => {
        setIsApiKeyVisible(!isApiKeyVisible);
    };

    const copyApiKeyToClipboard = () => {
        navigator.clipboard.writeText(profileData.api_key);
        alert('API Key copied to clipboard!');
    };

    const breadcrumbs = [
        { text: 'Home', url: `/vendor/${vendorId}/dashboard` },
        { text: 'Profile' },
    ];
    return (
        <>
            <Breadcrumbs breadCrumbLinks={breadcrumbs} />

            <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md mt-8">
                <h1 className="text-2xl font-bold mb-6 text-center">Profile Details</h1>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Company Name:</label>
                    <input type="text" name="companyName" value={profileData.company_name} readOnly className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Company Number:</label>
                    <input type="text" name="companyNumber" value={profileData.company_number} readOnly className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Your Email:</label>
                    <input type="email" name="email" value={profileData.user_email} readOnly className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">{apiKeyLabel}:</label>
                    <div className="flex items-center">
                        {!isApiKeyVisible &&
                            <input
                                type="text"
                                name="apiKey"
                                value={'••••••••••••••••'}
                                readOnly
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            />


                        }
                        {isApiKeyVisible &&
                            <textarea
                                name="apiKey"
                                value={profileData.api_key}
                                readOnly
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                rows="11"
                            />
                        }
                        <button
                            onClick={toggleApiKeyVisibility}
                            className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
                        >
                            {isApiKeyVisible ? 'Hide' : 'Reveal'}
                        </button>
                        <button
                            onClick={copyApiKeyToClipboard}
                            className="ml-2 bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded"
                        >
                            Copy
                        </button>
                    </div>
                </div>

            </div>
        </>
    );
}