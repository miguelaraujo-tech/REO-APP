type LogoProps = {
  className?: string;
};

const Logo = ({ className }: LogoProps) => {
  return (
    <img
      src="/logo.png"
      alt="REO – Rádio Escolar Online"
      className={className}
      draggable={false}
    />
  );
};

export default Logo;
