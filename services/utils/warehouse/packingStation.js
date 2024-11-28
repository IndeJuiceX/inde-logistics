'use client';
// utils/station.js

// Function to get station ID from local storage
export const getStationId = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('station-id');
    }
    return null;
};

// Function to set station ID in local storage
export const setStationId = (stationId) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('station-id', stationId);
    }
};

  