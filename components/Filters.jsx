import { useState } from 'react';

export default function Filters({
  brands,
  selectedBrands,
  handleBrandCheckboxChange,
  brandSearchTerm,
  setBrandSearchTerm,
}) {
  const [isBrandsCollapsed, setIsBrandsCollapsed] = useState(false);
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(false);

  return (
    <div className="mb-6 md:mb-0">
      {/* Collapsible Filters Section */}
      <div className="border rounded-lg shadow-sm bg-white mb-4">
        <div
          className="flex items-center justify-between px-4 py-2 cursor-pointer bg-gray-100 border-b"
          onClick={() => setIsFiltersCollapsed(!isFiltersCollapsed)}
        >
          <h2 className="text-xl font-semibold">Filter By</h2>
          <svg
            className={`w-5 h-5 transform transition-transform duration-200 ${
              isFiltersCollapsed ? '-rotate-90' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {!isFiltersCollapsed && (
          <div>
            {/* Collapsible Brands Section */}
            <div className="border-t">
              <div
                className="flex items-center justify-between px-4 py-2 cursor-pointer bg-gray-50 border-b"
                onClick={() => setIsBrandsCollapsed(!isBrandsCollapsed)}
              >
                <span className="font-medium text-gray-700">Brands</span>
                <svg
                  className={`w-5 h-5 transform transition-transform duration-200 ${
                    isBrandsCollapsed ? '-rotate-90' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {!isBrandsCollapsed && (
                <div className="px-4 py-2">
                  {/* Brand Search Box */}
                  <div className="mb-4">
                    <input
                      type="text"
                      value={brandSearchTerm}
                      onChange={(e) => setBrandSearchTerm(e.target.value)}
                      placeholder="Search brands..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  {/* Brands List */}
                  <div className="max-h-64 overflow-y-auto">
                    {brands.length === 0 ? (
                      <p className="text-gray-500">No brands found.</p>
                    ) : (
                      brands.map((brand) => (
                        <label key={brand} className="flex items-center py-2 border-b last:border-none">
                          <input
                            type="checkbox"
                            checked={selectedBrands.includes(brand)}
                            onChange={() => handleBrandCheckboxChange(brand)}
                            className="mr-2 form-checkbox text-blue-600"
                          />
                          <span className="text-gray-700">{brand}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
