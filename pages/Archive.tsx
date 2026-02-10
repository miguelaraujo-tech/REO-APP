import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Folder,
  FileAudio,
  Play,
  ChevronRight,
  Music,
  Loader2,
  X,
  AlertCircle,
  Copy,
  Check,
  Download,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vTNDK5O5sxCx0auwCckXL5yw0HckNJoYqlUXA3yoRX_5MC4hHjbqrqtlFSlNVXfSaVZ0_pyNYh3sMSz/pub?output=csv';

interface Episode {
  id: string;
  title: string;
  year: string;
  program: string;
  fileId: string;
  coverId: string;
}

interface NavItem {
  type: 'folder' | 'file';
  name: string;
  id: string;
  data?: Episode;
  coverId?: string;
}

const Archive: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [archiveTree, setArchiveTree] = useState<Record<string, Record<string, Episode[]>>>({});
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [activeEpisode, setActiveEpisode] = useState<Episode | null>(null);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const normalize = (str: string) => {
    if (!str) return '';
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');
  };

  // If the CSV contains formula text like =HYPERLINK("url","label"),
  // extract the URL portion so we can grab the Drive ID.
  const extractUrlFromCell = (value: string): string => {
    if (!value) return '';
    const v = value.trim();

    // =HYPERLINK("url","label")  or  HYPERLINK("url","label")
    const m1 = v.match(/HYPERLINK\(\s*"([^"]+)"\s*,/i);
    if (m1?.[1]) return m1[1];

    // HYPERLINK('url','label')
    const m2 = v.match(/HYPERLINK\(\s*'([^']+)'\s*,/i);
    if (m2?.[1]) return m2[1];

    return v;
  };

  const extractDriveFileId = (url: string): string | null => {
    if (!url) return null;

    // Some cells may include the whole formula, so normalize first
    const clean = extractUrlFromCell(url);

    const patterns = [
      /\/d\/([a-zA-Z0-9_-]+)/,
      /\/file\/d\/([a-zA-Z0-9_-]+)/,
      /[?&]id=([a-zA-Z0-9_-]+)/,
      /id=([a-zA-Z0-9_-]+)/,
      /uc\?export=view&id=([a-zA-Z0-9_-]+)/,
      /uc\?id=([a-zA-Z0-9_-]+)/,
      /uc\?export=download&id=([a-zA-Z0-9_-]+)/,
      /thumbnail\?id=([a-zA-Z0-9_-]+)/,
    ];

    for (const pattern of patterns) {
      const match = clean.match(pattern);
      if (match && match[1]) return match[1];
    }
    return null;
  };

  // More reliable than uc?export=view for public images
  const driveThumb = (id: string, size = 1200) =>
    `https://drive.google.com/thumbnail?id=${id}&sz=w${size}`;

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveEpisode(null);
    };

    if (activeEpisode) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      window.addEventListener('keydown', handleEsc);
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      if (scrollY) window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
    }

    return () => {
      document.body.style.position = '';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [activeEpisode]);

  const loadData = () => {
    setLoading(true);
    setPlaybackError(null);

    // Note: CSV_URL already includes ?output=csv, so cache-busters should use &...
    fetch(`${CSV_URL}&t=${Date.now()}&nocache=${Math.random()}`, { cache: 'no-store' })
      .then(async (res) => {
        const text = await res.text();

        // Detect when Google returns an HTML page (permissions/login) instead of CSV.
        const looksLikeHtml =
          /<!doctype html>/i.test(text) ||
          /<html/i.test(text) ||
          /accounts\.google\.com/i.test(text) ||
          /ServiceLogin/i.test(text);

        if (!res.ok || looksLikeHtml) throw new Error('CSV_NOT_AVAILABLE');

        return text;
      })
      .then((csvText) => {
        const cleanText = csvText
          .replace(/^\uFEFF/, '')
          .replace(/\r\n/g, '\n')
          .replace(/\r/g, '\n');

        const lines = cleanText.split('\n').filter((l) => l.trim() !== '');
        if (lines.length < 2) {
          setArchiveTree({});
          setPlaybackError('CSV vazio ou inválido (sem linhas suficientes).');
          setLoading(false);
          return;
        }

        let headerIndex = 0;

        // Support "sep=;"
        if (lines[0].toLowerCase().trim().startsWith('sep=')) {
          headerIndex = 1;
        }

        const headerLine = lines[headerIndex] || lines[0] || '';
        const commaCount = (headerLine.match(/,/g) || []).length;
        const semiCount = (headerLine.match(/;/g) || []).length;
        const delimiter = semiCount > commaCount ? ';' : ',';

        const splitLine = (line: string, d: string) => {
          const result: string[] = [];
          let current = '';
          let inQuotes = false;

          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') inQuotes = !inQuotes;
            else if (char === d && !inQuotes) {
              result.push(current.trim());
              current = '';
            } else current += char;
          }
          result.push(current.trim());

          return result.map((v) => v.replace(/^"|"$/g, '').trim());
        };

        const headerRow = splitLine(lines[headerIndex], delimiter);
        const headers = headerRow.map(normalize);

        const findIdx = (needles: string[]) =>
          headers.findIndex((h) => needles.some((n) => h.includes(normalize(n))));

        const idxs = {
  year: findIdx(['year']),
  program: findIdx(['program']),
  title: findIdx(['title', 'file name', 'filename']),
  audioId: findIdx(['audiofileid']),
  coverId: findIdx(['coverfileid']),
};

        console.log('[CSV DEBUG] Header:', headerRow);
        console.log('[CSV DEBUG] Column indices:', idxs);

        const nothingMatched =
          idxs.year === -1 &&
          idxs.program === -1 &&
          idxs.title === -1 &&
          idxs.audio === -1 &&
          idxs.cover === -1;

        if (nothingMatched) {
          setArchiveTree({});
          setPlaybackError(
            'Não consegui identificar as colunas do CSV. Confirma os cabeçalhos (Ano/Programa/Título/Link/Capas).'
          );
          setLoading(false);
          return;
        }

        const tree: Record<string, Record<string, Episode[]>> = {};

        for (let i = headerIndex + 1; i < lines.length; i++) {
          const row = splitLine(lines[i], delimiter);
          if (row.length <= 1) continue;

          const year = (idxs.year !== -1 ? row[idxs.year] : '') || 'Geral';
          const program = (idxs.program !== -1 ? row[idxs.program] : '') || 'Geral';
          const title = (idxs.title !== -1 ? row[idxs.title] : '') || `Emissão ${i}`;

         const fileId = idxs.audioId !== -1 ? row[idxs.audioId].trim() : '';
const coverId = idxs.coverId !== -1 ? row[idxs.coverId].trim() : '';

          if (!tree[year]) tree[year] = {};
          if (!tree[year][program]) tree[year][program] = [];

          tree[year][program].push({
            id: `ep-${i}-${normalize(year)}-${normalize(program)}`,
            title,
            year,
            program,
            fileId,
            coverId,
          });
        }

        setArchiveTree(tree);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Erro ao carregar CSV:', err);
        setArchiveTree({});
        setPlaybackError(
          'Não foi possível ler o CSV do Google Sheets. Confirma que está “Publicado na Web” como CSV e acessível sem login.'
        );
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openPlayer = (episode: Episode) => {
    setPlaybackError(null);
    if (!episode.fileId) {
      setPlaybackError('Link de áudio inválido.');
      return;
    }
    setActiveEpisode(episode);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Falha ao copiar:', err);
    }
  };

  const handleItemClick = (item: NavItem) => {
    setPlaybackError(null);
    if (item.type === 'folder') {
      setCurrentPath([...currentPath, item.id]);
    } else if (item.type === 'file' && item.data) {
      openPlayer(item.data);
    }
  };

  const items: NavItem[] = (() => {
    if (currentPath.length === 0) {
      return Object.keys(archiveTree)
        .sort((a, b) => b.localeCompare(a))
        .map((y) => ({
          type: 'folder',
          name: y,
          id: y,
        }));
    }

    if (currentPath.length === 1) {
      const year = currentPath[0];
      return Object.keys(archiveTree[year] || {})
        .sort()
        .map((p) => {
          const firstEp = archiveTree[year][p]?.[0];
          return {
            type: 'folder',
            name: p,
            id: p,
            coverId: firstEp?.coverId || '',
          };
        });
    }

    const [year, program] = currentPath;
    return (archiveTree[year]?.[program] || []).map((ep) => ({
      type: 'file',
      name: ep.title,
      id: ep.id,
      data: ep,
    }));
  })();

  const breadcrumbs = ['Arquivo', ...currentPath];

  // Cover for program header: first non-empty coverId inside that program
  const programCoverId =
    currentPath.length === 2
      ? archiveTree[currentPath[0]]?.[currentPath[1]]?.find((ep) => !!ep.coverId)?.coverId || ''
      : '';

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500 pb-24 relative">
      <div className="flex items-center justify-between mb-6 px-2">
        <Link
          to="/"
          className="inline-flex items-center text-amber-500 hover:text-amber-400 mb-2 font-bold uppercase tracking-widest text-[10px] group"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5 group-hover:-translate-x-1 transition-transform" /> Início
        </Link>

        {currentPath.length > 0 && (
          <button
            onClick={() => {
              setPlaybackError(null);
              setCurrentPath(currentPath.slice(0, -1));
            }}
            className="text-[10px] font-black uppercase tracking-widest bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/5 transition-all active:scale-95"
          >
            <ChevronRight className="w-3 h-3 rotate-180" /> Voltar
          </button>
        )}
      </div>

      {playbackError && (
        <div className="mb-6 mx-2 animate-in fade-in slide-in-from-top-2">
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3 text-red-400">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-xs font-bold uppercase tracking-wider">{playbackError}</p>
            <button
              onClick={() => {
                setPlaybackError(null);
                loadData();
              }}
              className="ml-auto bg-red-500/20 px-2 py-1 rounded-lg hover:bg-red-500/40 text-[9px] uppercase font-black"
            >
              Repetir
            </button>
          </div>
        </div>
      )}

      <div className="bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] shadow-2xl border border-white/5 overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-white/5 bg-white/[0.02]">
            {breadcrumbs.map((crumb, idx) => {
  const isLast = idx === breadcrumbs.length - 1;

  return (
    <React.Fragment key={idx}>
      <button
        disabled={isLast}
        onClick={() => {
          if (!isLast) {
            // idx 0 = Arquivo → []
            // idx 1 = Year → [year]
            setPlaybackError(null);
            setCurrentPath(currentPath.slice(0, idx));
          }
        }}
        className={`text-[10px] font-black uppercase tracking-widest transition-colors
          ${isLast
            ? 'text-amber-500 cursor-default'
            : 'text-slate-500 hover:text-white cursor-pointer'}
        `}
      >
        {crumb}
      </button>

      {!isLast && <ChevronRight className="w-3 h-3 opacity-30" />}
    </React.Fragment>
  );
})}

          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3 tracking-tighter italic uppercase leading-none">
            <Folder className="text-amber-500 w-6 h-6 sm:w-8 sm:h-8" />
            {currentPath.length === 0 ? 'Arquivo' : currentPath[currentPath.length - 1]}
          </h1>

          {/* Cover ONLY on program pages */}
          {currentPath.length === 2 && items.length > 0 && (
            <>
              {!programCoverId ? (
                <div className="mt-6 -mx-6 sm:-mx-8 h-48 bg-slate-800/50 rounded-b-3xl flex items-center justify-center text-slate-400 text-sm italic">
                  Sem capa para {currentPath[1]} (verifique pasta Drive / CSV)
                </div>
              ) : (
                <div
                  className="relative -mx-6 sm:-mx-8 h-64 sm:h-80 md:h-96 lg:h-[420px] mt-6 overflow-hidden rounded-b-3xl shadow-2xl"
                  style={{
                    backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.45), rgba(0,0,0,0.75)), url(${driveThumb(
                      programCoverId,
                      2000
                    )})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                  }}
                >
                  <div className="absolute inset-0 flex items-end justify-center pb-8 px-6 text-center">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white drop-shadow-2xl tracking-tight">
                      {currentPath[1]}
                    </h2>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="divide-y divide-white/5 min-h-[350px] max-h-[60vh] overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-28 text-slate-500 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
              <span className="font-black uppercase tracking-widest text-[10px]">A ler biblioteca...</span>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-slate-600 italic uppercase font-bold tracking-widest opacity-30">
              Vazio
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className="p-5 sm:p-6 flex items-center justify-between hover:bg-white/[0.03] active:bg-white/[0.05] transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-4 sm:gap-6">
                  {item.type === 'folder' ? (
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden flex-shrink-0 shadow-md bg-gradient-to-br from-slate-800 to-slate-950">
                      {item.coverId ? (
                        <img
                          src={driveThumb(item.coverId, 500)}
                          alt={`Capa ${item.name}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Music className="w-7 h-7 text-amber-600/50" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-inner bg-blue-500/10 text-blue-400">
                      <FileAudio className="w-6 h-6" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <span className="font-bold text-white text-base sm:text-lg block tracking-tight group-hover:text-amber-500 transition-colors truncate max-w-[160px] sm:max-w-md">
                      {item.name}
                    </span>
                    <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest mt-1">
                      {item.type === 'folder' ? (currentPath.length === 0 ? 'Ano Letivo' : 'Programa') : 'Áudio MP3'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {item.type === 'file' && item.data ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openPlayer(item.data!);
                      }}
                      aria-label={`Ouvir ${item.name}`}
                      className="w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-xl shrink-0 bg-white/5 text-white hover:bg-amber-500 hover:text-black"
                    >
                      <Play className="w-6 h-6 ml-1 fill-current" />
                    </button>
                  ) : (
                    <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {activeEpisode && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/90 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setActiveEpisode(null)}
          />

          <div className="relative w-full max-w-lg bg-[#0f0f18] rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,1)] border border-white/10 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
            <div className="p-6 flex items-center justify-between border-b border-white/5 bg-white/[0.01]">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shrink-0 rotate-3">
                  <Music className="w-5 h-5 text-black" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-white font-black uppercase tracking-tight text-sm truncate leading-tight italic">
                    {activeEpisode.title}
                  </h3>
                  <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-0.5 opacity-60">
                    {activeEpisode.year} • {activeEpisode.program}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveEpisode(null)}
                className="w-9 h-9 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-full flex items-center justify-center text-slate-400 transition-all shrink-0 active:scale-90"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6">
              <div className="relative w-full h-[180px] bg-black/40 rounded-[1.5rem] overflow-hidden border border-white/5 shadow-inner">
                <iframe
                  key={activeEpisode.fileId}
                  src={`https://drive.google.com/file/d/${activeEpisode.fileId}/preview`}
                  className="absolute inset-0 w-full h-full border-0"
                  allow="autoplay"
                  title="REO Player"
                />
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <a
                  href={`https://drive.google.com/file/d/${activeEpisode.fileId}/view`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-amber-500 hover:bg-amber-400 text-black rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 italic"
                >
                  <Download className="w-4 h-4" />
                  Baixar do Google Drive
                </a>

                <button
                  onClick={() => copyToClipboard(`https://drive.google.com/file/d/${activeEpisode.fileId}/view`)}
                  className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5 active:scale-95 ${
                    copied ? 'bg-green-500 text-black border-transparent' : 'bg-white/5 hover:bg-white/10 text-white'
                  }`}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copiado!' : 'Copiar Link'}
                </button>
              </div>
            </div>

            <div className="px-8 pb-6 text-center flex flex-col gap-1.5">
              <p className="text-[8px] text-slate-700 font-black uppercase tracking-widest opacity-30 italic">
                Rádio Escolar Online • S. Bento de Vizela
              </p>
              <p className="text-[7px] text-slate-800 font-bold uppercase tracking-[0.15em] opacity-40 italic">
                Coordenação e Desenvolvimento: Miguel Araújo
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Archive;
