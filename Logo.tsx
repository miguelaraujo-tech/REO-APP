type LogoProps = {
  className?: string;
};

const Logo = ({ className }: LogoProps) => {
  return (
    <img
      src="/REO_logo_round_512x512.png"
      alt="REO – Rádio Escolar Online"
      className={className}
      draggable={false}
    />
  );
};

export default Logo;
