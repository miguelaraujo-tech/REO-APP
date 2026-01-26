import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SOCIAL_LINKS } from '../constants';

const Socials: React.FC = () => {
  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <Link to="/" className="inline-flex items-center text-amber-500 hover:text-amber-400 mb-8 font-bold uppercase tracking-widest text-xs group">
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Voltar para Home
      </Link>
      
      <div className="bg-slate-900/40 backdrop-blur-md rounded-[3rem] p-10 shadow-2xl border border-white/5">
        <h1 className="text-4xl font-black text-white mb-3 tracking-tighter">Redes Sociais</h1>
        <p className="text-slate-400 mb-10 font-medium">Fica ligado à REO nas nossas plataformas oficiais.</p>
        
        <div className="space-y-4">
          {SOCIAL_LINKS.map((social) => (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center p-6 rounded-[2rem] text-white ${social.color} hover:brightness-110 transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl group`}
            >
              <div className="bg-white/20 p-3 rounded-xl mr-5 group-hover:rotate-12 transition-transform">
                {social.icon}
              </div>
              <span className="text-xl font-black italic tracking-tight">Seguir no {social.name}</span>
              <div className="ml-auto opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Socials;