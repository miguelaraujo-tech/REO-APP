import React from 'react';
import ReoLogo from './ReoLogo';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "" }) => {
  return (
    <div className={`flex items-center justify-center overflow-hidden rounded-full ${className}`}>
      <ReoLogo className="w-full h-full" />
    </div>
  );
};

export default Logo;