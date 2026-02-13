import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
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
      <div className="min-h-screen bg-[#0b0b13] text-white flex flex-col items-center pt-20 px-6 text-center">
        
        {/* Logo */}
        <Logo className="w-28 h-28 mb-8 rounded-full border-4 border-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.3)]" />

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight mb-4">
          Instale a aplicação REO
        </h1>

        <p className="text-slate-400 text-sm max-w-md mb-10">
          Para utilizar a Rádio Escolar Online, é necessário instalar a aplicação no seu dispositivo.
        </p>

        {/* ANDROID / CHROME */}
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
          <div className="text-slate-300 text-sm max-w-md space-y-4 leading-relaxed">
            <p className="font-bold text-white">
              Para instalar no iPhone:
            </p>

            <ol className="text-left list-decimal list-inside space-y-2">
              <li>Toque no botão <strong>Partilhar</strong> (ícone quadrado com seta).</li>
              <li>Desça a lista e selecione <strong>“Adicionar ao ecrã principal”</strong>.</li>
              <li>Confirme em <strong>Adicionar</strong>.</li>
            </ol>

            <p className="text-xs text-slate-500 mt-6">
              Depois de instalada, abra a aplicação a partir do ecrã principal.
            </p>
          </div>
        )}

        {/* Fallback if Android but no install event yet */}
        {!isIOS && !installPrompt && (
          <p className="text-sm text-slate-500 max-w-md mt-4">
            Se o botão não aparecer, utilize o menu do navegador e escolha 
            <strong> “Instalar aplicação”</strong>.
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
