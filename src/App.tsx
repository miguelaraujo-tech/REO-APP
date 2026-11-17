
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Home as HomeIcon } from 'lucide-react';
import Home from './pages/Home';
import Socials from './pages/Socials';
import Archive from './pages/Archive';
import About from './pages/About';
import Contact from './pages/Contact';
import ReoDash from './pages/ReoDash';
import TennisEducation from './pages/TennisEducationLoader';
import Logo from './Logo';
import ScrollToTop from './ScrollToTop';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const App: React.FC = () => {
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const standaloneQuery = typeof window.matchMedia === 'function'
      ? window.matchMedia('(display-mode: standalone)')
      : null;
    const updateDisplayMode = () => {
      setIsStandalone(
        standaloneQuery?.matches === true ||
        (window.navigator as Navigator & { standalone?: boolean }).standalone === true
      );
    };
    updateDisplayMode();

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const handleAppInstalled = () => setDeferredPrompt(null);

    window.addEventListener('beforeinstallprompt', handleBeforeInstall as EventListener);
    window.addEventListener('appinstalled', handleAppInstalled);
    if (standaloneQuery?.addEventListener) {
      standaloneQuery.addEventListener('change', updateDisplayMode);
    } else {
      standaloneQuery?.addListener?.(updateDisplayMode);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall as EventListener);
      window.removeEventListener('appinstalled', handleAppInstalled);
      if (standaloneQuery?.removeEventListener) {
        standaloneQuery.removeEventListener('change', updateDisplayMode);
      } else {
        standaloneQuery?.removeListener?.(updateDisplayMode);
      }
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;
    const installPrompt = deferredPrompt;
    // Cada convite só pode ser utilizado uma vez.
    setDeferredPrompt(null);
    try {
      await installPrompt.prompt();
      await installPrompt.userChoice;
    } catch {
      // Se a instalação falhar ou não estiver disponível, a REO continua acessível.
    }
  };

  return (
    <Router>
      <ScrollToTop />
      <div className="reo-app-shell min-h-screen bg-[#0b0b13] text-slate-200 flex flex-col selection:bg-amber-900/30">
        <header className="reo-app-header sticky top-0 z-50 bg-[#0b0b13]/95 backdrop-blur-md">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
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

            <nav className="flex items-center gap-1">
              {!isStandalone && deferredPrompt && (
                <button
                  type="button"
                  onClick={installApp}
                  className="px-3 py-2 rounded-full bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-colors"
                  title="Instalar a REO neste dispositivo (opcional)"
                >
                  Instalar
                </button>
              )}
              <Link
                to="/"
                className="p-2 hover:bg-white/5 rounded-full transition-all text-slate-400 hover:text-amber-500"
                title="Início"
              >
                <HomeIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              </Link>
            </nav>
          </div>

          <img
            src="/escolalogo.png"
            alt=""
            loading="lazy"
            decoding="async"
            className="reo-app-school-banner w-full h-auto border-b border-amber-500/40"
          />
        </header>

        <main className="reo-app-main flex-1 max-w-4xl w-full mx-auto px-4 py-6 sm:py-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/redes" element={<Socials />} />
            <Route path="/arquivo" element={<Archive />} />
            <Route path="/sobre" element={<About />} />
            <Route path="/contactar" element={<Contact />} />
            <Route path="/reo-dash" element={<ReoDash />} />
            <Route path="/tennis-education" element={<TennisEducation />} />
          </Routes>
        </main>

        <footer className="reo-app-footer py-12 border-t border-white/5 bg-[#08080d]">
          <div className="max-w-4xl mx-auto px-4 flex flex-col items-center gap-4">
            <div className="flex items-center gap-3 opacity-20 hover:opacity-40 transition-all duration-700">
              <Logo className="w-8 h-8 border border-white/5" />
              <span className="font-bold text-[10px] leading-none tracking-tight text-white">
                REO
              </span>
            </div>
            <div className="flex flex-col items-center gap-1 opacity-40">
              <p className="text-slate-600 text-[9px] uppercase tracking-[0.3em] text-center">
                © 2026 REO · RÁDIO ESCOLAR ONLINE
              </p>
              <p className="text-[8px] uppercase tracking-[0.2em] text-center">
                <span className="text-slate-600 opacity-80">
                  Coordenação e Desenvolvimento
                </span>
                <span className="text-slate-800 opacity-30">
                  {' '}· Miguel Araújo
                </span>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;
