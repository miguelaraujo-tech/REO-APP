import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Home as HomeIcon, Share } from 'lucide-react';
import Home from './pages/Home';
import Socials from './pages/Socials';
import Archive from './pages/Archive';
import About from './pages/About';
import Contact from './pages/Contact';
import Logo from './Logo';

const App: React.FC = () => {
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    setIsStandalone(standalone);

    const userAgent = window.navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(userAgent));

    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () =>
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  // 🔒 BLOCK ACCESS IF NOT INSTALLED
  if (!isStandalone) {
    return (
      <div className="min-h-screen bg-[#0b0b13] text-white flex flex-col items-center justify-start pt-16 px-6 text-center">
        <Logo className="w-24 h-24 mb-8 border border-amber-500/40 rounded-full shadow-[0_0_40px_rgba(245,158,11,0.3)]" />

        <h1 className="text-3xl sm:text-4xl font-black uppercase mb-6">
          Instale a Aplicação REO
        </h1>

        <p className="text-slate-400 max-w-md mb-10">
          Para aceder à Rádio Escolar Online, adicione a aplicação ao ecrã principal.
        </p>

        {/* ANDROID */}
        {!isIOS && installPrompt && (
          <button
            onClick={handleInstall}
            className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-8 py-4 rounded-full shadow-xl transition-all active:scale-95 mb-10"
          >
            Instalar Aplicação
          </button>
        )}

        {/* iOS INSTRUCTIONS */}
        {isIOS && (
          <div className="max-w-md space-y-6">
            <h2 className="text-xl font-bold">
              No iPhone siga estes passos:
            </h2>

            <div className="flex justify-center">
              <Share
                className="w-14 h-14 text-amber-500 animate-float-arrow"
                strokeWidth={2}
                style={{ filter: 'drop-shadow(0 0 12px rgba(245,158,11,0.4))' }}
              />
            </div>

            <ol className="text-left text-slate-300 space-y-4 text-lg">
              <li>
                <strong>1.</strong> Toque em <strong>Partilhar</strong>.
              </li>
              <li>
                <strong>2.</strong> Se necessário, toque em <strong>Mais</strong>.
              </li>
              <li>
                <strong>3.</strong> Escolha <strong>Adicionar ao ecrã principal (+)</strong>.
              </li>
              <li>
                <strong>4.</strong> Toque em <strong>Adicionar</strong>.
              </li>
            </ol>

            <p className="text-amber-500 font-bold pt-4">
              Não feche esta página enquanto instala.
            </p>
          </div>
        )}
      </div>
    );
  }

  // ✅ NORMAL APP AFTER INSTALL
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

            <nav>
              <Link
                to="/"
                className="p-2 hover:bg-white/5 rounded-full transition-all text-slate-400 hover:text-amber-500"
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
              <span className="font-bold text-[10px] tracking-tight">REO</span>
            </div>

            <p className="text-slate-700 text-[9px] font-bold uppercase tracking-[0.3em] text-center px-4">
              © 2026 REO - RÁDIO ESCOLAR ONLINE
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;
