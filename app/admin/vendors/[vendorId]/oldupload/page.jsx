'use client';

import { useEffect, useState } from 'react';
import './landing-page.css'; // Import the new CSS file
import { useRouter } from 'next/navigation';

export default function Vendors() {
  const router = useRouter();  // Use Next.js router

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState({}); // Track upload state for each vendor
  const [vendorProductsExist, setVendorProductsExist] = useState({}); // Track product existence for each vendor
  const [selectedFile, setSelectedFile] = useState({});
  const [uploadResult, setUploadResult] = useState(null); // Store the upload result
  const [currentPage, setCurrentPage] = useState(1); // Track the current page
  const itemsPerPage = 20; // Number of results per page

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await fetch('/api/v1/admin/vendors');
        const data = await response.json();

        const productExistence = {};
        for (const vendor of data) {
          const res = await fetch(`/api/v1/admin/vendor/products?vendorId=${vendor.pk.split('VENDOR#')[1]}`);
          const productData = await res.json();
          productExistence[vendor.pk] = productData.length > 0;
        }

        setVendors(data);
        setVendorProductsExist(productExistence);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching vendors:', error);
        setLoading(false);
      }
    };

    fetchVendors();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      const maxSizeInBytes = 2 * 1024 * 1024; // 2MB

      if (file.size > maxSizeInBytes) {
        alert("File size exceeds the 2MB limit. Please select a smaller file.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsedData = JSON.parse(event.target.result);
          if (Array.isArray(parsedData.products) && parsedData.products.length > 0) {
            setSelectedFile(parsedData);
          } else {
            alert("Invalid JSON file format: 'products' array missing or empty.");
          }
        } catch (error) {
          alert("Invalid JSON file");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleUploadProducts = async (vendorId, apiKey) => {
    if (!selectedFile) {
      alert("Please select a JSON file first");
      return;
    }

    const confirmed = confirm(`Are you sure you want to upload products for vendor ${vendorId}?`);
    if (!confirmed) return;

    setUploading((prev) => ({ ...prev, [vendorId]: true }));

    try {
      const response = await fetch('/api/v1/vendor/upload-products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(selectedFile),
      });

      const result = await response.json();
      if (response.ok) {
        alert(`Products uploaded successfully for vendor ${vendorId}`);
        setVendorProductsExist((prev) => ({ ...prev, [vendorId]: true }));
        setUploadResult(result); // Store the result for display
      } else if (response.status === 400 && result.invalidProducts) {
        // Handle the case where all products are invalid
        setUploadResult({
          addedCount: 0,
          invalidProducts: result.invalidProducts,
          message: result.error
        });
      } else {
        alert(`Failed to upload products for vendor ${vendorId} ${result.error}`);
      }
    } catch (error) {
      alert(`Error uploading products for vendor ${vendorId}`);
    } finally {
      setUploading((prev) => ({ ...prev, [vendorId]: false }));
    }
  };

  const handleViewProducts = (vendorId) => {
    const extractedId = vendorId.split('VENDOR#')[1];
    router.push(`/${extractedId}/products`);  // Navigate to the vendor-specific products page
  };

  const handleDeleteProducts = async (vendorId) => {
    const confirmed = confirm(`Are you sure you want to delete all products for vendor ${vendorId}?`);
    if (!confirmed) return;
    const extractedId = vendorId.split('VENDOR#')[1];
    try {
      const response = await fetch(`/api/v1/admin/vendor/delete-products?vendorId=${extractedId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert(`Products deleted successfully for vendor ${vendorId}`);
        setVendorProductsExist((prev) => ({ ...prev, [vendorId]: false })); // Update the existence check
      } else {
        alert(`Failed to delete products for vendor ${vendorId}`);
      }
    } catch (error) {
      alert(`Error deleting products for vendor ${vendorId}`);
    }
  };

  // Handle pagination
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
    <div className="landing-container">
      <h1 className="landing-title">Vendors List</h1>
      {loading ? (
        <p className="loading-text">Loading vendors...</p>
      ) : (
        <div className="vendor-list">
          {vendors.length > 0 ? (
            vendors.map((vendor) => (
              <div key={vendor.pk} className="vendor-card">
                <h2 className="vendor-name">{vendor.company_name}</h2>
                <p className="vendor-info"><strong>Company Number:</strong> {vendor.company_number}</p>
                <p className="vendor-info"><strong>Phone:</strong> {vendor.phone}</p>
                <p className="vendor-info"><strong>Email:</strong> {vendor.email}</p>
                <p className="vendor-info"><strong>Shipping Code:</strong> {vendor.shipping_code}</p>
                <p className={`vendor-status ${vendor.status === 'Active' ? 'status-active' : 'status-inactive'}`}>
                  Status: {vendor.status}
                </p>

                <div className="button-container flex flex-wrap items-center mt-4 space-x-2">

                  <div className="flex items-center space-x-2 ">
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileChange}
                      className="file-input"
                      style={{
                        display: 'inline-block',
                        marginRight: '10px',
                        padding: '10px',
                        borderRadius: '5px',
                        backgroundColor: '#f0f0f0',
                        cursor: 'pointer',
                      }}
                    />

                    <button
                      className="upload-button"
                      onClick={() => handleUploadProducts(vendor.pk, vendor.api_key)}
                      disabled={uploading[vendor.pk]}
                    >
                      {uploading[vendor.pk] ? 'Uploading...' : 'Upload Products'}
                    </button>
                  </div>
                  {vendorProductsExist[vendor.pk] && (
                    <div className="flex space-x-2 mt-2 md:mt-0">
                      <button
                        className="view-button"
                        onClick={() => handleViewProducts(vendor.pk)}
                      >
                        View Products
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => handleDeleteProducts(vendor.pk)}
                      >
                        Delete Products
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="no-vendors">No vendors found.</p>
          )}
        </div>
      )}

      {/* Display Upload Result */}
      {/* Display Upload Result */}
      {uploadResult && (
        <div className="upload-result bg-white shadow-md rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload Summary</h2>
          {/* Display the response message if it exists */}
          {uploadResult.message && (
            <p className="upload-message">{uploadResult.message}</p>
          )}
          <p className="text-gray-600">
            <strong>Total Products:</strong> {selectedFile?.products?.length || 0}
          </p>
          <p className="text-gray-600">
            <strong>Successfully Uploaded:</strong> {uploadResult.addedCount || 0}
          </p>
          <p className="text-gray-600">
            <strong>Failed Products:</strong>
            {uploadResult.failedProducts ? uploadResult.failedProducts.length : 0}
          </p>
          <p className="text-gray-600">
            <strong>Invalid Products:</strong>
            {uploadResult.invalidProducts ? uploadResult.invalidProducts.length : 0}
          </p>

          {/* Invalid Products Section */}
          {uploadResult.invalidProducts && (
            <>
              <h3 className="text-lg font-semibold text-red-600 mt-4">Invalid Products:</h3>
              {paginatedResults(uploadResult.invalidProducts).map((error, index) => (
                <div key={index} className="bg-red-50 border border-red-400 text-red-600 p-3 rounded-lg mt-2">
                  <p><strong>SKU:</strong> {error.product}</p>
                  <p><strong>Errors:</strong> {error.errors.join(', ')}</p>
                </div>
              ))}
            </>
          )}

          {/* Failed Products Section */}
          {uploadResult.failedProducts && (
            <>
              <h3 className="text-lg font-semibold text-yellow-600 mt-4">Failed Products:</h3>
              {paginatedResults(uploadResult.failedProducts).map((failed, index) => (
                <div key={index} className="bg-yellow-50 border border-yellow-400 text-yellow-600 p-3 rounded-lg mt-2">
                  <p><strong>SKU:</strong> {failed.product}</p>
                  <p><strong>Details:</strong> {failed.errors.join(', ')}</p>
                </div>
              ))}
            </>
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
  );
}
