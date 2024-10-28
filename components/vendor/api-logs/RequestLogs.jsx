'use client';
import { useEffect, useState } from "react";
import Link from "next/link";
import RequestLabel from "@/components/vendor/api-logs/RequestLabel";



export default function RequestLogs({ data, vendorId }) {
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        const fetchLogs = async () => {
            const response = await fetch(`/api/v1/logs`);
            if (!response.ok) {
                console.error("Failed to fetch logs");
                return;
            }
            const data = await response.json();
            console.log('logs',data);
            
            setLogs(data.data);
            setLoading(false);
            return data
        }
        if (vendorId) {
            fetchLogs();
        }
    }, [vendorId]);



    const [searchTag, setSearchTag] = useState("");

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Logs</h2>
                <input
                    type="text"
                    placeholder="Search Tag"
                    className="border border-gray-300 rounded px-4 py-2"
                    value={searchTag}
                    onChange={(e) => setSearchTag(e.target.value)}
                />
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg shadow">
                    <thead>
                        <tr className="text-left border-b border-gray-300">
                            <th className="px-6 py-3">Verb</th>
                            <th className="px-6 py-3">Path</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Duration</th>

                            <th className="px-6 py-3">Details</th> {/* New Column */}
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr>
                                <td colSpan="7" className="text-center py-4">
                                    Loading...
                                </td>
                            </tr>
                        )}

                        {logs
                            .filter((item) => item.endpoint.includes(searchTag))
                            .map((item, idx) => (
                                <tr key={idx} className="border-b border-gray-200">
                                    <td className="px-6 py-4"><RequestLabel type={'method'} value={item.method} /></td>
                                    <td className="px-6 py-4 text-gray-600">{item.endpoint}</td>
                                    <td className="px-6 py-4">
                                        <RequestLabel type={'status'} value={item.status} />
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{item.duration_ms}ms</td>

                                    <td className="px-6 py-4" >
                                        <Link href={`api-logs/${idx}`} className="text-gray-500 hover:text-blue-500">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                                className="h-5 w-5"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM6.75 9.25a.75.75 0 000 1.5h4.59l-2.1 1.95a.75.75 0 001.02 1.1l3.5-3.25a.75.75 0 000-1.1l-3.5-3.25a.75.75 0 10-1.02 1.1l2.1 1.95H6.75z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
