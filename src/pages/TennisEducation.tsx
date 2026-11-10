
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Gamepad2, Pause, Play, RotateCcw, Trophy } from 'lucide-react';
import Logo from '../Logo';
import './TennisEducation.css';

type BinId = 'azul' | 'amarelo' | 'verde' | 'preto';
type GamePhase = 'intro' | 'playing' | 'paused' | 'won' | 'lost' | 'timeup';

type Waste = {
  name: string;
  symbol: string;
  bin: BinId;
};

type Shot = {
  originX: number;
  originY: number;
  middleX: number;
  middleY: number;
  endX: number;
  endY: number;
  symbol: string;
  bin: BinId;
  correct: boolean;
};

const START_SCORE = 60;
const MAX_ERRORS = 1; // O segundo erro termina o jogo.
const WIN_SCORE = 200;
const GAME_DURATION_MS = 30_000;
const SHOT_DURATION = 430;

// Separação adaptada à realidade da escola: restos alimentares vão para o indiferenciado.
const WASTE: Waste[] = [
  { name: 'Folha de papel limpa', symbol: '📄', bin: 'azul' },
  { name: 'Caixa de cartão', symbol: '📦', bin: 'azul' },
  { name: 'Jornal velho', symbol: '📰', bin: 'azul' },
  { name: 'Envelope de papel', symbol: '✉️', bin: 'azul' },
  { name: 'Cartolina limpa', symbol: '📃', bin: 'azul' },
  { name: 'Garrafa de água de plástico', symbol: '🧴', bin: 'amarelo' },
  { name: 'Lata de refrigerante', symbol: '🥫', bin: 'amarelo' },
  { name: 'Pacote vazio de bolachas', symbol: '🍪', bin: 'amarelo' },
  { name: 'Embalagem de batatas fritas', symbol: '🍟', bin: 'amarelo' },
  { name: 'Pacote de sumo vazio', symbol: '🧃', bin: 'amarelo' },
  { name: 'Saco de plástico', symbol: '🛍️', bin: 'amarelo' },
  { name: 'Frasco de vidro', symbol: '🫙', bin: 'verde' },
  { name: 'Garrafa de vidro', symbol: '🍾', bin: 'verde' },
  { name: 'Frasco de compota vazio', symbol: '🫙', bin: 'verde' },
  { name: 'Casca de banana', symbol: '🍌', bin: 'preto' },
  { name: 'Casca de laranja', symbol: '🍊', bin: 'preto' },
  { name: 'Restos de maçã', symbol: '🍎', bin: 'preto' },
  { name: 'Lenço de papel usado', symbol: '🧻', bin: 'preto' },
  { name: 'Guardanapo sujo', symbol: '🧻', bin: 'preto' },
  { name: 'Lápis partido', symbol: '✏️', bin: 'preto' },
];

const BINS: { id: BinId; label: string; subtitle: string; key: string }[] = [
  { id: 'azul', label: 'Papel e cartão', subtitle: '+10 pontos', key: '1' },
  { id: 'amarelo', label: 'Plástico e metal', subtitle: '+10 pontos', key: '2' },
  { id: 'verde', label: 'Vidro', subtitle: '+10 pontos', key: '3' },
  { id: 'preto', label: 'Indiferenciado', subtitle: '+5 pontos', key: '4' },
];

function nextWaste(previous?: Waste): Waste {
  // Escolher categorias de modo equilibrado, sem repetir a pergunta consecutiva.
  const categories: BinId[] = ['azul', 'amarelo', 'verde', 'preto'];
  const category = categories[Math.floor(Math.random() * categories.length)];
  const options = WASTE.filter((waste) => waste.bin === category && waste !== previous);
  const alternatives = options.length ? options : WASTE.filter((waste) => waste !== previous);
  return alternatives[Math.floor(Math.random() * alternatives.length)];
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

const TennisEducation: React.FC = () => {
  const [phase, setPhase] = useState<GamePhase>('intro');
  const [score, setScore] = useState(START_SCORE);
  const [remainingMs, setRemainingMs] = useState(GAME_DURATION_MS);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [errors, setErrors] = useState(0);
  const [waste, setWaste] = useState<Waste>(() => nextWaste());
  const [shot, setShot] = useState<Shot | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; points: number; correct: boolean } | null>(null);

  const courtRef = useRef<HTMLDivElement>(null);
  const wasteRef = useRef<HTMLDivElement>(null);
  const binRefs = useRef<Partial<Record<BinId, HTMLButtonElement | null>>>({});
  const busyRef = useRef(false);
  const remainingMsRef = useRef(GAME_DURATION_MS);
  const deadlineRef = useRef<number | null>(null);
  const shotTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (phase !== 'playing') return;

    // Contagem real de 30 segundos; quando pausado, o tempo fica congelado.
    const deadline = Date.now() + remainingMsRef.current;
    deadlineRef.current = deadline;

    const updateTimer = () => {
      const timeLeft = Math.max(0, deadline - Date.now());
      remainingMsRef.current = timeLeft;
      setRemainingMs(timeLeft);
      // Se já foi lançada uma raquetada, aguardamos pelo resultado antes de terminar.
      if (timeLeft === 0 && !busyRef.current) {
        setPhase((current) => current === 'playing' ? 'timeup' : current);
      }
    };

    const interval = window.setInterval(updateTimer, 100);
    return () => {
      window.clearInterval(interval);
      remainingMsRef.current = Math.max(0, deadline - Date.now());
      deadlineRef.current = null;
    };
  }, [phase]);

  useEffect(() => {
    return () => {
      if (shotTimerRef.current !== null) clearTimeout(shotTimerRef.current);
      if (feedbackTimerRef.current !== null) clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  const startGame = useCallback(() => {
    if (shotTimerRef.current !== null) clearTimeout(shotTimerRef.current);
    if (feedbackTimerRef.current !== null) clearTimeout(feedbackTimerRef.current);
    busyRef.current = false;
    setScore(START_SCORE);
    remainingMsRef.current = GAME_DURATION_MS;
    deadlineRef.current = null;
    setRemainingMs(GAME_DURATION_MS);
    setCorrectAnswers(0);
    setErrors(0);
    setWaste(nextWaste());
    setShot(null);
    setFeedback(null);
    setPhase('playing');
  }, []);

  const chooseBin = useCallback((chosen: BinId) => {
    if (phase !== 'playing' || busyRef.current || remainingMsRef.current <= 0 ||
      (deadlineRef.current !== null && Date.now() >= deadlineRef.current)) return;
    const court = courtRef.current;
    const source = wasteRef.current;
    const destination = binRefs.current[chosen];
    if (!court || !source || !destination) return;

    busyRef.current = true;
    const courtBox = court.getBoundingClientRect();
    const sourceBox = source.getBoundingClientRect();
    const targetBox = destination.getBoundingClientRect();
    const originX = sourceBox.left + sourceBox.width / 2 - courtBox.left;
    const originY = sourceBox.top + sourceBox.height / 2 - courtBox.top;
    const endX = targetBox.left + targetBox.width / 2 - courtBox.left - originX;
    const endY = targetBox.top + targetBox.height / 2 - courtBox.top - originY;
    const correct = waste.bin === chosen;
    const points = correct ? (chosen === 'preto' ? 5 : 10) : -20;

    setShot({
      originX,
      originY,
      middleX: endX / 2,
      middleY: endY / 2 - 85,
      endX,
      endY,
      symbol: waste.symbol,
      bin: chosen,
      correct,
    });

    shotTimerRef.current = setTimeout(() => {
      shotTimerRef.current = null;
      const newScore = Math.max(0, score + points);
      const newErrors = errors + (correct ? 0 : 1);
      setScore(newScore);
      if (!correct) setErrors(newErrors);
      setShot(null);
      setFeedback({
        message: correct ? 'Muito bem! Resíduo no sítio certo.' : 'Ops! Esse resíduo não é para aqui.',
        points,
        correct,
      });
      if (feedbackTimerRef.current !== null) clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = setTimeout(() => setFeedback(null), 1400);
      if (correct) setCorrectAnswers((value) => value + 1);

      if (newScore >= WIN_SCORE) {
        setPhase('won');
      } else if (newScore <= 0 || newErrors > MAX_ERRORS) {
        setPhase('lost');
      } else if (deadlineRef.current !== null && Date.now() >= deadlineRef.current) {
        setPhase('timeup');
      } else {
        setWaste(nextWaste(waste));
      }
      busyRef.current = false;
    }, SHOT_DURATION);
  }, [phase, score, waste, errors]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.repeat) return;
      if (event.key === 'Escape' && !busyRef.current) {
        setPhase((current) => current === 'playing' ? 'paused' : current === 'paused' ? 'playing' : current);
        return;
      }
      const bin = BINS.find((entry) => entry.key === event.key);
      if (bin) chooseBin(bin.id);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [chooseBin]);

  const shotStyle = shot ? ({
    left: `${shot.originX}px`,
    top: `${shot.originY}px`,
    '--mid-x': `${shot.middleX}px`,
    '--mid-y': `${shot.middleY}px`,
    '--end-x': `${shot.endX}px`,
    '--end-y': `${shot.endY}px`,
  } as React.CSSProperties) : undefined;

  const percent = Math.min(100, Math.max(0, ((score - START_SCORE) / (WIN_SCORE - START_SCORE)) * 100));

  return (
    <section className="reo-tennis-page">
      <Link to="/" className="reo-tennis-back">
        <ArrowLeft size={17} aria-hidden="true" /> Voltar à REO
      </Link>

      <div className="reo-tennis-title">
        <div className="reo-tennis-partners" aria-label="Parceria REO e Tennis Education">
          <Logo className="reo-tennis-partner-logo" />
          <span aria-hidden="true">×</span>
          <img src="/tennis-education.png" className="reo-tennis-partner-logo" alt="Tennis Education" />
        </div>
        <p>REO × Tennis Education</p>
        <h1>Desafio da Reciclagem <span aria-hidden="true">♻️</span></h1>
        <span>Ajuda a nossa escola a reciclar melhor!</span>
      </div>

      <div className="reo-tennis-hud" aria-label="Informações do jogo">
        <div className="reo-tennis-stat"><span>Pontos</span><strong>{score}</strong></div>
        <div className="reo-tennis-stat"><span>Tempo restante</span><strong>{formatTime(Math.ceil(remainingMs / 1000))}</strong></div>
        <div className="reo-tennis-progress">
          <div className="reo-tennis-progress-row"><span>200 pontos · Erros: {errors}/{MAX_ERRORS}</span><strong>{Math.round(percent)}%</strong></div>
          <div className="reo-tennis-progress-track"><div style={{ width: `${percent}%` }} /></div>
        </div>
        <button
          type="button"
          className="reo-tennis-pause"
          onClick={() => setPhase(phase === 'paused' ? 'playing' : 'paused')}
          disabled={busyRef.current || (phase !== 'playing' && phase !== 'paused')}
          aria-label={phase === 'paused' ? 'Retomar jogo' : 'Pausar jogo'}
        >
          {phase === 'paused' ? <Play size={21} fill="currentColor" /> : <Pause size={21} fill="currentColor" />}
        </button>
      </div>

      <div className="reo-tennis-court" ref={courtRef}>
        <div className="reo-tennis-sky" aria-hidden="true" />
        <div className="reo-tennis-school" aria-hidden="true" />
        <div className="reo-tennis-ground" aria-hidden="true" />
        <div className="reo-tennis-tree tree-left" aria-hidden="true">🌳</div>
        <div className="reo-tennis-tree tree-right" aria-hidden="true">🌳</div>

        <div className={`reo-tennis-mascot ${shot ? 'is-serving' : ''}`} aria-hidden="true">
          <div className="reo-tennis-mascot-arm left-arm" />
          <div className="reo-tennis-mascot-arm right-arm" />
          <div className="reo-tennis-mascot-leg left-leg" />
          <div className="reo-tennis-mascot-leg right-leg" />
          <Logo className="reo-tennis-cookie" />
          <div className="reo-tennis-racket">
            <svg viewBox="0 0 96 162" xmlns="http://www.w3.org/2000/svg">
              <g transform="rotate(22 46 76)">
                <rect x="42" y="96" width="13" height="63" rx="5" fill="#9b6327" stroke="#252018" strokeWidth="4" />
                <rect x="41" y="129" width="15" height="29" rx="4" fill="#222" />
                <ellipse cx="48" cy="53" rx="37" ry="51" fill="#214c25" stroke="#f5b523" strokeWidth="7" />
                <ellipse cx="48" cy="53" rx="31" ry="44" fill="#d7f6d3" stroke="#162c20" strokeWidth="3" />
                {Array.from({ length: 6 }, (_, i) => <line key={`v-${i}`} x1={26 + i * 9} y1="14" x2={26 + i * 9} y2="92" stroke="#6c8f72" strokeWidth="1.7" />)}
                {Array.from({ length: 8 }, (_, i) => <line key={`h-${i}`} x1="17" y1={18 + i * 10} x2="79" y2={18 + i * 10} stroke="#6c8f72" strokeWidth="1.7" />)}
              </g>
            </svg>
          </div>
        </div>

        <div className={`reo-tennis-item ${shot ? 'is-hidden' : ''}`} ref={wasteRef} aria-live="polite">
          <span className="reo-tennis-item-symbol" aria-hidden="true">{waste.symbol}</span>
          <strong>{waste.name}</strong>
          <small>Onde colocas este resíduo?</small>
        </div>

        {shot && (
          <div className="reo-tennis-shot" style={shotStyle} aria-hidden="true">
            <span className="reo-tennis-shot-symbol">{shot.symbol}</span>
          </div>
        )}

        <div className="reo-tennis-bins" role="group" aria-label="Escolhe o recipiente correto">
          {BINS.map((bin) => (
            <button
              key={bin.id}
              ref={(element) => { binRefs.current[bin.id] = element; }}
              type="button"
              className={`reo-tennis-bin bin-${bin.id}${shot?.bin === bin.id ? (shot.correct ? ' is-correct' : ' is-wrong') : ''}`}
              onClick={() => chooseBin(bin.id)}
              disabled={phase !== 'playing' || shot !== null}
              aria-label={`${bin.label}. Tecla ${bin.key}. ${bin.subtitle} se estiver correto.`}
            >
              <span className="reo-tennis-bin-body">
                <span className="reo-tennis-bin-icon" aria-hidden="true">{bin.id === 'preto' ? '🚮' : '♻'}</span>
                <span className="reo-tennis-bin-label">{bin.label}</span>
              </span>
              <span className="reo-tennis-bin-key">{bin.key}</span>
            </button>
          ))}
        </div>

        {feedback && phase === 'playing' && (
          <div className={`reo-tennis-feedback ${feedback.correct ? 'good' : 'bad'}`} role="status">
            <strong>{feedback.points > 0 ? '+' : ''}{feedback.points}</strong>
            <span>{feedback.message}</span>
          </div>
        )}

        {phase !== 'playing' && (
          <div className="reo-tennis-overlay">
            {phase === 'intro' && (
              <div className="reo-tennis-modal">
                <Gamepad2 size={38} className="reo-tennis-modal-icon" aria-hidden="true" />
                <h2>Preparado para reciclar?</h2>
                <p>Clica na eco-bag ou no caixote certo. A Bolacha da REO dá a raquetada!</p>
                <div className="reo-tennis-scoring">
                  <span>Azul, amarelo, verde <b>+10</b></span>
                  <span>Indiferenciado <b>+5</b></span>
                  <span>Recipiente errado <b>−20</b></span>
                </div>
                <p className="reo-tennis-fineprint">Tens 30 segundos! Começas com 60 pontos. Podes errar uma vez; ao segundo erro, perdes. Chega aos 200 pontos antes de o tempo terminar!</p>
                <button className="reo-tennis-primary" type="button" onClick={startGame}><Play size={18} fill="currentColor" /> Começar missão</button>
              </div>
            )}
            {phase === 'paused' && (
              <div className="reo-tennis-modal">
                <Pause size={40} className="reo-tennis-modal-icon" aria-hidden="true" />
                <h2>Jogo em pausa</h2>
                <p>Quando estiveres pronto, continua a ajudar a REO e o Tennis Education.</p>
                <button className="reo-tennis-primary" type="button" onClick={() => setPhase('playing')}><Play size={18} fill="currentColor" /> Continuar</button>
              </div>
            )}
            {phase === 'won' && (
              <div className="reo-tennis-modal is-win" role="alertdialog" aria-labelledby="reo-tennis-won-title">
                <span className="reo-tennis-confetti" aria-hidden="true">🎉 🏆 🎾 ♻️ 🎉</span>
                <Trophy size={46} className="reo-tennis-modal-icon" aria-hidden="true" />
                <h2 id="reo-tennis-won-title">Parabéns!<br />És um ÁS da Reciclagem!</h2>
                <p>Alcançaste os 200 pontos! A REO e o Tennis Education agradecem a tua ajuda para tornar a nossa escola mais sustentável!</p>
                <button className="reo-tennis-primary" type="button" onClick={startGame}><RotateCcw size={18} /> Jogar novamente</button>
              </div>
            )}
            {phase === 'timeup' && (
              <div className="reo-tennis-modal is-loss" role="alertdialog" aria-labelledby="reo-tennis-timeup-title">
                <span aria-hidden="true" className="reo-tennis-sad">⏱️</span>
                <h2 id="reo-tennis-timeup-title">Tempo esgotado!</h2>
                <p>Terminaste com {score} pontos e {correctAnswers} respostas certas. Tenta chegar aos 200 pontos para seres um ÁS da Reciclagem!</p>
                <button className="reo-tennis-primary" type="button" onClick={startGame}><RotateCcw size={18} /> Tentar novamente</button>
              </div>
            )}
            {phase === 'lost' && (
              <div className="reo-tennis-modal is-loss" role="alertdialog" aria-labelledby="reo-tennis-lost-title">
                <span aria-hidden="true" className="reo-tennis-sad">😔</span>
                <h2 id="reo-tennis-lost-title">Fim de jogo!</h2>
                <p>A REO e o Tennis Education precisam da tua ajuda para reciclar melhor!</p>
                <p className="reo-tennis-fineprint">{errors > MAX_ERRORS ? 'Cometeste dois erros. Só é permitido um erro por partida.' : 'Chegaste aos 0 pontos.'} Podes tentar novamente.</p>
                <button className="reo-tennis-primary" type="button" onClick={startGame}><RotateCcw size={18} /> Tentar novamente</button>
              </div>
            )}
          </div>
        )}
      </div>

      <p className="reo-tennis-controls">🖱️ <strong>Rato:</strong> clica no recipiente · 📱 <strong>Telemóvel:</strong> toca · ⌨️ <strong>Teclado:</strong> 1, 2, 3 ou 4</p>
      <p className="reo-tennis-tip">Na nossa escola, as cascas de fruta e os restos de comida vão para o indiferenciado.</p>
    </section>
  );
};

export default React.memo(TennisEducation);
