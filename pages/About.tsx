import React from 'react';
import { ArrowLeft, Podcast, Users, Target, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../Logo';

const About: React.FC = () => {
  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <Link to="/" className="inline-flex items-center text-amber-500 hover:text-amber-400 mb-8 font-bold uppercase tracking-widest text-xs group">
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Voltar para Home
      </Link>
      
      <article className="bg-slate-900/40 backdrop-blur-md rounded-[3rem] p-10 md:p-16 shadow-2xl border border-white/5">
        <div className="flex flex-col md:flex-row items-center gap-6 mb-12">
          <div className="w-20 h-20 bg-amber-500 rounded-3xl flex items-center justify-center text-black shadow-xl rotate-3 overflow-hidden border border-white/10">
            <Logo className="w-full h-full" />
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">Sobre a REO</h1>
            <p className="text-amber-500 font-black uppercase tracking-[0.15em] text-[9px] sm:text-[10px] mt-2 opacity-80">
              A RÁDIO ESCOLAR ONLINE DO AGRUPAMENTO DE ESCOLAS DE S. BENTO DE VIZELA
            </p>
          </div>
        </div>

        <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed space-y-8 font-medium text-lg">
          <div className="space-y-6">
            <p>
              A <span className="text-white font-bold">REO – Rádio Escolar Online de Vizela</span> é um projeto que nasceu da visão e persistência da comunidade escolar, tendo sido o grande vencedor da <span className="text-amber-500 font-bold">2.ª edição do Orçamento Participativo Jovem (OPJ) de Vizela, em 2018</span>.
            </p>
            
            <p>
              O projeto, coordenado desde a sua génese por <span className="text-white font-bold">Miguel Araújo</span>, venceu com <span className="text-white font-bold">47,37% dos votos</span>. A Câmara Municipal de Vizela atribuiu uma verba de até <span className="text-amber-500 font-bold">15.000 euros</span> para a sua implementação, permitindo dotar a escola de um estúdio profissional de última geração.
            </p>

            <p>
              Hoje, a REO não é apenas uma rádio, mas um hub digital desenvolvido por <span className="text-white font-bold">Miguel Araújo</span>, que integra tecnologia e pedagogia para dar voz aos alunos do Agrupamento de Escolas de S. Bento de Vizela.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 hover:border-amber-500/30 transition-colors group">
              <div className="flex items-center gap-4 mb-3">
                <Target className="text-amber-500 w-6 h-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-white font-black uppercase tracking-wider text-sm">Missão</h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">Promover a comunicação e o espírito participativo, funcionando como ferramenta pedagógica através de emissões online e podcasts.</p>
            </div>

            <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 hover:border-amber-500/30 transition-colors group">
              <div className="flex items-center gap-4 mb-3">
                <Calendar className="text-amber-500 w-6 h-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-white font-black uppercase tracking-wider text-sm">Continuidade</h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">Em março de 2026, o projeto continua a sua expansão digital, mantendo-se como referência na juventude de Vizela.</p>
            </div>

            <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 hover:border-amber-500/30 transition-colors group">
              <div className="flex items-center gap-4 mb-3">
                <Podcast className="text-amber-500 w-6 h-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-white font-black uppercase tracking-wider text-sm">Tecnologia</h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">Plataforma PWA desenvolvida para acesso rápido a conteúdos áudio em qualquer dispositivo.</p>
            </div>

            <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 hover:border-amber-500/30 transition-colors group">
              <div className="flex items-center gap-4 mb-3">
                <Users className="text-amber-500 w-6 h-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-white font-black uppercase tracking-wider text-sm">Coordenação</h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">Liderança dedicada de Miguel Araújo, garantindo a visão técnica e pedagógica do projeto.</p>
            </div>
          </div>

          <div className="mt-16 pt-10 border-t border-white/5 text-center flex flex-col items-center gap-2">
            <p className="text-slate-600 italic text-xs uppercase font-bold tracking-widest opacity-60">
              "REO - A voz da escola, o som de Vizela."
            </p>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-700 opacity-40 mt-4">
              Coordenação e Programação: Miguel Araújo
            </p>
          </div>
        </div>
      </article>
    </div>
  );
};

export default About;