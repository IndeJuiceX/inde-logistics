'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import VendorMenu from '@/components/admin/VendorMenu'; // Adjust the import path as needed
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import OrderStatus from '@/components/vendor/Status';
import Status from '@/components/vendor/Status';

export default function AllOrders() {
  const { vendorId } = useParams();  // Get the vendorId from the route


  const [vendorName, setVendorName] = useState('Vendor'); // State for vendor name
  const [stockShipments, setStockShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);  // Current page
  const [searchTerm, setSearchTerm] = useState("");  // State for search term



  // Fetch total product count once when vendorId is available
  // useEffect(() => {
  //   if (vendorId) {
  //     const fetchTotalProducts = async () => {
  //       try {
  //         const response = await fetch(`/api/v1/admin/vendor/products/count?vendor_id=${vendorId}`);
  //         const data = await response.json();
  //         setTotalProducts(data.count); // Assuming your API returns { count: number }
  //         setLoadingCount(false);
  //       } catch (error) {
  //         console.error('Error fetching total products count:', error);
  //         setLoadingCount(false);
  //       }
  //     };
  //     fetchTotalProducts();
  //   }
  // }, [vendorId]);

  // Fetch paginated products when page or vendorId changes
  useEffect(() => {
    if (vendorId) {
      const fetchOrders = async () => {
        try {
          const response = await fetch(`/api/v1/vendor/stock-shipments?vendor_id=${vendorId}`);
          const data = await response.json();
          console.log(data);
          if (data.success) {
            setStockShipments(data.data);
          }
          if (data.error) {
            alert(data.error);
          }

          setLoading(false);
        } catch (error) {
          console.error('Error fetching products:', error);
          setLoading(false);
        }
      };
      fetchOrders();
    }
  }, [vendorId, page]);


  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/admin/vendor/products/search?vendorId=${vendorId}&q=${searchTerm}`);
      const data = await response.json();

      setLoading(false);
      setPage(1); // Reset to first page on search
    } catch (error) {
      console.error('Error searching products:', error);
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="container mx-auto">
        {/* Vendor Menu */}
        <VendorMenu vendorId={vendorId} />

        {/* Main Content */}
        <div className="bg-white shadow-md rounded-lg p-8 mt-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 md:mb-0">Stock Shipments</h2>

            {/* <div className="flex space-x-4">
              <button
                onClick={() => router.push(`/admin/vendors/${vendorId}/products/upload`)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
              >
                Add New Product
              </button>
              <button
                onClick={handleDeleteCatalogue}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
              >
                Delete Catalogue
              </button>
            </div> */}
          </div>

          {/* Search Bar */}
          <div className="flex items-center mb-6">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md mr-4"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
            >
              Search
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shipment ID</th>
                  <th className="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</th>
                  <th className="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  {/* <th className="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th> */}
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan="5" className="text-center py-4">Loading.....</td>
                  </tr>
                )}
                {stockShipments.length === 0 && !loading && (
                  <tr>
                    <td colSpan="5" className="text-center py-4">No orders found.</td>
                  </tr>
                )}
                {/* Loop through products */}

                {stockShipments.map((shipment) => (
                  <tr key={shipment.shipment_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{shipment.shipment_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(shipment.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Status status={shipment.status} />
                    </td>
                    {/*<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                       <div className="flex space-x-2">
                        <a className="text-blue-600 hover:text-blue-900" href={`/vendor/${vendorId}/orders/${shipment.shipment_id}`}>View</a>
                        <button className="text-red-600 hover:text-red-900">Cancel</button>
                      </div> 
                    </td>*/}
                  </tr>
                ))}

              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}