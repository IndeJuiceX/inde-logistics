'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Breadcrumbs from '@/components/layout/common/Breadcrumbs';

export default function UploadProduct({ vendorId }) {
    const router = useRouter();

    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const maxSizeInBytes = 2 * 1024 * 1024; // 2MB file size limit
            if (file.size > maxSizeInBytes) {
                alert('File size exceeds the 2MB limit. Please select a smaller file.');
                return;
            }
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const parsedData = JSON.parse(event.target.result);
                    if (Array.isArray(parsedData.products) && parsedData.products.length > 0) {
                        setSelectedFile(parsedData);
                    } else {
                        alert("Invalid JSON format: 'products' array missing or empty.");
                    }
                } catch (error) {
                    alert('Invalid JSON file');
                }
            };
            reader.readAsText(file);
        }
    };

    const handleUploadProducts = async () => {
        if (!selectedFile) {
            alert('Please select a JSON file first');
            return;
        }
        const confirmed = confirm('Are you sure you want to upload the products?');
        if (!confirmed) return;

        setUploading(true);
        try {
            const response = await fetch(`/api/v1/vendor/products/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(selectedFile),
            });

            const result = await response.json();
            if (response.ok) {
                alert('Products uploaded successfully');
                setUploadResult(result);
            } else {
                alert(`Failed to upload products: ${result.error}`);
            }
        } catch (error) {
            alert('Error uploading products');
        } finally {
            setUploading(false);
        }
    };

    // Pagination logic for the upload result
    const paginatedResults = (items) => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return items.slice(startIndex, startIndex + itemsPerPage);
    };

    // Handle file download
    const handleDownloadReport = () => {
        const reportData = JSON.stringify(uploadResult, null, 2);
        const blob = new Blob([reportData], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'upload_report.json';
        link.click();
    };

    const breadCrumbLinks = [
        { text: 'Home', url: `/vendor/${vendorId}/dashboard` },
        { text: 'Catalogue', url: `/vendor/${vendorId}/products` },
        { text: 'Upload Products' },
    ];
    return (
        <>
            <Breadcrumbs breadCrumbLinks={breadCrumbLinks} />
            <div className="min-h-screen bg-gray-100 py-10">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Upload Products</h1>

                    {/* File Upload Section */}
                    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Product JSON File</h2>
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
                        />
                        <button
                            onClick={handleUploadProducts}
                            disabled={uploading}
                            className={`mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {uploading ? 'Uploading...' : 'Upload Products'}
                        </button>
                    </div>

                    {/* Upload Result */}
                    {uploadResult && (
                        <div className="bg-white shadow-md rounded-lg p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload Summary</h2>
                            <p className="text-gray-600 mb-2">
                                <strong>Total Products:</strong> {selectedFile?.products?.length || 0}
                            </p>
                            <p className="text-gray-600 mb-2">
                                <strong>Successfully Uploaded:</strong> {uploadResult.addedCount || 0}
                            </p>
                            <p className="text-gray-600 mb-2">
                                <strong>Invalid Products:</strong> {uploadResult.invalidProducts ? uploadResult.invalidProducts.length : 0}
                            </p>

                            {/* Invalid Products Section */}
                            {uploadResult.invalidProducts && (
                                <div className="mt-4">
                                    <h3 className="text-lg font-semibold text-red-600">Invalid Products:</h3>
                                    {paginatedResults(uploadResult.invalidProducts).map((error, index) => (
                                        <div key={index} className="bg-red-50 border border-red-400 text-red-600 p-3 rounded-lg mt-2">
                                            <p><strong>SKU:</strong> {error.product}</p>
                                            <p><strong>Errors:</strong> {error.errors.join(', ')}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Pagination Controls */}
                            <div className="pagination-controls flex justify-between items-center mt-4">
                                {currentPage > 1 && (
                                    <button
                                        onClick={() => setCurrentPage(currentPage - 1)}
                                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                                    >
                                        Previous
                                    </button>
                                )}
                                {uploadResult.invalidProducts && uploadResult.invalidProducts.length > currentPage * itemsPerPage && (
                                    <button
                                        onClick={() => setCurrentPage(currentPage + 1)}
                                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                                    >
                                        Next
                                    </button>
                                )}
                            </div>

                            {/* Download Report */}
                            <button
                                onClick={handleDownloadReport}
                                className="bg-green-500 text-white mt-6 px-6 py-2 rounded-lg hover:bg-green-600"
                            >
                                Download Report
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
