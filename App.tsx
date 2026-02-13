import React, { useEffect, useState } from 'react';
import Logo from './Logo';

const App: React.FC = () => {
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    setIsStandalone(standalone);

    const ua = navigator.userAgent;
    setIsIOS(/iPhone|iPad|iPod/i.test(ua));

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const installAndroid = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  // If installed → show nothing here (your real app loads elsewhere)
  if (isStandalone) return null;

  return (
    <div className="min-h-screen bg-[#0b0b13] text-white flex flex-col items-center justify-start px-6 pt-20 text-center">

      {/* Logo */}
      <div className="mb-8 animate-float">
        <Logo className="w-32 h-32 rounded-full border-4 border-amber-500 shadow-[0_0_60px_rgba(245,158,11,0.35)]" />
      </div>

      {/* Title */}
      <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight mb-4">
        Instale a Aplicação REO
      </h1>

      {/* Subtitle */}
      <p className="text-slate-400 max-w-md mb-10 text-base leading-relaxed">
        Para aceder à Rádio Escolar Online, adicione a aplicação ao ecrã principal.
      </p>

      {/* iOS Instructions */}
      {isIOS && (
        <div className="max-w-md text-left space-y-5">

          <h2 className="text-lg font-bold text-white text-center mb-4">
            No iPhone siga estes passos:
          </h2>

          {/* Share icon */}
          <div className="flex justify-center mb-6 animate-float-arrow">
            <div className="w-14 h-14 rounded-xl border-2 border-amber-500 flex items-center justify-center">
              {/* Closer to iOS share icon */}
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 16V4" />
                <path d="M8 8l4-4 4 4" />
                <path d="M4 20h16" />
              </svg>
            </div>
          </div>

          <ol className="space-y-3 text-slate-300 text-base leading-relaxed">
            <li><strong>1.</strong> Toque em <strong>Partilhar</strong>.</li>
            <li><strong>2.</strong> Se necessário, toque em <strong>Mais</strong>.</li>
            <li><strong>3.</strong> Escolha <strong>Adicionar ao ecrã principal (+)</strong>.</li>
            <li><strong>4.</strong> Toque em <strong>Adicionar</strong>.</li>
          </ol>

          <p className="text-amber-500 font-bold text-center pt-6">
            Não feche esta página enquanto instala.
          </p>
        </div>
      )}

      {/* Android install */}
      {!isIOS && deferredPrompt && (
        <button
          onClick={installAndroid}
          className="mt-8 bg-amber-500 hover:bg-amber-400 text-black px-8 py-4 rounded-full font-black uppercase tracking-wide shadow-lg transition-all active:scale-95"
        >
          Instalar Aplicação
        </button>
      )}
    </div>
  );
};

export default App;
