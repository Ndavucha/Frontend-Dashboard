// src/pages/FarmMall.jsx
import { useEffect } from 'react';

export default function FarmMall() {
  useEffect(() => {
    // Redirect to the external link when component mounts
    window.location.href = 'https://findfarmers.onrender.com';
  }, []);

  // Optional: Show a loading message while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Redirecting to FarmMall...</h2>
        <p className="text-gray-600">Please wait while we take you to the marketplace.</p>
      </div>
    </div>
  );
}
