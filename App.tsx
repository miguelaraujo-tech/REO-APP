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
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    setIsInstalled(standalone);

    const userAgent = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(userAgent));

    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;

    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }

    setInstallPrompt(null);
  };

  /* ================= BLOCK UNTIL INSTALLED ================= */

  if (!isInstalled) {
    return (
      <div className="min-h-screen bg-[#0b0b13] text-white flex flex-col items-center justify-start pt-16 px-6 text-center">

        <Logo className="w-28 h-28 mb-6 rounded-full border-4 border-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.25)]" />

        <h1 className="text-2xl font-black uppercase tracking-tight mb-3">
          Instale a aplicação REO
        </h1>

        <p className="text-slate-400 text-sm max-w-md mb-8">
          Para aceder à Rádio Escolar Online, adicione a aplicação ao ecrã principal.
        </p>

        {/* ANDROID */}
        {!isIOS && installPrompt && (
          <button
            onClick={handleInstall}
            className="bg-amber-500 hover:bg-amber-400 text-black px-8 py-4 rounded-full font-black uppercase tracking-widest shadow-xl transition-all active:scale-95"
          >
            Instalar agora
          </button>
        )}

        {/* IOS INSTRUCTIONS */}
        {isIOS && (
          <div className="text-slate-300 text-sm max-w-md space-y-5 leading-relaxed relative">

            <p className="font-bold text-white">
              No iPhone siga estes passos:
            </p>

            {/* Animated Share Icon */}
            <div className="flex justify-center">
              <div className="animate-float-arrow">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 16V3" />
                  <path d="M8 7l4-4 4 4" />
                  <rect x="4" y="16" width="16" height="5" rx="2" />
                </svg>
              </div>
            </div>

            <ol className="text-left list-decimal list-inside space-y-2">
              <li>
                Toque em <strong className="text-white">Partilhar</strong>.
              </li>
              <li>
                Se necessário, toque em <strong>Mais</strong>.
              </li>
              <li>
                Escolha <strong>Adicionar ao ecrã principal (+)</strong>.
              </li>
              <li>
                Toque em <strong>Adicionar</strong>.
              </li>
            </ol>

            <p className="text-xs text-amber-500 font-bold">
              Não feche esta página enquanto instala.
            </p>
          </div>
        )}

        {!isIOS && !installPrompt && (
          <p className="text-sm text-slate-500 max-w-md mt-6">
            Abra o menu do navegador e selecione <strong>Instalar aplicação</strong>.
          </p>
        )}

      </div>
    );
  }

  /* ================= NORMAL APP ================= */

  return (
    <Router>
      <div className="min-h-screen bg-[#0b0b13] text-slate-200 flex flex-col selection:bg-amber-900/30">

        <header className="sticky top-0 z-50 bg-[#0b0b13]/95 backdrop-blur-md border-b border-white/5">
          <div className="max-w-4xl mx-auto px-4 h-16 sm:h-20 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <Logo className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-white/10 transition-transform group-hover:scale-110 duration-500" />
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
              <Logo className="w-8 h-8 rounded-full border border-white/5" />
              <span className="font-bold text-[10px] text-white tracking-tight">
                REO
              </span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <p className="text-slate-700 text-[9px] font-bold uppercase tracking-[0.3em] text-center px-4">
                &copy; 2026 REO - RÁDIO ESCOLAR ONLINE
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
