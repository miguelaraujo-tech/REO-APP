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

  const extractDriveFileId = (url: string): string | null => {
    const clean = extractUrlFromCell(url);
    const patterns = [
      /\/d\/([a-zA-Z0-9_-]+)/,
      /[?&]id=([a-zA-Z0-9_-]+)/,
      /thumbnail\?id=([a-zA-Z0-9_-]+)/,
    ];
    for (const p of patterns) {
      const m = clean.match(p);
      if (m) return m[1];
    }
    return null;
  };

  const driveThumb = (id: string, size = 1200) =>
    `https://drive.google.com/thumbnail?id=${id}&sz=w${size}`;

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setActiveEpisode(null);
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, []);

  const loadData = () => {
    setLoading(true);
    setPlaybackError(null);

    fetch(`${CSV_URL}&t=${Date.now()}`, { cache: 'no-store' })
      .then((res) => res.text())
      .then((text) => {
        const lines = text.split('\n').filter(Boolean);
        const headers = lines[0].split(',').map(normalize);

        const findIdx = (keys: string[]) =>
          headers.findIndex((h) => keys.some((k) => h.includes(normalize(k))));

        const idxs = {
          year: findIdx(['year']),
          program: findIdx(['program']),
          title: findIdx(['title']),
          audioId: findIdx(['audiofileid']),
          coverId: findIdx(['coverfileid']),
        };

        const nothingMatched =
          idxs.year === -1 &&
          idxs.program === -1 &&
          idxs.title === -1 &&
          idxs.audioId === -1 &&
          idxs.coverId === -1;

        if (nothingMatched) {
          setPlaybackError('Cabeçalhos CSV não reconhecidos.');
          setLoading(false);
          return;
        }

        const tree: Record<string, Record<string, Episode[]>> = {};

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',');
          const year = cols[idxs.year] || 'Geral';
          const program = cols[idxs.program] || 'Geral';
          const title = cols[idxs.title] || `Emissão ${i}`;
          const fileId = extractDriveFileId(cols[idxs.audioId]) || '';
          const coverId = extractDriveFileId(cols[idxs.coverId]) || '';

          tree[year] ??= {};
          tree[year][program] ??= [];
          tree[year][program].push({
            id: `${i}-${year}-${program}`,
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
      .catch(() => {
        setPlaybackError('Erro ao carregar CSV.');
        setLoading(false);
      });
  };

  useEffect(loadData, []);

  const items: NavItem[] = (() => {
    if (!currentPath.length)
      return Object.keys(archiveTree).map((y) => ({ type: 'folder', name: y, id: y }));

    if (currentPath.length === 1)
      return Object.keys(archiveTree[currentPath[0]] || {}).map((p) => ({
        type: 'folder',
        name: p,
        id: p,
      }));

    return (archiveTree[currentPath[0]]?.[currentPath[1]] || []).map((ep) => ({
      type: 'file',
      name: ep.title,
      id: ep.id,
      data: ep,
    }));
  })();

  return (
    <div className="pb-24">
      {/* --- UI unchanged --- */}
      {activeEpisode && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/90"
            onClick={() => setActiveEpisode(null)}
          />
        </div>
      )}
    </div>
  );
};

export default Archive;
