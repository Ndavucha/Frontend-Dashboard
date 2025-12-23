import React from 'react';
import Logo, { IconLogo } from '@/components/Logo';

export const AppLogo = {
  // Full logo with text
  Full: ({ className = "", ...props }) => (
    <Logo 
      size="large" 
      showText={true} 
      className={className} 
      {...props} 
    />
  ),
  
  // Compact logo (icon + small text)
  Compact: ({ className = "", ...props }) => (
    <Logo 
      size="default" 
      showText={true} 
      className={className} 
      {...props} 
    />
  ),
  
  // Icon only
  Icon: ({ className = "", ...props }) => (
    <IconLogo 
      size="default" 
      className={className} 
      {...props} 
    />
  ),
  
  // For headers/navbars
  Navbar: ({ className = "", ...props }) => (
    <Logo 
      size="default" 
      showText={true} 
      className={className} 
      {...props} 
    />
  ),
  
  // For footers
  Footer: ({ className = "", ...props }) => (
    <Logo 
      size="small" 
      showText={true} 
      variant="light"
      className={className} 
      {...props} 
    />
  ),
  
  // For auth pages (login/register)
  Auth: ({ className = "", ...props }) => (
    <div className={`flex flex-col items-center ${className}`}>
      <IconLogo size="xl" className="mb-4" {...props} />
      <h1 className="text-3xl font-bold text-brand-green">SupplyChain</h1>
      <p className="text-brand-brown mt-2"> </p>
    </div>
  )
};