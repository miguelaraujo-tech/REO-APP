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
  const [isIOS, setIsIOS] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    const userAgent = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(userAgent));

    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  return (
    <Router>
      <div className="min-h-screen bg-[#0b0b13] text-slate-200 flex flex-col selection:bg-amber-900/30">

        {/* INSTALL BANNER */}
        {(installPrompt || isIOS) && (
          <div className="bg-amber-500 text-black text-center px-4 py-3 text-xs sm:text-sm font-bold uppercase tracking-widest">
            {!isIOS && installPrompt && (
              <button
                onClick={handleInstall}
                className="underline hover:no-underline"
              >
                Instalar aplicação REO
              </button>
            )}

            {isIOS && (
              <>
                Para instalar: toque em <strong>Partilhar</strong> e selecione{' '}
                <strong>Adicionar ao ecrã principal</strong>.
              </>
            )}
          </div>
        )}

        {/* HEADER */}
        <header className="sticky top-0 z-50 bg-[#0b0b13]/95 backdrop-blur-md border-b border-white/5">
          <div className="max-w-4xl mx-auto px-4 h-16 sm:h-20 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <Logo className="w-12 h-12 sm:w-14 sm:h-14 border border-white/10 rounded-full transition-transform group-hover:scale-110 duration-500" />
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

        {/* MAIN */}
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 sm:py-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/redes" element={<Socials />} />
            <Route path="/arquivo" element={<Archive />} />
            <Route path="/sobre" element={<About />} />
            <Route path="/contactar" element={<Contact />} />
          </Routes>
        </main>

        {/* FOOTER */}
        <footer className="py-12 border-t border-white/5 bg-[#08080d]">
          <div className="max-w-4xl mx-auto px-4 flex flex-col items-center gap-4">
            <div className="flex items-center gap-3 opacity-20 hover:opacity-40 transition-all duration-700">
              <Logo className="w-8 h-8 border border-white/5 rounded-full" />
              <div className="flex flex-col text-white">
                <span className="font-bold text-[10px] leading-none tracking-tight">
                  REO
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-1">
              <p className="text-slate-700 text-[9px] font-bold uppercase tracking-[0.3em] text-center px-4">
                &copy; 2026 REO - RÁDIO ESCOLAR ONLINE
              </p>
              <p className="text-slate-800 text-[8px] font-bold uppercase tracking-[0.15em] opacity-40 italic">
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
