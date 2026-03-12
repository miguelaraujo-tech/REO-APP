import React from 'react';

type LogoProps = {
  className?: string;
};

const Logo = React.memo(({ className = '' }: LogoProps) => {
  return (
    <img
      src="/REO_logo_round_512x512.png"
      alt="REO – Rádio Escolar Online"
      draggable={false}
      loading="eager"
      fetchPriority="high"
      decoding="async"
      className={`object-contain rounded-full select-none ${className}`}
    />
  );
});

Logo.displayName = 'Logo';

export default Logo;
