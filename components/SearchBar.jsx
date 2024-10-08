export default function SearchBar({ searchTerm, setSearchTerm, onSearch, onClear }) {
    return (
      <div className="flex mt-4 md:mt-0 space-x-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search products..."
          className="px-4 py-2 border border-gray-300 rounded-md"
        />
        <button
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
          onClick={() => onSearch()}
        >
          Search
        </button>
        {searchTerm && (
          <button
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-md"
            onClick={() => onClear()}
          >
            Clear
          </button>
        )}
      </div>
    );
  }