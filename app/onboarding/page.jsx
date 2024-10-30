// app/vendor-onboarding/page.js
'use client';

import { useState } from 'react';
import './onboarding.css'; // Import the custom Tailwind CSS file

export default function VendorOnboarding() {
  const [formData, setFormData] = useState({
    companyName: '',
    companyNumber: '',
    phone: '',
    email: '',
    //shippingCode: '',
  });

  const [submissionResult, setSubmissionResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Send form data to the backend API route to process
    const res = await fetch('/api/v1/admin/vendor/onboard', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      const data = await res.json();
      setSubmissionResult(`Vendor Onboarded. Vendor ID: ${data.vendorId}, API Key: ${data.apiKey}`);
    } else {
      setSubmissionResult('Error during vendor onboarding');
    }
  };

  return (
    <div className="form-container">
      <h1 className="form-title">Vendor Onboarding</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Company Name:</label>
          <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} className="form-input" required />
        </div>
        <div className="form-group">
          <label className="form-label">Company Number:</label>
          <input type="text" name="companyNumber" value={formData.companyNumber} onChange={handleChange} className="form-input" required />
        </div>
        <div className="form-group">
          <label className="form-label">Phone:</label>
          <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="form-input" required />
        </div>
        <div className="form-group">
          <label className="form-label">Email:</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-input" required />
        </div>
       
        <button type="submit" className="submit-button">Submit</button>
      </form>
      {submissionResult && <p className="result-message">{submissionResult}</p>}
    </div>
  );
}
