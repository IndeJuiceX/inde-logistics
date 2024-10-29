import { useState } from 'react';

export default function FilterLog({ onFilterChange }) {
  const [filterType, setFilterType] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  // Add more state variables for other filters like 'status' and 'endpoint' if needed

  const handleFilterTypeChange = (e) => {
    const value = e.target.value;
    setFilterType(value);

    // Reset filter inputs when filter type changes
    setStartTime('');
    setEndTime('');
    // Reset other filters as needed

    // Show the Search button when a filter type is selected
    // This state is controlled by the filterType being non-empty
  };

  const handleStartTimeChange = (e) => {
    setStartTime(e.target.value);
  };

  const handleEndTimeChange = (e) => {
    setEndTime(e.target.value);
  };

  // Handler for the 'Search' button click
  const handleSearchClick = () => {
    // Pass the current filter values to the parent component
    console.log('Filter Type:', filterType);
    console.log('Start Time:', startTime);
    console.log('End Time:', endTime);
    const params ={
      start_time: startTime,
      end_time: endTime,
    }
    onFilterChange(params);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
        <div className="relative w-full md:w-1/3">
          <label className="block text-gray-700 mb-2">Filter By</label>
          <select
            value={filterType}
            onChange={handleFilterTypeChange}
            className="block w-full border border-gray-300 rounded px-4 py-2 bg-white focus:outline-none focus:ring focus:border-blue-300"
          >
            <option value="">Select Filter</option>
            <option value="time">Time</option>
            <option value="status">Status</option>
            <option value="endpoint">Endpoint</option>
            {/* Add other filter options as needed */}
          </select>
        </div>

        {filterType === 'time' && (
          <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0 w-full">
            <div className="w-full md:w-1/2">
              <label className="block text-gray-700 mb-2">Start Date and Time</label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={handleStartTimeChange}
                className="block w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring focus:border-blue-300"
              />
            </div>
            <div className="w-full md:w-1/2">
              <label className="block text-gray-700 mb-2">End Date and Time</label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={handleEndTimeChange}
                className="block w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring focus:border-blue-300"
              />
            </div>
          </div>
        )}

        {/* Include similar conditional rendering for 'status' and 'endpoint' filters if needed */}
      </div>

      {/* Display the Search button if a filter type is selected */}
      {filterType && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSearchClick}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline"
          >
            Search
          </button>
        </div>
      )}
    </div>
  );
};

