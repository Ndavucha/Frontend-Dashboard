import React from 'react';

// Import your logo from assets
import logoImage from '@/assets/logo.png';

const Logo = ({ 
  size = "default", 
  showText = true, 
  variant = "default", 
  className = "" 
}) => {
  const sizes = {
    small: { 
      img: "h-6 w-auto", 
      text: "text-sm",
      container: "gap-2"
    },
    default: { 
      img: "h-8 w-auto", 
      text: "text-lg",
      container: "gap-3"
    },
    large: { 
      img: "h-10 w-auto", 
      text: "text-xl",
      container: "gap-4"
    },
    xl: { 
      img: "h-12 w-auto", 
      text: "text-2xl",
      container: "gap-4"
    }
  };

  const variants = {
    default: {
      textColor: "text-brand-green",
      subTextColor: "text-brand-brown"
    },
    light: {
      textColor: "text-white",
      subTextColor: "text-gray-200"
    },
    dark: {
      textColor: "text-gray-900",
      subTextColor: "text-gray-600"
    }
  };

  const currentSize = sizes[size] || sizes.default;
  const currentVariant = variants[variant] || variants.default;

  return (
    <div className={`flex items-center ${currentSize.container} ${className}`}>
      {/* Your logo image */}
      <img 
        src={logoImage} 
        alt="Supply Chain Logo" 
        className={`${currentSize.img} object-contain`}
        onError={(e) => {
          // Fallback if image fails to load
          e.target.onerror = null;
          e.target.style.display = 'none';
          e.target.parentElement.innerHTML = `
            <div class="${currentSize.img.replace('w-auto', 'w-8')} rounded-lg bg-brand-green flex items-center justify-center">
              <span class="font-bold text-white">SC</span>
            </div>
          `;
        }}
      />
      
      {/* Optional text */}
      {showText && (
        <div className="flex flex-col">
          <span className={`${currentSize.text} font-bold ${currentVariant.textColor}`}>
            SupplyChain
          </span>
          <span className={`text-xs font-medium ${currentVariant.subTextColor}`}>
            Harvest Solutions
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;

// Icon-only version
export const IconLogo = ({ size = "default", className = "" }) => {
  const sizes = {
    small: "h-6",
    default: "h-8",
    large: "h-10",
    xl: "h-12"
  };

  return (
    <img 
      src={logoImage} 
      alt="Supply Chain Logo" 
      className={`${sizes[size] || sizes.default} w-auto object-contain ${className}`}
    />
  );
};

// Logo with custom text
export const LogoWithCustomText = ({ 
  mainText = "SupplyChain",
  subText = "Harvest Solutions",
  ...props 
}) => {
  return (
    <div className="flex items-center gap-3">
      <IconLogo {...props} />
      <div className="flex flex-col">
        <span className="text-lg font-bold text-brand-green">{mainText}</span>
        <span className="text-xs font-medium text-brand-brown">{subText}</span>
      </div>
    </div>
  );
};