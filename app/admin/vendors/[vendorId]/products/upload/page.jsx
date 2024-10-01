'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import VendorMenu from '@/components/admin/VendorMenu'; // Adjust the import path accordingly

export default function VendorUploadPage() {
  const router = useRouter();
  const { vendorId } = useParams();

  const [vendorName, setVendorName] = useState('Vendor'); // State for vendor name
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch vendor name
  useEffect(() => {
    if (vendorId) {
      const fetchVendor = async () => {
        try {
          const response = await fetch(`/api/v1/admin/vendor/${vendorId}`);
          const data = await response.json();

          if (response.ok) {
            setVendorName(data.company_name || 'Vendor');
          } else {
            console.error('Failed to fetch vendor name');
          }
        } catch (err) {
          console.error('Error fetching vendor name:', err);
        }
      };
      fetchVendor();
    }
  }, [vendorId]);

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
      const response = await fetch(`/api/v1/admin/vendor/upload-products?vendorId=${vendorId}`, {
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

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="container mx-auto">
        {/* Vendor Menu */}
        <VendorMenu vendorId={vendorId} vendorName={vendorName} activePage="Products" />

        {/* Main Content */}
        <div className="bg-white shadow-md rounded-lg p-8 mt-4">
          <h1 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Upload Products</h1>

          {/* File Upload Section */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Product JSON File</h2>
            <input
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-white focus:outline-none"
            />
            <button
              onClick={handleUploadProducts}
              disabled={uploading}
              className={`mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ${
                uploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {uploading ? 'Uploading...' : 'Upload Products'}
            </button>
          </div>

          {/* Upload Result */}
          {uploadResult && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload Summary</h2>
              <p className="text-gray-600 mb-2">
                <strong>Total Products:</strong> {selectedFile?.products?.length || 0}
              </p>
              <p className="text-gray-600 mb-2">
                <strong>Successfully Uploaded:</strong> {uploadResult.addedCount || 0}
              </p>
              <p className="text-gray-600 mb-2">
                <strong>Invalid Products:</strong>{' '}
                {uploadResult.invalidProducts ? uploadResult.invalidProducts.length : 0}
              </p>

              {/* Invalid Products Section */}
              {uploadResult.invalidProducts && uploadResult.invalidProducts.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-red-600 mb-2">Invalid Products:</h3>
                  {paginatedResults(uploadResult.invalidProducts).map((error, index) => (
                    <div
                      key={index}
                      className="bg-red-50 border border-red-400 text-red-600 p-3 rounded-lg mt-2"
                    >
                      <p>
                        <strong>SKU:</strong> {error.product}
                      </p>
                      <p>
                        <strong>Errors:</strong> {error.errors.join(', ')}
                      </p>
                    </div>
                  ))}

                  {/* Pagination Controls */}
                  <div className="flex justify-between items-center mt-4">
                    {currentPage > 1 && (
                      <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-200"
                      >
                        Previous
                      </button>
                    )}
                    <span className="text-gray-600">
                      Page {currentPage} of{' '}
                      {Math.ceil(uploadResult.invalidProducts.length / itemsPerPage)}
                    </span>
                    {uploadResult.invalidProducts.length > currentPage * itemsPerPage && (
                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-200"
                      >
                        Next
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Download Report */}
              <button
                onClick={handleDownloadReport}
                className="bg-green-500 text-white mt-6 px-6 py-2 rounded-lg hover:bg-green-600 transition duration-200"
              >
                Download Report
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}