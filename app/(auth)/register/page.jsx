'use client'
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    userType: 'vendor',  // Default to vendor, you can modify as needed
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        alert('User registered successfully');
        router.push("/login");  // Redirect to login after successful registration
      } else {
        alert(data.error || 'Error registering user');
      }
    } catch (error) {
      console.error("Error registering user:", error);
      alert("Server error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 max-w-md w-full">
        <h2 className="text-2xl font-bold text-center mb-6">Register</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Form inputs for first name, last name, email, phone, and password */}
          <input name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name" required />
          <input name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name" required />
          <input name="email" value={formData.email} onChange={handleChange} type="email" placeholder="Email" required />
          <input name="phone" value={formData.phone} onChange={handleChange} type="tel" placeholder="Phone" required />
          <input name="password" value={formData.password} onChange={handleChange} type="password" placeholder="Password" required />

          <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Register
          </button>
        </form>
      </div>
    </div>
  );
}
