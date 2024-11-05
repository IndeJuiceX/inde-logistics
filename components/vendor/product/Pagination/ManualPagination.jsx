'use client';

import { useEffect, useState } from 'react';


export default function ManualPagination({ pageSize, totalProducts, setPage, page, totalProductsData, searchTerm, setProducts, setLoading, setTotalProducts, handlePageClick }) {
    // Constants for pagination
    const [maxPageButtons] = useState(5);

    // Update products when page changes or search term changes
    useEffect(() => {
        const fetchProductsForPage = () => {
            setLoading(true);

            // Filter products based on the search term if any
            let filteredProducts = totalProductsData;
            if (searchTerm.trim() !== '') {
                filteredProducts = totalProductsData.filter((product) =>
                    product.name.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }

            // Update total products count after filtering
            setTotalProducts(filteredProducts.length);

            // Calculate the products to display on the current page
            const startIndex = (page - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            const productsForPage = filteredProducts.slice(startIndex, endIndex);

            setProducts(productsForPage);
            setLoading(false);
        };

        fetchProductsForPage();
    }, [page, totalProductsData, searchTerm]);

    // Calculate total pages
    const totalPages = Math.ceil(totalProducts / pageSize);

    // Calculate the range of page numbers to display
    const getPageNumbers = () => {
        const pageNumbers = [];

        // Always show the first page
        pageNumbers.push(1);

        const leftSide = Math.max(page - Math.floor(maxPageButtons / 2), 2);
        const rightSide = Math.min(page + Math.floor(maxPageButtons / 2), totalPages - 1);

        if (leftSide > 2) {
            // Add ellipsis if there are pages hidden on the left side
            pageNumbers.push('...');
        }

        // Add the page numbers in the middle
        for (let i = leftSide; i <= rightSide; i++) {
            pageNumbers.push(i);
        }

        if (rightSide < totalPages - 1) {
            // Add ellipsis if there are pages hidden on the right side
            pageNumbers.push('...');
        }

        // Always show the last page
        if (totalPages > 1) {
            pageNumbers.push(totalPages);
        }

        return pageNumbers;
    };

    return (
        <div className="flex justify-center items-center mt-8">
            {/* Previous Page Button */}
            <button
                onClick={() => setPage((prevPage) => Math.max(prevPage - 1, 1))}
                disabled={page === 1}
                className={`px-4 py-2 mr-2 rounded-md ${page === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
            >
                Previous
            </button>

            {/* Page Number Buttons */}
            {getPageNumbers().map((pageNum, index) => (
                <button
                    key={index}
                    onClick={() => {
                        if (pageNum !== '...') handlePageClick(pageNum);
                    }}
                    disabled={pageNum === '...'}
                    className={`px-4 py-2 mx-1 rounded-md ${page === pageNum
                        ? 'bg-blue-700 text-white'
                        : pageNum === '...'
                            ? 'bg-transparent cursor-default'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    {pageNum}
                </button>
            ))}

            {/* Next Page Button */}
            <button
                onClick={() => setPage((prevPage) => Math.min(prevPage + 1, totalPages))}
                disabled={page === totalPages}
                className={`px-4 py-2 ml-2 rounded-md ${page === totalPages
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
            >
                Next
            </button>
        </div>
    )
}