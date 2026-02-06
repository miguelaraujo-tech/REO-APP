import React from 'react';
import { ArrowLeft, Podcast, Users, Target, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../Logo';

const About: React.FC = () => {
  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <Link
        to="/"
        className="inline-flex items-center text-amber-500 hover:text-amber-400 mb-8 font-bold uppercase tracking-widest text-xs group"
      >
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Voltar para Home
      </Link>

      <article className="bg-slate-900/40 backdrop-blur-md rounded-[3rem] p-10 md:p-16 shadow-2xl border border-white/5">
        <div className="flex flex-col md:flex-row items-center gap-6 mb-12">
          <div className="w-20 h-20 bg-amber-500 rounded-3xl flex items-center justify-center text-black shadow-xl rotate-3 overflow-hidden border border-white/10">
            <Logo className="w-full h-full" />
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">
              SOBRE A REO
            </h1>
            <p className="text-amber-500 font-black uppercase tracking-[0.15em] text-[9px] sm:text-[10px] mt-2 opacity-80">
              A RÁDIO ESCOLAR ONLINE DO AGRUPAMENTO DE ESCOLAS DE S. BENTO DE VIZELA
            </p>
          </div>
        </div>

        <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed space-y-8 font-medium text-lg">
          <div className="space-y-6">
            <p>
              A <span className="text-white font-bold">REO – Rádio Escolar Online de Vizela</span> é um
              projeto educativo e cultural que nasceu da visão, persistência e envolvimento ativo da
              comunidade escolar do <span className="text-white font-bold">Agrupamento de Escolas de S. Bento de Vizela</span>.
            </p>

            <p>
              O projeto foi o grande vencedor da{' '}
              <span className="text-amber-500 font-bold">2.ª edição do Orçamento Participativo Jovem (OPJ) de Vizela, em 2018</span>,
              tendo conquistado <span className="text-white font-bold">47,37% dos votos</span>, um reflexo claro do reconhecimento e
              apoio da comunidade local. No âmbito desta iniciativa, a Câmara Municipal de Vizela atribuiu uma verba até{' '}
              <span className="text-amber-500 font-bold">15.000 euros</span>, possibilitando a criação de um estúdio de rádio profissional,
              equipado com tecnologia de última geração.
            </p>

            <p>
              Desde a sua génese, a REO é coordenada por <span className="text-white font-bold">Miguel Araújo</span>, que tem assegurado
              de forma contínua a liderança, a consolidação e a evolução do projeto. Atualmente, a REO ultrapassa o conceito tradicional
              de rádio escolar, afirmando-se como um <span className="text-white font-bold">hub digital educativo</span>, onde tecnologia e
              pedagogia se cruzam para dar voz aos alunos, promover a criatividade e reforçar a ligação entre a escola e a comunidade.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 hover:border-amber-500/30 transition-colors group">
              <div className="flex items-center gap-4 mb-3">
                <Target className="text-amber-500 w-6 h-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-white font-black uppercase tracking-wider text-sm">Missão</h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Promover a comunicação, a expressão e o espírito participativo, funcionando como uma ferramenta pedagógica ativa através de
                emissões online, podcasts e conteúdos digitais, desenvolvidos com e para os alunos, valorizando a sua voz, pensamento crítico
                e envolvimento cívico.
              </p>
            </div>

            <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 hover:border-amber-500/30 transition-colors group">
              <div className="flex items-center gap-4 mb-3">
                <Calendar className="text-amber-500 w-6 h-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-white font-black uppercase tracking-wider text-sm">Continuidade</h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Em março de 2026, a REO mantém-se em plena expansão digital, consolidando-se como um projeto de referência na juventude de
                Vizela, com uma presença cada vez mais forte no universo digital, educativo e comunitário, garantindo sustentabilidade,
                inovação e impacto pedagógico continuado.
              </p>
            </div>

            <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 hover:border-amber-500/30 transition-colors group">
              <div className="flex items-center gap-4 mb-3">
                <Podcast className="text-amber-500 w-6 h-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-white font-black uppercase tracking-wider text-sm">Tecnologia</h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                A APP da REO assenta numa plataforma digital PWA (Progressive Web App), desenvolvida para garantir um acesso rápido,
                intuitivo e multiplataforma aos conteúdos áudio, permitindo ouvir programas e podcasts em qualquer dispositivo, a qualquer
                momento, sem barreiras tecnológicas.
              </p>
            </div>

            <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 hover:border-amber-500/30 transition-colors group">
              <div className="flex items-center gap-4 mb-3">
                <Users className="text-amber-500 w-6 h-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-white font-black uppercase tracking-wider text-sm">Coordenação</h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                O projeto conta com a liderança dedicada de Miguel Araújo, responsável pela visão técnica e pedagógica da REO, assegurando a
                articulação entre inovação tecnológica, objetivos educativos e envolvimento da comunidade escolar, garantindo a identidade,
                qualidade e evolução contínua do projeto.
              </p>
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
