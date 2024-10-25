'use client';
import convertTime from "@/services/utils/convertTime";
import { useState } from "react";
import RequestLabel from "./RequestLabel";

export default function RequestDetails({ data }) {
    const [activeTab, setActiveTab] = useState("Payload");
    const [payload, setPayload] = useState(data.request_data);
    const [response, setResponse] = useState(data.response_data ? JSON.parse(data.response_data) : {});

    // Sample JSON data for each tab
    const payloadData = {
        example: "payload data here",
    };

    // const headersData = {
    //     "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
    //     "accept-encoding": "gzip, deflate, br, zstd",
    //     referer: "http://localhost:3000/",
    //     "sec-fetch-dest": "empty",
    //     "sec-fetch-mode": "cors",
    //     "sec-fetch-site": "same-site",
    // };

    // const sessionData = {
    //     sessionId: "abc123",
    //     userId: "user789",
    // };

    // const responseData = {
    //     message: "Bad Request",
    //     statusCode: 400,
    // };

    // Function to render the content based on the active tab
    const renderTabContent = () => {
        switch (activeTab) {
            case "Payload":
                return <pre>{JSON.stringify(payloadData, null, 2)}</pre>;
            case "Response":
                return <pre>{JSON.stringify(response, null, 2)}</pre>;
            default:
                return null;
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Request Details Section */}
            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Request Details</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="font-semibold text-gray-500">Time</p>
                        <p>{convertTime(data.timestamp)}</p>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-500">Hostname</p>
                        <p>36e7f6c38a5f</p>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-500">Method</p>
                        <RequestLabel type="method" value={data.method} />
                    </div>
                    <div>
                        <p className="font-semibold text-gray-500">Controller Action</p>
                        <p>App\Http\Controllers\Api\V1\Store\CartController@getCarts</p>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-500">Middleware</p>
                        <p>api</p>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-500">EndPoint</p>
                        <p>{data.endpoint}</p>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-500">Status</p>
                        <RequestLabel type="status" value={data.status} />
                    </div>
                    <div>
                        <p className="font-semibold text-gray-500">Duration</p>
                        <p>{data.duration_ms} ms</p>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-500">IP Address</p>
                        <p>192.168.65.1</p>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-500">Error</p>
                        <p>{data.error ? 'True' : 'false'}</p>
                    </div>
                </div>
            </div>

            {/* Tabbed Section */}
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex space-x-6 border-b mb-4">
                    {["Payload", "Response"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-2 ${activeTab === tab
                                ? "border-blue-500 text-blue-500"
                                : "border-transparent text-gray-500"
                                } hover:text-blue-500 hover:border-blue-500 border-b-2 font-medium`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="bg-gray-900 text-green-500 p-4 rounded-lg">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
}
