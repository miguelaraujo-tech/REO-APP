import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Home as HomeIcon } from 'lucide-react';
import Home from './pages/Home';
import Socials from './pages/Socials';
import Archive from './pages/Archive';
import About from './pages/About';
import Contact from './pages/Contact';
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

    const ua = window.navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua));

    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const installAndroid = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  /* ======================================================
     BLOCK ACCESS IF NOT INSTALLED
  ====================================================== */

  if (!isStandalone) {
    return (
      <div className="min-h-screen bg-[#0b0b13] text-white flex flex-col items-center justify-start px-6 pt-8 pb-20 text-center">

        {/* Logo */}
        <div className="mb-4 animate-float">
          <Logo className="w-28 h-28 rounded-full border-4 border-amber-500 shadow-[0_0_60px_rgba(245,158,11,0.35)]" />
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight mb-2">
          Instale a Aplicação REO
        </h1>

        {/* Subtitle */}
        <p className="text-slate-400 max-w-md mb-6 text-base leading-relaxed">
          Para aceder à Rádio Escolar Online, adicione a aplicação ao ecrã principal.
        </p>

        {/* iOS Instructions */}
        {isIOS && (
          <div className="max-w-md text-left space-y-4">

            <h2 className="text-lg font-bold text-white text-center mb-2">
              No iPhone siga estes passos:
            </h2>

            {/* Floating Share Image */}
            <div className="flex justify-center mb-2 animate-bounce">
              <img
                src="/share-icon.png"
                alt="Partilhar"
                className="w-20 h-20 object-contain drop-shadow-[0_0_30px_rgba(245,158,11,0.8)]"
                draggable={false}
              />
            </div>

            <ol className="space-y-2 text-slate-300 text-base leading-snug">
              <li><strong>1.</strong> Toque em <strong>Partilhar</strong>.</li>
              <li><strong>2.</strong> Se necessário, toque em <strong>Mais</strong>.</li>
              <li><strong>3.</strong> Escolha <strong>Adicionar ao ecrã principal (+)</strong>.</li>
              <li><strong>4.</strong> Toque em <strong>Adicionar</strong>.</li>
            </ol>

            <p className="text-amber-500 font-bold text-center pt-3">
              Não feche esta página enquanto instala.
            </p>
          </div>
        )}

        {/* Android Install Button */}
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
  }

  /* ======================================================
     NORMAL APP (ONLY IF INSTALLED)
  ====================================================== */

  return (
    <Router>
      <div className="min-h-screen bg-[#0b0b13] text-slate-200 flex flex-col selection:bg-amber-900/30">

        <header className="sticky top-0 z-50 bg-[#0b0b13]/95 backdrop-blur-md border-b border-white/5">
          <div className="max-w-4xl mx-auto px-4 h-16 sm:h-20 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <Logo className="w-12 h-12 sm:w-14 sm:h-14 border border-white/10 transition-transform group-hover:scale-110 duration-500" />
              <div className="flex flex-col">
                <span className="font-black text-lg sm:text-xl leading-none tracking-tight group-hover:text-amber-500 transition-colors uppercase italic text-white">
                  REO
                </span>
                <span className="text-[8px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                  Rádio Escolar Online
                </span>
              </div>
            </Link>

            <nav className="flex items-center">
              <Link
                to="/"
                className="p-2 hover:bg-white/5 rounded-full transition-all text-slate-400 hover:text-amber-500"
                title="Início"
              >
                <HomeIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 sm:py-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/redes" element={<Socials />} />
            <Route path="/arquivo" element={<Archive />} />
            <Route path="/sobre" element={<About />} />
            <Route path="/contactar" element={<Contact />} />
          </Routes>
        </main>

        <footer className="py-12 border-t border-white/5 bg-[#08080d]">
          <div className="max-w-4xl mx-auto px-4 flex flex-col items-center gap-4">
            <div className="flex items-center gap-3 opacity-20 hover:opacity-40 transition-all duration-700">
              <Logo className="w-8 h-8 border border-white/5" />
              <div className="flex flex-col text-white">
                <span className="font-bold text-[10px] leading-none tracking-tight">
                  REO
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-1">
              <p className="text-slate-700 text-[9px] font-bold uppercase tracking-[0.3em] text-center px-4">
                © 2026 REO - RÁDIO ESCOLAR ONLINE
              </p>
              <p className="text-slate-800 text-[8px] font-bold uppercase tracking-[0.1em] text-center opacity-40">
                Coordenação e Desenvolvimento: Miguel Araújo
              </p>
            </div>
          </div>
        </footer>

      </div>
    </Router>
  );
};

export default App;
