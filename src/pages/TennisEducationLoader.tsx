import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import './TennisEducationLoader.css';

const COVER_URL = '/tennis-loading.webp';

function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      if (typeof image.decode === 'function') {
        void image.decode().catch(() => {}).then(() => resolve());
      } else {
        resolve();
      }
    };
    // Uma imagem indisponível não impede o acesso ao jogo.
    image.onerror = () => resolve();
    image.src = src;
  });
}

const TennisEducationLoader: React.FC = () => {
  const [Game, setGame] = useState<React.ComponentType | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(false);
  const [coverFailed, setCoverFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    let failed = false;
    let completed = 0;
    let readyTimer: ReturnType<typeof setTimeout> | undefined;
    const startedAt = performance.now();

    setProgress(0);
    setError(false);
    setCoverFailed(false);

    const advance = (weight: number) => {
      if (!active || failed) return;
      completed += weight;
      setProgress(completed);
    };

    const timeout = setTimeout(() => {
      if (!active) return;
      failed = true;
      setError(true);
    }, 15000);

    void Promise.all([
      import('./TennisEducation').then((module) => {
        advance(55);
        return module;
      }),
      preloadImage(COVER_URL).then(() => advance(25)),
      preloadImage('/REO_logo_round_512x512.png').then(() => advance(10)),
      preloadImage('/tennis-education.png').then(() => advance(10)),
    ]).then(([module]) => {
      if (!active || failed) return;
      clearTimeout(timeout);
      // Pequena apresentação da capa e tempo para a barra terminar a transição.
      const delay = Math.max(320, 1200 - (performance.now() - startedAt));
      readyTimer = setTimeout(() => {
        if (active) setGame(() => module.default);
      }, delay);
    }).catch(() => {
      if (!active) return;
      failed = true;
      clearTimeout(timeout);
      setError(true);
    });

    return () => {
      active = false;
      clearTimeout(timeout);
      if (readyTimer !== undefined) clearTimeout(readyTimer);
    };
  }, [attempt]);

  if (Game) return <Game />;

  return (
    <section className="reo-tennis-loader" aria-busy={!error}>
      <Link to="/" className="reo-tennis-loader-back">
        <ArrowLeft size={17} aria-hidden="true" /> Voltar à REO
      </Link>

      <div className="reo-tennis-loader-card">
        {coverFailed ? (
          <div className="reo-tennis-loader-fallback">
            <span aria-hidden="true">🎾 ♻️</span>
            <h1>Um set para o planeta!</h1>
            <p>REO × Tennis Education</p>
          </div>
        ) : (
          <img
            className="reo-tennis-loader-cover"
            src={COVER_URL}
            alt="Um set para o planeta! — REO e Tennis Education"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            onError={() => setCoverFailed(true)}
          />
        )}

        <div className="reo-tennis-loader-info">
          <div className="reo-tennis-loader-label">
            <p aria-live="polite">
              {error ? 'Não foi possível carregar o jogo.' :
                progress === 100 ? 'Tudo pronto!' : 'A preparar o jogo…'}
            </p>
            <strong>{progress}%</strong>
          </div>

          <div
            className="reo-tennis-loader-track"
            role="progressbar"
            aria-label="Carregamento do jogo"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <div style={{ width: `${progress}%` }} />
          </div>

          {error && (
            <button
              type="button"
              className="reo-tennis-loader-retry"
              onClick={() => setAttempt((current) => current + 1)}
            >
              <RotateCcw size={16} aria-hidden="true" /> Tentar novamente
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default TennisEducationLoader;
