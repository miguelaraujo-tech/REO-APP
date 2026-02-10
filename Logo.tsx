type LogoVariant = "header" | "hero";

type LogoProps = {
  variant?: LogoVariant;
  className?: string;
};

const Logo = ({ variant = "header", className = "" }: LogoProps) => {
  const isHero = variant === "hero";

  return (
    <img
      src="/REO_logo_round_512x512.png"
      alt="REO – Rádio Escolar Online"
      draggable={false}
      className={`
        object-contain
        rounded-full
        bg-black/40
        ring-1 ring-white/10

        transition
        duration-300
        ease-out

        motion-safe:hover:scale-105
        motion-safe:hover:rotate-[1.5deg]
        motion-safe:active:scale-100

        ${isHero ? "p-3" : "p-1"}
        ${isHero ? "w-64 h-64" : "w-10 h-10 md:w-12 md:h-12"}

        ${className}
      `}
    />
  );
};

export default Logo;
