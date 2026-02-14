type LogoProps = {
  className?: string;
};

const Logo = ({ className = "" }: LogoProps) => {
  return (
    <div className="relative rounded-full overflow-hidden">
      <img
        src="/REO_logo_round_512x512.png"
        alt="REO – Rádio Escolar Online"
        draggable={false}
        className={`
          object-cover
          rounded-full
          select-none
          scale-[1.07]
          ${className}
        `}
        style={{
          maskImage: "radial-gradient(circle at center, black 84%, transparent 85%)",
          WebkitMaskImage:
            "radial-gradient(circle at center, black 84%, transparent 85%)",
        }}
      />
    </div>
  );
};

export default Logo;
