import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Socials from './pages/Socials';
import Archive from './pages/Archive';
import About from './pages/About';
import Contact from './pages/Contact';

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
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setIsInstalled(true);
    }
  };

  // 🔒 BLOCK ACCESS IF NOT INSTALLED
  if (!isInstalled) {
    return (
      <div className="min-h-screen bg-[#0b0b13] text-white flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-3xl font-black uppercase mb-6">
          Instale a aplicação REO
        </h1>

        {!isIOS && installPrompt && (
          <button
            onClick={handleInstall}
            className="bg-amber-500 hover:bg-amber-400 text-black px-8 py-4 rounded-full font-black uppercase tracking-widest shadow-xl"
          >
            Instalar agora
          </button>
        )}

        {isIOS && (
          <p className="text-sm text-slate-300 max-w-md">
            Para instalar no iPhone:
            <br /><br />
            Toque em <strong>Partilhar</strong> e selecione
            <strong> “Adicionar ao ecrã principal”</strong>.
          </p>
        )}
      </div>
    );
  }

  // ✅ Normal app only if installed
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/redes" element={<Socials />} />
        <Route path="/arquivo" element={<Archive />} />
        <Route path="/sobre" element={<About />} />
        <Route path="/contactar" element={<Contact />} />
      </Routes>
    </Router>
  );
};

export default App;
