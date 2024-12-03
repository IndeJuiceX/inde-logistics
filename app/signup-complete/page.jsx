// app/vendor-onboarding/page.js
'use client';

import { useState } from 'react';
import './onboarding.css'; // Import the custom Tailwind CSS file

export default function VendorOnboarding() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="form-title text-2xl font-bold text-center mb-4">Thank You</h1>
        <p className="form-subtitle text-center text-gray-600">Our team will contact you shortly.</p>
      </div>
    </div>
  );
}
