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

/* ---------------- CSV HELPERS ---------------- */

const normalize = (str: string) =>
  (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');

const extractUrlFromCell = (value: string): string => {
  if (!value) return '';
  const v = value.trim();

  const m1 = v.match(/HYPERLINK\(\s*"([^"]+)"/i);
  if (m1?.[1]) return m1[1];

  const m2 = v.match(/HYPERLINK\(\s*'([^']+)'/i);
  if (m2?.[1]) return m2[1];

  return v;
};

const extractDriveFileId = (url: string): string => {
  if (!url) return '';
  const clean = extractUrlFromCell(url);

  const patterns = [
    /\/d\/([a-zA-Z0-9_-]+)/,
    /[?&]id=([a-zA-Z0-9_-]+)/,
    /thumbnail\?id=([a-zA-Z0-9_-]+)/,
  ];

  for (const p of patterns) {
    const m = clean.match(p);
    if (m?.[1]) return m[1];
  }
  return '';
};

const driveThumb = (id: string, size = 1200) =>
  `https://drive.google.com/thumbnail?id=${id}&sz=w${size}`;

/* ---------------- COMPONENT ---------------- */

const Archive: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [archiveTree, setArchiveTree] = useState<Record<string, Record<string, Episode[]>>>({});
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [activeEpisode, setActiveEpisode] = useState<Episode | null>(null);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  /* ---------------- LOAD CSV ---------------- */

  useEffect(() => {
    setLoading(true);
    fetch(`${CSV_URL}&t=${Date.now()}`, { cache: 'no-store' })
      .then(async (res) => {
        const text = await res.text();
        if (/<!doctype html>|<html/i.test(text)) throw new Error('HTML');
        return text;
      })
      .then((csv) => {
        const clean = csv.replace(/\r/g, '');
        const lines = clean.split('\n').filter(Boolean);

        let headerIndex = 0;
        if (lines[0].toLowerCase().startsWith('sep=')) headerIndex = 1;

        const headerLine = lines[headerIndex];
        const delimiter =
          (headerLine.match(/;/g)?.length || 0) >
          (headerLine.match(/,/g)?.length || 0)
            ? ';'
            : ',';

        const split = (line: string) => {
          const out: string[] = [];
          let cur = '';
          let q = false;

          for (const c of line) {
            if (c === '"') q = !q;
            else if (c === delimiter && !q) {
              out.push(cur);
              cur = '';
            } else cur += c;
          }
          out.push(cur);
          return out.map((v) => v.replace(/^"|"$/g, '').trim());
        };

        const headers = split(lines[headerIndex]).map(normalize);
        const idx = {
          year: headers.findIndex((h) => h.includes('year')),
          program: headers.findIndex((h) => h.includes('program')),
          title: headers.findIndex((h) => h.includes('title')),
          audio: headers.findIndex((h) => h.includes('audio')),
          cover: headers.findIndex((h) => h.includes('cover')),
        };

        const tree: Record<string, Record<string, Episode[]>> = {};

        for (let i = headerIndex + 1; i < lines.length; i++) {
          const row = split(lines[i]);
          if (!row.length) continue;

          const year = row[idx.year] || 'Geral';
          const program = row[idx.program] || 'Geral';

          tree[year] ??= {};
          tree[year][program] ??= [];

          tree[year][program].push({
            id: `ep-${i}-${year}-${program}`,
            title: row[idx.title] || `Emissão ${i}`,
            year,
            program,
            fileId: extractDriveFileId(row[idx.audio]),
            coverId: extractDriveFileId(row[idx.cover]),
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

  /* ---------------- NAV ITEMS ---------------- */

  const items: NavItem[] = (() => {
    if (currentPath.length === 0)
      return Object.keys(archiveTree).map((y) => ({ type: 'folder', name: y, id: y }));

    if (currentPath.length === 1) {
      const year = currentPath[0];
      return Object.keys(archiveTree[year] || {}).map((p) => {
        const coverId =
          archiveTree[year][p]?.find((ep) => ep.coverId)?.coverId || '';
        return { type: 'folder', name: p, id: p, coverId };
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
      ? archiveTree[currentPath[0]]?.[currentPath[1]]?.find((e) => e.coverId)
          ?.coverId || ''
      : '';

  /* ---------------- RENDER ---------------- */

  return (
    <div className="pb-24 px-4 max-w-3xl mx-auto">
      <Link to="/" className="text-amber-500 text-xs font-black uppercase">
        <ArrowLeft className="inline w-4 h-4 mr-2" /> Início
      </Link>

      {/* BIG PROGRAM COVER */}
      {currentPath.length === 2 && programCoverId && (
        <div
          className="my-6 h-72 rounded-3xl overflow-hidden shadow-2xl"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,.4), rgba(0,0,0,.9)), url(${driveThumb(
              programCoverId,
              2000
            )})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="h-full flex items-end justify-center pb-6">
            <h2 className="text-3xl font-black text-white">{currentPath[1]}</h2>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-24 text-center text-slate-500">
          <Loader2 className="w-10 h-10 animate-spin mx-auto text-amber-500" />
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() =>
                item.type === 'folder'
                  ? setCurrentPath([...currentPath, item.id])
                  : setActiveEpisode(item.data!)
              }
              className="flex items-center justify-between p-4 bg-white/5 rounded-2xl cursor-pointer"
            >
              <div className="flex items-center gap-4">
                {item.type === 'folder' ? (
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-800">
                    {item.coverId ? (
                      <img
                        src={driveThumb(item.coverId, 500)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Music className="w-full h-full p-4 text-amber-500/40" />
                    )}
                  </div>
                ) : (
                  <FileAudio className="w-6 h-6 text-blue-400" />
                )}
                <span className="text-white font-bold truncate">{item.name}</span>
              </div>
              {item.type === 'folder' ? <ChevronRight /> : <Play />}
            </div>
          ))}
        </div>
      )}

      {/* PLAYER */}
      {activeEpisode && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4">
          <div className="bg-[#0f0f18] p-6 rounded-3xl w-full max-w-lg">
            <h3 className="text-white font-black">{activeEpisode.title}</h3>
            <iframe
              src={`https://drive.google.com/file/d/${activeEpisode.fileId}/preview`}
              className="w-full h-48 mt-4 rounded-xl"
              allow="autoplay"
            />
            <button onClick={() => setActiveEpisode(null)} className="mt-4 text-red-400">
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Archive;
