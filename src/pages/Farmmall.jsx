// src/pages/FarmMall.jsx
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

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
        <p className="text-gray-600 mb-4">Please wait while we take you to the marketplace.</p>
        <Button 
          variant="outline" 
          onClick={() => window.location.href = '/overview'}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
}
