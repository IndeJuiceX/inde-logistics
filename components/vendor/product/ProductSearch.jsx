

export default function ProductSearch({ setSearchTerm, searchTerm, handleSearch, handleDeleteCatalogue }) {

    return (
        <div className="flex justify-between items-center mb-6">
            {/* Full-width Search Bar */}
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md mr-4"
            />
            {/* Search and Delete Buttons */}
            <div className="space-x-4">
                <button
                    onClick={handleSearch}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md">
                    Search
                </button>
                <button
                    onClick={handleDeleteCatalogue}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md">
                    Delete Catalogue
                </button>
            </div>
        </div>
    )
}