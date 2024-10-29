'use client';
import { convertTime } from "@/services/utils/convertTime";
import { useState, useEffect } from "react";
import RequestLabel from "./RequestLabel";
import Breadcrumbs from "@/components/layout/common/Breadcrumbs";

export default function RequestDetails({ logId, vendorId }) {
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);

    const [activeTab, setActiveTab] = useState("Payload");
    const [payload, setPayload] = useState({});
    const [response, setResponse] = useState({});

    useEffect(() => {
        const fetchLogs = async () => {
            const response = await fetch(`/api/v1/logs?log_id=${logId}`);
            if (!response.ok) {
                console.error("Failed to fetch logs");
                return;
            }
            const data = await response.json();
            console.log('details page', data);

            setData(data);
            setLoading(false);
            return data
        }

        if (logId) {
            fetchLogs();
        }
    }, [logId]);

    useEffect(() => {
        if (data && data.request_data) {
            try {
                const requestData = JSON.parse(data.request_data);
                console.log('data.request_data', requestData.payload);

                setPayload(requestData.payload);
            } catch (error) {
                console.error("Error parsing request_data", error);
                setPayload({});
            }
        }
        if (data && data.response_data) {
            try {
                setResponse(JSON.parse(data.response_data));
            } catch (error) {
                console.error("Error parsing response_data", error);
                setResponse({});
            }
        }
    }, [data]);

    // Function to render the content based on the active tab
    const renderTabContent = () => {
        switch (activeTab) {
            case "Payload":
                return <pre>{JSON.stringify(payload, null, 2)}</pre>;
            case "Response":
                return <pre>{JSON.stringify(response, null, 2)}</pre>;
            default:
                return null;
        }
    };
    const breadCrumbLinks = [
        { text: 'Home', url: `/vendor/${vendorId}/dashboard` },
        { text: 'Logs', url: `/vendor/${vendorId}/api-logs` },
        { text: 'Logs Details' }
    ];
    return (
        <>
            <Breadcrumbs breadCrumbLinks={breadCrumbLinks} />
            <div className="p-6 space-y-6">
                {loading && <p>Loading...</p>}
                {!loading && (
                    <>
                        <div className="bg-white shadow rounded-lg p-6">
                            <h2 className="text-xl font-bold mb-4">Request Details</h2>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="font-semibold text-gray-500">Time</p>
                                    <p>{convertTime(data.timestamp)}</p>
                                </div>
                                {/* <div>
                <p className="font-semibold text-gray-500">Hostname</p>
                <p>36e7f6c38a5f</p>
              </div> */}
                                <div>
                                    <p className="font-semibold text-gray-500">Method</p>
                                    <RequestLabel type="method" value={data.method} />
                                </div>
                                {/* <div>
                <p className="font-semibold text-gray-500">Controller Action</p>
                <p>App\Http\Controllers\Api\V1\Store\CartController@getCarts</p>
              </div> */}
                                {/* <div>
                <p className="font-semibold text-gray-500">Middleware</p>
                <p>api</p>
              </div> */}
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
                                {/* <div>
                <p className="font-semibold text-gray-500">IP Address</p>
                <p>192.168.65.1</p>
              </div> */}
                                <div>
                                    <p className="font-semibold text-gray-500">Error</p>
                                    <p>{typeof data.error === 'string' ? 'false' : 'True'}</p>
                                </div>
                            </div>
                        </div>
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
                    </>
                )}
            </div>
        </>
    );
}