
import React from 'react';
import { ArrowLeft, ExternalLink, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

const Contact: React.FC = () => {
  const formsUrl = "https://docs.google.com/forms/d/e/1FAIpQLSfqTXSpCu1fehucOOjt7nhW-pQRrHN8XNfM9YdcRQZ-CigSEw/viewform?usp=header";

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <Link to="/" className="inline-flex items-center text-amber-500 hover:text-amber-400 mb-8 font-bold uppercase tracking-widest text-xs group">
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Voltar para Home
      </Link>
      
      <div className="bg-slate-900/40 backdrop-blur-md rounded-[3rem] p-10 md:p-16 shadow-2xl border border-white/5 text-center">
        <div className="w-24 h-24 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(245,158,11,0.1)]">
          <Send className="w-10 h-10" />
        </div>
        
        <h1 className="text-4xl font-black text-white mb-6 tracking-tighter italic uppercase">Contacta-nos</h1>
        <p className="text-slate-400 max-w-lg mx-auto mb-12 text-lg font-medium leading-relaxed">
          Tens uma sugestão de música? Queres participar numa emissão ou deixar um comentário? 
          Usa o nosso formulário oficial para falares diretamente com a equipa REO!
        </p>
        
        <a 
          href={formsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-4 bg-amber-500 hover:bg-amber-400 text-black px-10 py-5 rounded-[2rem] font-black text-xl transition-all transform hover:scale-105 active:scale-95 shadow-2xl shadow-amber-500/20"
        >
          Abrir Formulário de Contacto
          <ExternalLink className="w-6 h-6" />
        </a>

        <div className="mt-16 text-xs text-slate-500 font-bold uppercase tracking-[0.2em] opacity-50">
          <p>O formulário será aberto num novo separador (Google Forms)</p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
