import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { NAV_LINKS } from '../constants';
import Logo from '../Logo';

const Home: React.FC = () => {
  const [rotation, setRotation] = useState(0);
  const [transitionOn, setTransitionOn] = useState(true);
  const [isFastSpinning, setIsFastSpinning] = useState(false);
  const [glow, setGlow] = useState(false);

  const touchStartY = useRef<number | null>(null);
  const touchStartTime = useRef<number | null>(null);
  const didSwipe = useRef(false);

  const TAP_STEP = 30;
  const SWIPE_THRESHOLD = 50;
  const MAX_SPINS = 7;
  const MIN_SPINS = 3;

  const handleTap = () => {
    if (didSwipe.current) {
      didSwipe.current = false;
      return;
    }
    if (isFastSpinning) return;

    setRotation((prev) => prev + TAP_STEP);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
    didSwipe.current = false;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null || touchStartTime.current === null) return;

    const endY = e.changedTouches[0].clientY;
    const diff = endY - touchStartY.current;
    const duration = Date.now() - touchStartTime.current;

    touchStartY.current = null;
    touchStartTime.current = null;

    if (diff > SWIPE_THRESHOLD && !isFastSpinning) {
      didSwipe.current = true;
      setIsFastSpinning(true);

      const velocity = diff / Math.max(duration, 1);
      const spins = Math.min(
        MAX_SPINS,
        Math.max(MIN_SPINS, Math.round(velocity * 12))
      );

      const totalDegrees = 360 * spins;

      if ('vibrate' in navigator) navigator.vibrate(15);

      setGlow(true);
      document.body.style.overflow = 'hidden';

      setRotation((prev) => prev + totalDegrees);

      window.setTimeout(() => {
        setTransitionOn(false);
        setRotation(0);

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setTransitionOn(true);
            setIsFastSpinning(false);
            setGlow(false);
            document.body.style.overflow = '';
          });
        });
      }, 420);
    }
  };

  return (
    <div className="flex flex-col items-center animate-in fade-in duration-700 max-w-full overflow-hidden">
      <div className="mb-10 sm:mb-20 text-center relative w-full flex flex-col items-center">
        <div className="absolute inset-0 bg-blue-600/10 blur-[120px] rounded-full -z-10 mx-auto w-3/4 h-full opacity-40" />

        <div className="relative animate-float">
          <div
            onClick={handleTap}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onContextMenu={(e) => e.preventDefault()}
            style={{ transform: `rotate(${rotation}deg)` }}
            className={[
              'w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 lg:w-[450px] lg:h-[450px]',
              'mx-auto cursor-pointer select-none touch-none',
              transitionOn
                ? 'transition-transform duration-[420ms] ease-[cubic-bezier(.2,1.6,.3,1)]'
                : '',
            ].join(' ')}
          >
            {/* OUTER RING WRAPPER */}
            <div
              className={`
                relative w-full h-full flex items-center justify-center
                rounded-full transition-all duration-300
                ${glow ? 'ring-[6px] ring-amber-400' : 'ring-[3px] ring-amber-500/80'}
              `}
            >
              {/* Radial amber aura */}
              <div
                className={`
                  absolute inset-0 rounded-full -z-10
                  ${glow
                    ? 'bg-[radial-gradient(circle,rgba(245,158,11,0.35)_0%,transparent_65%)]'
                    : 'bg-[radial-gradient(circle,rgba(245,158,11,0.15)_0%,transparent_65%)]'
                  }
                `}
              />

              <Logo className="w-[90%] h-[90%]" />
            </div>
          </div>
        </div>

        <div className="mt-8 sm:mt-12 space-y-2">
          <p className="text-[9px] sm:text-[11px] md:text-sm text-amber-500 font-black uppercase tracking-[0.3em] sm:tracking-[0.5em] px-4 opacity-80 text-center max-w-3xl">
            A RÁDIO ESCOLAR ONLINE DO AGRUPAMENTO DE ESCOLAS DE S. BENTO DE VIZELA
          </p>
        </div>
      </div>

      <div className="w-full max-w-2xl bg-[#12121c]/60 backdrop-blur-md p-4 sm:p-5 rounded-[2.5rem] shadow-2xl mb-12 sm:mb-20 border border-white/5">
        <div className="flex items-center gap-3 mb-4 px-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.6)]" />
          <h2 className="font-black text-slate-400 text-[10px] uppercase tracking-[0.4em]">
            Emissão Recente
          </h2>
        </div>

        <div className="rounded-3xl overflow-hidden bg-black/60 border border-white/5 shadow-inner">
          <iframe
            src="https://open.spotify.com/embed/show/3VjnTbbEDaFjd8fddfxWy6?utm_source=generator&theme=0"
            width="100%"
            height="152"
            frameBorder="0"
            allowFullScreen
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="opacity-95 grayscale-[0.3] transition-all duration-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full max-w-2xl px-2 pb-20">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className="group flex flex-col items-center p-6 sm:p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] shadow-xl hover:shadow-amber-500/20 hover:border-amber-500/40 hover:bg-white/[0.04] transition-all duration-500 active:scale-95"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#0b0b13] border border-white/5 text-slate-500 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-black transition-all duration-500 shadow-2xl mb-4 group-hover:scale-110 group-hover:rotate-2">
              {React.cloneElement(link.icon as React.ReactElement<any>, {
                className: 'w-7 h-7',
              })}
            </div>

            <span className="block font-black text-xs sm:text-lg text-white group-hover:text-amber-500 transition-colors tracking-tight uppercase italic text-center leading-tight">
              {link.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Home;

