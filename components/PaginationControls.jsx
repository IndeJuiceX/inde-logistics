import React from 'react';

export default function PaginationControls({ page, totalPages, setPage, totalResults }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-between items-center mt-6">
      <div>
        <p className="text-sm text-gray-700">
          Showing page {page} of {totalPages}, total results: {totalResults}
        </p>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => setPage((prevPage) => Math.max(prevPage - 1, 1))}
          disabled={page === 1}
          className={`px-4 py-2 bg-gray-300 text-gray-700 rounded-md ${
            page === 1 ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-400'
          }`}
        >
          Previous
        </button>
        <button
          onClick={() => setPage((prevPage) => Math.min(prevPage + 1, totalPages))}
          disabled={page === totalPages}
          className={`px-4 py-2 bg-gray-300 text-gray-700 rounded-md ${
            page === totalPages
              ? 'cursor-not-allowed opacity-50'
              : 'hover:bg-gray-400'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}