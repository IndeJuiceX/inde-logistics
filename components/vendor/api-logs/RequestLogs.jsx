'use client';
import { useEffect, useState } from "react";
import Link from "next/link";
import RequestLabel from "@/components/vendor/api-logs/RequestLabel";

export default function RequestLogs({ data, vendorId }) {
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState([]);
    const [searchTag, setSearchTag] = useState("");
    const [nextTokens, setNextTokens] = useState([]);
    const [currentToken, setCurrentToken] = useState(null);
    const [page, setPage] = useState(0);
    const [currentQueryExecutionId, setCurrentQueryExecutionId] = useState(null);

    const fetchLogs = async (nextToken = null) => {
        setLoading(true);
        let url = `/api/v1/logs`;
        if (nextToken) {
            const encodedNextToken = encodeURIComponent(nextToken);
            const encodeCurrentQueryExecutionId = encodeURIComponent(currentQueryExecutionId);
            url = `/api/v1/logs?next=${encodedNextToken}&queryExecutionId=${encodeCurrentQueryExecutionId}`;
        }
        const response = await fetch(url);
        if (!response.ok) {
            console.error("Failed to fetch logs");
            return;
        }
        const data = await response.json();
        console.log('logs', data);

        setNextTokens([...nextTokens, { [page + 1]: currentToken }]);
        setCurrentQueryExecutionId(data.queryExecutionId);
        setLogs(data.data);
        setLoading(false);
        return data
    }

    useEffect(() => {
        if (vendorId) {
            fetchLogs();
        }
    }, [vendorId]);

    const handleNext = () => {
        console.log('Next clicked');
        setPage(page + 1);
        // setNextTokens([...nextTokens, { [page + 1]: currentToken }]);
        fetchLogs(currentToken);
    }

    const handlePageClick = (pageNumber) => {
        console.log('Page clicked', pageNumber);
        console.log('nextTokens', nextTokens[pageNumber]);

        // setPage(pageNumber);
        // fetchLogs(nextTokens[pageNumber]);
    }

    useEffect(() => {
        console.log('nextTokens', nextTokens);
        console.log('page', page);

    }, [nextTokens, page]);

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
                            <th>#</th>
                            <th className="px-6 py-3">Verb</th>
                            <th className="px-6 py-3">Path</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Duration</th>
                            <th className="px-6 py-3">Time</th>
                            <th className="px-6 py-3">Details</th>
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

                        {!loading && logs.map((item, idx) => (
                            <tr key={idx} className="border-b border-gray-200">
                                <td className="px-6 py-4">{idx + 1}</td>
                                <td className="px-6 py-4"><RequestLabel type={'method'} value={item.method} /></td>
                                <td className="px-6 py-4 text-gray-600">{item.endpoint}</td>
                                <td className="px-6 py-4">
                                    <RequestLabel type={'status'} value={item.status} />
                                </td>
                                <td className="px-6 py-4 text-gray-600">{item.duration_ms}ms</td>
                                <td className="px-6 py-4 text-gray-600">{item.timestamp}</td>
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
                {/* {!loading && ( */}
                <div className="flex space-x-2 mt-4">
                    {/* Generate buttons for each page from 1 up to current page */}
                    {Array.from({ length: page }, (_, index) => (
                        <button
                            key={index + 1}
                            onClick={() => handlePageClick(index + 1)}
                            className={`${index + 1 === page ? 'bg-blue-600' : 'bg-blue-500'
                                } hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline`}
                            disabled={loading}
                        >
                            {index + 1}
                        </button>
                    ))}

                    {/* Next button */}
                    <button onClick={handleNext} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" disabled={loading}>
                        Next
                    </button>
                </div>
                {/* )} */}
            </div>
        </div>
    );
}
