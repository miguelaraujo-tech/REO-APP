const loadData = () => {
  setLoading(true);
  setPlaybackError(null);

  fetch(`${CSV_URL}&t=${Date.now()}&nocache=${Math.random()}`, { cache: 'no-store' })
    .then(async (res) => {
      const text = await res.text();

      // ✅ Detect "not a CSV" responses (Google HTML / permission pages)
      const looksLikeHtml =
        /<!doctype html>/i.test(text) ||
        /<html/i.test(text) ||
        /accounts\.google\.com/i.test(text) ||
        /ServiceLogin/i.test(text);

      if (!res.ok || looksLikeHtml) {
        throw new Error(
          'CSV_NOT_AVAILABLE'
        );
      }

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

      // Handle optional "sep=;"
      let first = lines[0].trim();
      if (first.toLowerCase().startsWith('sep=')) {
        headerIndex = 1;
      }

      const headerLine = lines[headerIndex] ?? '';

      // ✅ Robust delimiter detection: pick the one that appears most in the header
      const commaCount = (headerLine.match(/,/g) || []).length;
      const semiCount = (headerLine.match(/;/g) || []).length;
      const delimiter = semiCount > commaCount ? ';' : ',';

      const splitLine = (line: string, d: string) => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
          const ch = line[i];
          if (ch === '"') inQuotes = !inQuotes;
          else if (ch === d && !inQuotes) {
            result.push(current.trim());
            current = '';
          } else current += ch;
        }
        result.push(current.trim());

        return result.map((v) => v.replace(/^"|"$/g, '').trim());
      };

      const headerRow = splitLine(lines[headerIndex], delimiter);
      const headers = headerRow.map(normalize);

      const findIdx = (needles: string[]) =>
        headers.findIndex((h) => needles.some((n) => h.includes(normalize(n))));

      const idxs = {
        year: findIdx(['year', 'ano']),
        program: findIdx(['program', 'programa']),
        title: findIdx(['filename', 'file', 'name', 'nome', 'title', 'titulo']),
        audio: findIdx(['playlink', 'playurl', 'audiourl', 'linkaudio', 'mp3', 'audio', 'url', 'link']),
        cover: findIdx(['cover', 'coverlink', 'capa', 'coverimage', 'coverid', 'imagemcapa', 'capaurl', 'linkcover', 'imagem', 'foto']),
      };

      // ✅ If we didn't find ANY useful columns, fail loudly (don’t show empty)
      const nothingMatched =
        idxs.year === -1 && idxs.program === -1 && idxs.title === -1 && idxs.audio === -1 && idxs.cover === -1;

      if (nothingMatched) {
        setArchiveTree({});
        setPlaybackError('Não consegui identificar as colunas do CSV. Confirma os cabeçalhos (Ano/Programa/Título/Link).');
        setLoading(false);
        return;
      }

      const tree: Record<string, Record<string, Episode[]>> = {};

      for (let i = headerIndex + 1; i < lines.length; i++) {
        const row = splitLine(lines[i], delimiter);

        // skip empty / non-data rows
        if (row.length <= 1) continue;

        const year = (idxs.year !== -1 ? row[idxs.year] : '') || 'Geral';
        const program = (idxs.program !== -1 ? row[idxs.program] : '') || 'Geral';
        const title = (idxs.title !== -1 ? row[idxs.title] : '') || `Emissão ${i}`;

        const playLink = (idxs.audio !== -1 ? row[idxs.audio] : '')?.trim?.() ?? '';
        const fileId = extractDriveFileId(playLink) || '';

        const coverLink = (idxs.cover !== -1 ? row[idxs.cover] : '')?.trim?.() ?? '';
        const coverId = extractDriveFileId(coverLink) || '';

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

      // ✅ Clear actionable message
      setPlaybackError(
        'Não foi possível ler o CSV do Google Sheets. Confirma que está “Publicado na Web” como CSV e acessível sem login.'
      );

      setArchiveTree({});
      setLoading(false);
    });
};
