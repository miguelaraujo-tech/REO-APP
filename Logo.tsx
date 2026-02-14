type LogoProps = {
  className?: string;
};

const Logo = ({ className = "" }: LogoProps) => {
  return (
    <img
      src="/REO_logo_round_512x512.png"
      alt="REO – Rádio Escolar Online"
      draggable={false}
      className={`
        object-contain
        rounded-full
        select-none
        ${className}
      `}
    />
  );
};

export default Logo;
