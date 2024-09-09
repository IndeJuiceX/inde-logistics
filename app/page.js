'use client';

import { useEffect, useState } from 'react';
import './landing-page.css'; // Import the new CSS file
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();  // Use Next.js router

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState({}); // Track upload state for each vendor
  const [vendorProductsExist, setVendorProductsExist] = useState({}); // Track product existence for each vendor

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await fetch('/api/v1/internal/vendors');
        const data = await response.json();

        // Check if products exist for each vendor
        const productExistence = {};
        for (const vendor of data) {
          const res = await fetch(`/api/v1/internal/vendor/products?vendorId=${vendor.PK.split('VENDOR#')[1]}`);
          const productData = await res.json();
          productExistence[vendor.PK] = productData.length > 0;
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

  const handleUploadProducts = async (vendorId) => {
    setUploading((prev) => ({ ...prev, [vendorId]: true }));
    try {
      const response = await fetch('/api/v1/vendor/upload-products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vendorId }),
      });

      if (response.ok) {
        alert(`Products uploaded successfully for vendor ${vendorId}`);
        setVendorProductsExist((prev) => ({ ...prev, [vendorId]: true })); // Update the existence check
      } else {
        alert(`Failed to upload products for vendor ${vendorId}`);
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
      const response = await fetch(`/api/v1/internal/vendor/delete-products?vendorId=${extractedId}`, {
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

  return (
    <div className="landing-container">
      <h1 className="landing-title">Vendors List</h1>
      {loading ? (
        <p className="loading-text">Loading vendors...</p>
      ) : (
        <div className="vendor-list">
          {vendors.length > 0 ? (
            vendors.map((vendor) => (
              <div key={vendor.PK} className="vendor-card">
                <h2 className="vendor-name">{vendor.VendorDetails.CompanyName}</h2>
                <p className="vendor-info"><strong>Company Number:</strong> {vendor.VendorDetails.CompanyNumber}</p>
                <p className="vendor-info"><strong>Phone:</strong> {vendor.VendorDetails.Phone}</p>
                <p className="vendor-info"><strong>Email:</strong> {vendor.VendorDetails.Email}</p>
                <p className="vendor-info"><strong>Shipping Code:</strong> {vendor.VendorDetails.ShippingCode}</p>
                <p className={`vendor-status ${vendor.Status === 'Active' ? 'status-active' : 'status-inactive'}`}>
                  Status: {vendor.Status}
                </p>

                <div className="button-container">
                  {/* Conditional rendering for Upload, View, and Delete buttons */}
                  {!vendorProductsExist[vendor.PK] ? (
                    <button
                      className="upload-button"
                      onClick={() => handleUploadProducts(vendor.PK)}
                      disabled={uploading[vendor.PK]}
                    >
                      {uploading[vendor.PK] ? 'Uploading...' : 'Upload Products'}
                    </button>
                  ) : (
                    <>
                      <button
                        className="view-button"
                        onClick={() => handleViewProducts(vendor.PK)}
                      >
                        View Products
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => handleDeleteProducts(vendor.PK)}
                      >
                        Delete Products
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="no-vendors">No vendors found.</p>
          )}
        </div>
      )}
    </div>
  );
}
