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

const driveThumb = (id: string, size = 1200) =>
  `https://drive.google.com/thumbnail?id=${id}&sz=w${size}`;

const Archive: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [archiveTree, setArchiveTree] = useState<Record<string, Record<string, Episode[]>>>({});
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [activeEpisode, setActiveEpisode] = useState<Episode | null>(null);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const normalize = (str: string) =>
    str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');

  const extractUrlFromCell = (value: string): string => {
    if (!value) return '';
    const m1 = value.match(/HYPERLINK\(\s*"([^"]+)"/i);
    const m2 = value.match(/HYPERLINK\(\s*'([^']+)'/i);
    return m1?.[1] || m2?.[1] || value;
  };

  const extractDriveFileId = (url: string): string => {
    if (!url) return '';
    const clean = extractUrlFromCell(url);
    const match = clean.match(/\/d\/([a-zA-Z0-9_-]+)|id=([a-zA-Z0-9_-]+)/);
    return match?.[1] || match?.[2] || '';
  };

  useEffect(() => {
    fetch(`${CSV_URL}&t=${Date.now()}`, { cache: 'no-store' })
      .then((res) => res.text())
      .then((text) => {
        const lines = text.split('\n').filter(Boolean);
        const headers = lines[0].split(',').map(normalize);

        const idx = {
          year: headers.findIndex((h) => h.includes('year')),
          program: headers.findIndex((h) => h.includes('program')),
          title: headers.findIndex((h) => h.includes('title')),
          audioId: headers.findIndex((h) => h.includes('audio')),
          coverId: headers.findIndex((h) => h.includes('cover')),
        };

        const tree: Record<string, Record<string, Episode[]>> = {};

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',');
          const year = cols[idx.year] || 'Geral';
          const program = cols[idx.program] || 'Geral';

          tree[year] ??= {};
          tree[year][program] ??= [];

          tree[year][program].push({
            id: `ep-${i}-${normalize(year)}-${normalize(program)}`,
            title: cols[idx.title] || `Emissão ${i}`,
            year,
            program,
            fileId: extractDriveFileId(cols[idx.audioId]),
            coverId: extractDriveFileId(cols[idx.coverId]),
          });
        }

        setArchiveTree(tree);
        setLoading(false);
      })
      .catch(() => {
        setPlaybackError('Erro ao carregar o arquivo.');
        setLoading(false);
      });
  }, []);

  const items: NavItem[] = (() => {
    if (currentPath.length === 0)
      return Object.keys(archiveTree).map((y) => ({
        type: 'folder',
        name: y,
        id: y,
      }));

    if (currentPath.length === 1) {
      const year = currentPath[0];
      return Object.keys(archiveTree[year] || {}).map((p) => {
        const firstWithCover = archiveTree[year][p]?.find((ep) => ep.coverId);
        return {
          type: 'folder',
          name: p,
          id: p,
          coverId: firstWithCover?.coverId || '',
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

  const programCoverId =
    currentPath.length === 2
      ? archiveTree[currentPath[0]]?.[currentPath[1]]?.find((ep) => ep.coverId)?.coverId || ''
      : '';

  return (
    <div className="pb-24 px-4 max-w-3xl mx-auto">
      <Link
        to="/"
        className="inline-flex items-center text-amber-500 hover:text-amber-400 mb-6 font-black uppercase tracking-widest text-[10px]"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Início
      </Link>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-500">
          <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
          <span className="text-xs font-black uppercase tracking-widest">A ler arquivo…</span>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() =>
                item.type === 'folder'
                  ? setCurrentPath([...currentPath, item.id])
                  : setActiveEpisode(item.data || null)
              }
              className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 cursor-pointer transition"
            >
              <div className="flex items-center gap-4">
                {item.type === 'folder' ? (
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-800">
                    {item.coverId ? (
                      <img
                        src={driveThumb(item.coverId, 500)}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music className="w-6 h-6 text-amber-500/40" />
                      </div>
                    )}
                  </div>
                ) : (
                  <FileAudio className="w-6 h-6 text-blue-400" />
                )}
                <span className="text-white font-bold truncate">{item.name}</span>
              </div>

              {item.type === 'folder' ? (
                <ChevronRight className="w-5 h-5 text-slate-500" />
              ) : (
                <Play className="w-6 h-6 text-amber-500" />
              )}
            </div>
          ))}
        </div>
      )}

      {currentPath.length === 2 && programCoverId && (
        <div
          className="mt-8 h-64 rounded-3xl bg-cover bg-center"
          style={{
            backgroundImage: `url(${driveThumb(programCoverId, 2000)})`,
          }}
        />
      )}

      {activeEpisode && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90" onClick={() => setActiveEpisode(null)} />
          <div className="bg-[#0f0f18] rounded-3xl p-6 w-full max-w-lg border border-white/10">
            <h3 className="text-white font-black mb-4">{activeEpisode.title}</h3>
            <iframe
              src={`https://drive.google.com/file/d/${activeEpisode.fileId}/preview`}
              className="w-full h-[180px] rounded-xl border border-white/5"
              allow="autoplay"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Archive;
