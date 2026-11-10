
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Gamepad2, Pause, Play, RotateCcw, Trophy,
  Volume2, VolumeX, Star,
} from 'lucide-react';
import Logo from '../Logo';
import './TennisEducation.css';
import './TennisEducationKids.css';
import './TennisEducationEffects.css';
import './TennisEducationFlight.css';

type BinId = 'azul' | 'amarelo' | 'verde' | 'preto';
type GamePhase = 'intro' | 'playing' | 'paused' | 'won' | 'lost' | 'timeup';
type ArtKind = 'normal' | 'bolachas' | 'batatas' | 'sumo' | 'garrafa' | 'lata' | 'vidro' | 'iogurte' | 'lenco';

type Waste = {
  name: string;
  symbol: string;
  bin: BinId;
  reason: string;
  art?: ArtKind;
};

type Shot = {
  originX: number;
  originY: number;
  middleX: number;
  middleY: number;
  endX: number;
  endY: number;
  waste: Waste;
  bin: BinId;
  correct: boolean;
};

type Impact = {
  bin: BinId;
  correct: boolean;
  points: number;
  id: number;
};

type Feedback = {
  points: number;
  message: string;
  detail: string;
  correct: boolean;
  correctBin: BinId;
  achievement?: 100 | 130;
};

const START_SCORE = 60;
const WIN_SCORE = 200;
const GAME_DURATION_MS = 30_000;
const SHOT_DURATION = 330;
const CONTACT_MS = 1100;
const PASS_MS = 1950;
const MAX_ERRORS = 1;
const RECORD_KEY = 'reoTennisRecorde';

const BINS: {
  id: BinId;
  label: string;
  short: string;
  hint: string;
  key: string;
}[] = [
  { id: 'azul', label: 'Papel e cartão', short: 'ECOBAG azul', hint: 'Papel e cartão limpos', key: '1' },
  { id: 'amarelo', label: 'Plástico e metal', short: 'ECOBAG amarela', hint: 'Embalagens e pacotes de bebidas', key: '2' },
  { id: 'verde', label: 'Vidro', short: 'ECOBAG verde', hint: 'Garrafas e frascos de vidro', key: '3' },
  { id: 'preto', label: 'Indiferenciado', short: 'Caixote cinzento', hint: 'Restos de comida e papel sujo', key: '4' },
];

// Na escola, sem recolha de orgânicos, os restos alimentares
// vão para o indiferenciado.
// Garrafas e latas de bebidas abrangidas pela Volta não são
// usadas como exemplos do amarelo.
const WASTE: Waste[] = [
  { name: 'Folha de papel limpa', symbol: '📄', bin: 'azul', reason: 'Uma folha limpa é papel e pode ser reciclada na ECOBAG azul.' },
  { name: 'Caixa de cartão', symbol: '📦', bin: 'azul', reason: 'As caixas de cartão devem ser espalmadas e colocadas na ECOBAG azul.' },
  { name: 'Jornal antigo', symbol: '📰', bin: 'azul', reason: 'O jornal é feito de papel e pertence à ECOBAG azul.' },
  { name: 'Envelope de papel', symbol: '✉️', bin: 'azul', reason: 'Os envelopes de papel vão para a ECOBAG azul.' },
  { name: 'Cartolina limpa', symbol: '📃', bin: 'azul', reason: 'A cartolina limpa é reciclável com o papel, na ECOBAG azul.' },
  { name: 'Caixa de cereais de cartão', symbol: '📦', bin: 'azul', reason: 'As caixas de cartão vazias vão para a ECOBAG azul.' },
  { name: 'Caderno usado sem espiral', symbol: '📓', bin: 'azul', reason: 'As folhas e capas de papel do caderno vão para a ECOBAG azul.' },
  { name: 'Frasco de champô vazio', symbol: '🧴', bin: 'amarelo', art: 'garrafa', reason: 'O frasco de champô vazio é uma embalagem de plástico: vai para a ECOBAG amarela.' },
  { name: 'Lata de conserva vazia', symbol: '🥫', bin: 'amarelo', art: 'lata', reason: 'A lata de conserva vazia é uma embalagem de metal: vai para a ECOBAG amarela.' },
  { name: 'Pacote vazio de bolachas', symbol: '🍪', bin: 'amarelo', art: 'bolachas', reason: 'O pacote de plástico das bolachas é uma embalagem: vai para a ECOBAG amarela.' },
  { name: 'Embalagem de batatas fritas', symbol: '🍟', bin: 'amarelo', art: 'batatas', reason: 'O pacote de batatas fritas é uma embalagem e vai para a ECOBAG amarela.' },
  { name: 'Pacote de sumo vazio', symbol: '🧃', bin: 'amarelo', art: 'sumo', reason: 'Os pacotes de bebidas vazios vão para a ECOBAG amarela, não para a azul.' },
  { name: 'Pacote de leite vazio', symbol: '🥛', bin: 'amarelo', art: 'sumo', reason: 'Os pacotes de leite e de sumo vão para a ECOBAG amarela.' },
  { name: 'Saco de plástico', symbol: '🛍️', bin: 'amarelo', reason: 'Os sacos de plástico usados como embalagem vão para a ECOBAG amarela.' },
  { name: 'Embalagem de iogurte vazia', symbol: '🥛', bin: 'amarelo', art: 'iogurte', reason: 'As embalagens de plástico de iogurte vão para a ECOBAG amarela.' },
  { name: 'Frasco de vidro vazio', symbol: '🫙', bin: 'verde', reason: 'Os frascos de vidro vazios pertencem à ECOBAG verde.' },
  { name: 'Garrafa de vidro vazia', symbol: '🍾', bin: 'verde', art: 'vidro', reason: 'As garrafas de vidro vazias vão para a ECOBAG verde.' },
  { name: 'Frasco de compota vazio', symbol: '🫙', bin: 'verde', reason: 'Os frascos de compota feitos de vidro vão para a ECOBAG verde.' },
  { name: 'Frasco de azeitonas vazio', symbol: '🫙', bin: 'verde', reason: 'As embalagens de vidro vão para a ECOBAG verde.' },
  { name: 'Casca de banana', symbol: '🍌', bin: 'preto', reason: 'Na nossa escola não há recolha de orgânicos: as cascas vão para o caixote cinzento.' },
  { name: 'Casca de laranja', symbol: '🍊', bin: 'preto', reason: 'As cascas de fruta vão para o caixote cinzento, pois não temos recolha de orgânicos.' },
  { name: 'Restos de maçã', symbol: '🍎', bin: 'preto', reason: 'Os restos de fruta vão para o caixote cinzento da escola.' },
  { name: 'Lenço de papel usado', symbol: '🧻', bin: 'preto', art: 'lenco', reason: 'Os lenços de papel usados não vão para a ECOBAG azul: vão para o indiferenciado.' },
  { name: 'Guardanapo sujo', symbol: '🧻', bin: 'preto', art: 'lenco', reason: 'Os guardanapos sujos pertencem ao caixote cinzento.' },
  { name: 'Lápis partido', symbol: '✏️', bin: 'preto', reason: 'Um lápis partido não é uma embalagem nem papel reciclável: vai para o indiferenciado.' },
  { name: 'Restos da sandes', symbol: '🥪', bin: 'preto', reason: 'Os restos de comida vão para o caixote cinzento da nossa escola.' },
];

function shuffleWaste(): Waste[] {
  const items = [...WASTE];

  for (let index = items.length - 1; index > 0; index--) {
    const random = Math.floor(Math.random() * (index + 1));
    [items[index], items[random]] = [items[random], items[index]];
  }

  return items;
}

function formatTime(milliseconds: number): string {
  return `00:${String(Math.ceil(milliseconds / 1000)).padStart(2, '0')}`;
}

function WastePicture({ waste }: { waste: Waste }) {
  if (waste.art === 'bolachas' || waste.art === 'batatas') {
    return (
      <span className={`reo-tennis-package package-${waste.art}`} aria-hidden="true">
        <span>{waste.art === 'bolachas' ? 'BOLACHAS' : 'BATATAS'}</span>
        <span>{waste.art === 'bolachas' ? '🍪 🍪' : '🥔 🥔'}</span>
      </span>
    );
  }

  if (waste.art === 'sumo') {
    return (
      <span className="reo-tennis-juicebox" aria-hidden="true">
        <span className="reo-tennis-juicebox-straw" />
        <b>{waste.name.includes('leite') ? 'LEITE' : 'SUMO'}</b>
        <span>{waste.name.includes('leite') ? '🥛' : '🍊'}</span>
      </span>
    );
  }

  if (waste.art === 'lata') {
    return (
      <span className="reo-tennis-can" aria-hidden="true">
        <span>CONSERVA</span>
        <span>🥫</span>
      </span>
    );
  }

  if (waste.art === 'iogurte') {
    return (
      <span className="reo-tennis-yogurt" aria-hidden="true">
        <span>IOGURTE</span>
        <span>🥄</span>
      </span>
    );
  }

  if (waste.art === 'vidro') {
    return (
      <svg
        className="reo-tennis-glass-bottle-art"
        viewBox="0 0 80 134"
        role="img"
        aria-label="Garrafa verde de vidro"
      >
        <defs>
          <linearGradient id="reo-vidro" x1="0" y1="0" x2="1" y2="0">
            <stop stopColor="#b6fbd5" />
            <stop offset="0.25" stopColor="#319b6a" />
            <stop offset="0.7" stopColor="#19754f" />
            <stop offset="1" stopColor="#0b5239" />
          </linearGradient>
        </defs>
        <rect x="32" y="4" width="16" height="15" rx="3" fill="#20543a" />
        <path
          d="M30 18h20v26c0 6 16 13 16 30v36c0 11-10 18-26 18s-26-7-26-18V74c0-17 16-24 16-30z"
          fill="url(#reo-vidro)"
          stroke="#0b5439"
          strokeWidth="3"
        />
        <path
          d="M27 55c-6 17-6 47 0 59"
          fill="none"
          stroke="#d1ffe7"
          strokeWidth="6"
          opacity=".75"
          strokeLinecap="round"
        />
        <rect
          x="18"
          y="79"
          width="44"
          height="22"
          rx="5"
          fill="#f4ead2"
          stroke="#fdf6e3"
          strokeWidth="2"
        />
        <text
          x="40"
          y="94"
          textAnchor="middle"
          fontSize="13"
          fontWeight="900"
          fill="#195a3c"
        >
          VIDRO
        </text>
      </svg>
    );
  }

  if (waste.art === 'lenco') {
    return (
      <span className="reo-tennis-tissue" aria-hidden="true">
        {waste.name.includes('Guardanapo') ? '✘' : '◌'}
      </span>
    );
  }

  if (waste.art === 'garrafa') {
    return (
      <svg
        className="reo-tennis-bottle"
        viewBox="0 0 66 96"
        role="img"
        aria-label="Frasco de champô de plástico"
      >
        <rect
          x="25" y="3" width="16" height="11" rx="2"
          fill="#1d85df" stroke="#15568f" strokeWidth="2"
        />
        <path
          d="M26 15h14v9c0 4 11 8 11 19v37c0 8-6 12-18 12s-18-4-18-12V43c0-11 11-15 11-19z"
          fill="#a8e5ff"
          stroke="#266b9e"
          strokeWidth="3"
        />
        <path
          d="M20 48h26M20 57h26M20 66h26M20 75h26"
          stroke="#60b7ec"
          strokeWidth="3"
        />
        <path
          d="M24 30c-3 5-4 14-4 21"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          opacity=".8"
        />
        <rect x="19" y="43" width="30" height="23" rx="5" fill="#f5f8ff" />
        <text
          x="34"
          y="58"
          fill="#19649e"
          fontSize="9"
          textAnchor="middle"
          fontWeight="900"
        >
          CHAMPÔ
        </text>
      </svg>
    );
  }

  return <span className="reo-tennis-emoji" aria-hidden="true">{waste.symbol}</span>;
}

function gradeFor(score: number) {
  if (score >= 200) {
    return {
      stars: 3,
      title: 'Super ÁS da Reciclagem!',
      detail: 'Missão cumprida! A escola está mais limpa!',
    };
  }

  if (score >= 130) {
    return {
      stars: 2,
      title: 'És um ÁS da Reciclagem!',
      detail: 'Já sabes usar muito bem as ECOBAGS!',
    };
  }

  if (score >= 100) {
    return {
      stars: 1,
      title: 'Bom trabalho!',
      detail: 'Estás a tornar a escola mais sustentável!',
    };
  }

  return {
    stars: 0,
    title: 'Boa tentativa!',
    detail: 'Cada jogada ajuda-te a aprender a reciclar.',
  };
}

const TennisEducation: React.FC = () => {
  const [phase, setPhase] = useState<GamePhase>('intro');
  const [score, setScore] = useState(START_SCORE);
  const [remainingMs, setRemainingMs] = useState(GAME_DURATION_MS);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [errors, setErrors] = useState(0);
  const [streak, setStreak] = useState(0);
  const [record, setRecord] = useState(START_SCORE);
  const [soundOn, setSoundOn] = useState(false);
  const [waste, setWaste] = useState<Waste>(WASTE[0]);
  const [incomingToken, setIncomingToken] = useState(0);
  const [aimedBin, setAimedBin] = useState<BinId | null>(null);
  const [inContact, setInContact] = useState(false);
  const [missMessage, setMissMessage] = useState(false);
  const [shot, setShot] = useState<Shot | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [lastMistake, setLastMistake] = useState<string | null>(null);
  const [impact, setImpact] = useState<Impact | null>(null);

  const courtRef = useRef<HTMLDivElement>(null);
  const wasteRef = useRef<HTMLDivElement>(null);
  const binRefs = useRef<Partial<Record<BinId, HTMLButtonElement | null>>>({});
  const wasteQueueRef = useRef<Waste[]>([]);
  const busyRef = useRef(false);
  const remainingMsRef = useRef(GAME_DURATION_MS);
  const flightElapsedRef = useRef(0);
  const chosenRef = useRef<BinId | null>(null);
  const selectionTimeRef = useRef(0);
  const lastFrameRef = useRef<number | null>(null);
  const fireShotRef = useRef<(bin: BinId) => void>(() => {});
  const shotTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const impactTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const impactCounterRef = useRef(0);
  const audioRef = useRef<AudioContext | null>(null);

  // Compactar a faixa institucional apenas na página do jogo.
  useEffect(() => {
    document.documentElement.classList.add('reo-tennis-compact-header');

    return () => {
      document.documentElement.classList.remove('reo-tennis-compact-header');
    };
  }, []);

  useEffect(() => {
    try {
      const stored = Number(localStorage.getItem(RECORD_KEY));

      if (Number.isFinite(stored) && stored > START_SCORE) {
        setRecord(stored);
      }
    } catch {
      // O jogo funciona mesmo sem armazenamento local.
    }

    return () => {
      if (shotTimerRef.current !== null) {
        clearTimeout(shotTimerRef.current);
      }

      if (feedbackTimerRef.current !== null) {
        clearTimeout(feedbackTimerRef.current);
      }

      if (impactTimerRef.current !== null) {
        clearTimeout(impactTimerRef.current);
      }

      if (audioRef.current) {
        void audioRef.current.close();
      }
    };
  }, []);

  const playTone = useCallback(
    (type: 'hit' | 'good' | 'bad' | 'star' | 'win') => {
      if (
        !soundOn ||
        typeof window === 'undefined' ||
        !window.AudioContext
      ) {
        return;
      }

      try {
        if (!audioRef.current) {
          audioRef.current = new window.AudioContext();
        }

        const context = audioRef.current;

        if (context.state === 'suspended') {
          void context.resume();
        }

        const notes: Record<typeof type, number[]> = {
          hit: [220],
          good: [510, 680],
          bad: [260, 180],
          star: [510, 650, 820],
          win: [520, 660, 790, 1040],
        };

        notes[type].forEach((frequency, index) => {
          const oscillator = context.createOscillator();
          const volume = context.createGain();
          const start = context.currentTime + index * 0.075;

          oscillator.type = type === 'hit' ? 'triangle' : 'sine';
          oscillator.frequency.setValueAtTime(frequency, start);

          volume.gain.setValueAtTime(0.001, start);
          volume.gain.exponentialRampToValueAtTime(0.055, start + 0.015);
          volume.gain.exponentialRampToValueAtTime(0.001, start + 0.12);

          oscillator.connect(volume);
          volume.connect(context.destination);
          oscillator.start(start);
          oscillator.stop(start + 0.13);
        });
      } catch {
        // O som é opcional e nunca deve bloquear o jogo.
      }
    },
    [soundOn]
  );

  useEffect(() => {
    if (
      phase !== 'won' &&
      phase !== 'lost' &&
      phase !== 'timeup'
    ) {
      return;
    }

    if (score > record) {
      setRecord(score);

      try {
        localStorage.setItem(RECORD_KEY, String(score));
      } catch {
        // Armazenamento opcional.
      }
    }
  }, [phase, score, record]);

  const getNextWaste = useCallback((): Waste => {
    if (wasteQueueRef.current.length === 0) {
      wasteQueueRef.current = shuffleWaste();
    }

    return wasteQueueRef.current.pop() ?? WASTE[0];
  }, []);

  const showWaste = useCallback((nextWaste: Waste) => {
    flightElapsedRef.current = 0;
    chosenRef.current = null;

    setAimedBin(null);
    setInContact(false);
    setWaste(nextWaste);
    setIncomingToken((number) => number + 1);
  }, []);

  const startGame = useCallback(() => {
    if (shotTimerRef.current !== null) {
      clearTimeout(shotTimerRef.current);
    }

    if (feedbackTimerRef.current !== null) {
      clearTimeout(feedbackTimerRef.current);
    }

    if (impactTimerRef.current !== null) {
      clearTimeout(impactTimerRef.current);
    }

    busyRef.current = false;
    wasteQueueRef.current = shuffleWaste();
    remainingMsRef.current = GAME_DURATION_MS;
    lastFrameRef.current = null;

    setRemainingMs(GAME_DURATION_MS);
    setScore(START_SCORE);
    setCorrectAnswers(0);
    setErrors(0);
    setStreak(0);
    setLastMistake(null);
    setImpact(null);
    setShot(null);
    setFeedback(null);
    setMissMessage(false);

    showWaste(getNextWaste());
    setPhase('playing');
  }, [getNextWaste, showWaste]);

  // Escolher cedo prepara o destino.
  // A pancada só acontece quando o lixo chega à raquete.
  const fireShot = useCallback(
    (chosen: BinId) => {
      if (busyRef.current || remainingMsRef.current <= 0) {
        return;
      }

      const court = courtRef.current;
      const source = wasteRef.current;
      const destination = binRefs.current[chosen];

      if (!court || !source || !destination) {
        return;
      }

      busyRef.current = true;
      chosenRef.current = null;

      setAimedBin(null);
      setInContact(false);

      const courtBox = court.getBoundingClientRect();
      const from = source.getBoundingClientRect();
      const to = destination.getBoundingClientRect();

      const originX = from.left + from.width / 2 - courtBox.left;
      const originY = from.top + from.height / 2 - courtBox.top;

      const endX =
        to.left + to.width / 2 - courtBox.left - originX;

      const endY =
        to.top + to.height / 2 - courtBox.top - originY;

      const correct = chosen === waste.bin;
      const points = correct
        ? chosen === 'preto'
          ? 5
          : 10
        : -20;

      const goodTiming =
        Math.abs(selectionTimeRef.current - CONTACT_MS) <= 280;

      playTone('hit');

      setShot({
        originX,
        originY,
        middleX: endX / 2,
        middleY: endY / 2 - 75,
        endX,
        endY,
        waste,
        bin: chosen,
        correct,
      });

      shotTimerRef.current = setTimeout(() => {
        shotTimerRef.current = null;

        const newScore = Math.max(0, score + points);
        const newErrors = errors + (correct ? 0 : 1);
        const newStreak = correct ? streak + 1 : 0;

        setScore(newScore);
        setErrors(newErrors);
        setStreak(newStreak);

        if (correct) {
          setCorrectAnswers((current) => current + 1);
        }

        setShot(null);

        const impactId = ++impactCounterRef.current;

        setImpact({
          bin: chosen,
          correct,
          points,
          id: impactId,
        });

        if (impactTimerRef.current !== null) {
          clearTimeout(impactTimerRef.current);
        }

        impactTimerRef.current = setTimeout(() => {
          setImpact((current) =>
            current?.id === impactId ? null : current
          );
        }, 700);

        const milestone: 100 | 130 | undefined =
          correct && score < 100 && newScore >= 100
            ? 100
            : correct && score < 130 && newScore >= 130
              ? 130
              : undefined;

        const destinationName =
          BINS.find((bin) => bin.id === waste.bin)?.short ??
          'recipiente certo';

        const detail = correct
          ? `${waste.name}: ${destinationName}.`
          : waste.reason;

        if (!correct) {
          setLastMistake(detail);
        }

        setFeedback({
          points,
          correct,
          correctBin: waste.bin,
          achievement: milestone,
          message:
            milestone === 130
              ? 'És um ÁS da Reciclagem! ⭐⭐'
              : milestone === 100
                ? 'Bom trabalho! ⭐'
                : correct
                  ? goodTiming
                    ? 'RAQUETADA PERFEITA! 🎾'
                    : newStreak >= 3
                      ? 'Grande sequência! 🎾'
                      : 'Boa raquetada! 🎾'
                  : 'OH, NÃO! Vamos aprender.',
          detail,
        });

        if (feedbackTimerRef.current !== null) {
          clearTimeout(feedbackTimerRef.current);
        }

        feedbackTimerRef.current = setTimeout(() => {
          setFeedback(null);
        }, 1150);

        playTone(
          !correct
            ? 'bad'
            : newScore >= WIN_SCORE
              ? 'win'
              : milestone
                ? 'star'
                : 'good'
        );

        if (newScore >= WIN_SCORE) {
          setPhase('won');
        } else if (newScore <= 0 || newErrors > MAX_ERRORS) {
          setPhase('lost');
        } else if (remainingMsRef.current <= 0) {
          setPhase('timeup');
        } else {
          showWaste(getNextWaste());
        }

        busyRef.current = false;
      }, SHOT_DURATION);
    },
    [
      score,
      errors,
      streak,
      waste,
      getNextWaste,
      playTone,
      showWaste,
    ]
  );

  fireShotRef.current = fireShot;

  const chooseBin = useCallback(
    (chosen: BinId) => {
      if (
        phase !== 'playing' ||
        busyRef.current ||
        remainingMsRef.current <= 0
      ) {
        return;
      }

      if (
        !courtRef.current ||
        !wasteRef.current ||
        !binRefs.current[chosen]
      ) {
        return;
      }

      selectionTimeRef.current = flightElapsedRef.current;
      setMissMessage(false);

      chosenRef.current = chosen;
      setAimedBin(chosen);

      if (flightElapsedRef.current >= CONTACT_MS) {
        fireShotRef.current(chosen);
      }
    },
    [phase]
  );

  // Um único relógio governa o voo e o cronómetro.
  // A pausa congela o movimento e a contagem.
  useEffect(() => {
    if (phase !== 'playing') {
      return;
    }

    let frame = 0;
    let lastDisplay = 0;
    lastFrameRef.current = null;

    const animate = (now: number) => {
      const last = lastFrameRef.current ?? now;
      lastFrameRef.current = now;

      const realElapsed = Math.max(now - last, 0);
      const elapsed = Math.min(realElapsed, 90);

      // O limite da partida é de 30 segundos reais.
      remainingMsRef.current = Math.max(
        0,
        remainingMsRef.current - realElapsed
      );

      if (
        now - lastDisplay > 90 ||
        remainingMsRef.current === 0
      ) {
        setRemainingMs(remainingMsRef.current);
        lastDisplay = now;
      }

      if (!busyRef.current && remainingMsRef.current > 0) {
        flightElapsedRef.current += elapsed;

        const progress = Math.min(
          1,
          flightElapsedRef.current / CONTACT_MS
        );

        const afterContact = Math.min(
          1,
          Math.max(
            0,
            (flightElapsedRef.current - CONTACT_MS) /
              (PASS_MS - CONTACT_MS)
          )
        );

        const element = wasteRef.current;

        if (element) {
          // O objeto chega à cabeça da raquete em 30%, 23%.
          const x =
            progress < 1
              ? 96 - 66 * progress
              : 30 - 22 * afterContact;

          const y =
            progress < 1
              ? 43 - 20 * progress
              : 23 + 31 * afterContact;

          element.style.left = `${x}%`;
          element.style.top = `${y}%`;
          element.style.transform =
            `translate(-50%, -50%) rotate(${18 - 22 * progress}deg)`;
        }

        if (
          flightElapsedRef.current >= CONTACT_MS &&
          chosenRef.current
        ) {
          fireShotRef.current(chosenRef.current);
        } else if (flightElapsedRef.current >= PASS_MS) {
          // Um resíduo que passa não desconta pontos nem erros.
          setMissMessage(true);
          showWaste(getNextWaste());
        } else if (flightElapsedRef.current >= CONTACT_MS) {
          setInContact(true);
        }
      }

      if (
        remainingMsRef.current === 0 &&
        !busyRef.current
      ) {
        setPhase('timeup');
        return;
      }

      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);
      lastFrameRef.current = null;
    };
  }, [phase, getNextWaste, showWaste]);

  useEffect(() => {
    if (!missMessage) {
      return;
    }

    const timer = setTimeout(() => {
      setMissMessage(false);
    }, 700);

    return () => clearTimeout(timer);
  }, [missMessage, incomingToken]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.repeat
      ) {
        return;
      }

      if (event.key === 'Escape' && !busyRef.current) {
        setPhase((current) =>
          current === 'playing'
            ? 'paused'
            : current === 'paused'
              ? 'playing'
              : current
        );
        return;
      }

      const bin = BINS.find((entry) => entry.key === event.key);

      if (bin) {
        chooseBin(bin.id);
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [chooseBin]);

  const shotStyle = shot
    ? ({
        left: `${shot.originX}px`,
        top: `${shot.originY}px`,
        '--mid-x': `${shot.middleX}px`,
        '--mid-y': `${shot.middleY}px`,
        '--end-x': `${shot.endX}px`,
        '--end-y': `${shot.endY}px`,
      } as React.CSSProperties)
    : undefined;

  const percent = Math.min(
    100,
    Math.max(
      0,
      ((score - START_SCORE) / (WIN_SCORE - START_SCORE)) * 100
    )
  );

  const result = gradeFor(score);

  return (
    <section className="reo-tennis-page">
      <Link to="/" className="reo-tennis-back">
        <ArrowLeft size={17} aria-hidden="true" />
        Voltar à REO
      </Link>

      <div className="reo-tennis-title">
        <div
          className="reo-tennis-partners"
          aria-label="Atividade da REO em parceria com o Projeto Tennis Education"
        >
          <Logo className="reo-tennis-partner-logo" />
          <span aria-hidden="true">×</span>
          <img
            src="/tennis-education.png"
            className="reo-tennis-partner-logo"
            alt="Logótipo do Projeto Tennis Education"
          />
        </div>

        <h1>
          Um set para o planeta
          <span aria-hidden="true"> 🎾♻️</span>
        </h1>

        <p>
          Uma atividade da REO em parceria com o Projeto Tennis Education
        </p>

        <span>
          Aprende a utilizar as ECOBAGS para reciclar na escola!
        </span>
      </div>

      <div
        className={`reo-tennis-hud ${
          phase === 'playing' && remainingMs <= 10000
            ? 'is-countdown'
            : ''
        }`}
        aria-label="Informações do jogo"
      >
        <div className="reo-tennis-stat">
          <span>Pontos</span>
          <strong key={score} className="reo-tennis-score-pop">
            {score}
          </strong>
        </div>

        <div className="reo-tennis-stat reo-tennis-time">
          <span>Tempo</span>
          <strong>{formatTime(remainingMs)}</strong>
        </div>

        <div className="reo-tennis-progress">
          <div className="reo-tennis-progress-row">
            <span>
              200 pts · Erros: {errors}/{MAX_ERRORS}
            </span>
            <strong>{Math.round(percent)}%</strong>
          </div>

          <div className="reo-tennis-progress-track">
            <div style={{ width: `${percent}%` }} />
          </div>
        </div>

        <button
          type="button"
          className="reo-tennis-sound"
          onClick={() => setSoundOn((on) => !on)}
          aria-label={soundOn ? 'Desligar som' : 'Ligar som'}
          title={soundOn ? 'Desligar som' : 'Ligar som'}
        >
          {soundOn
            ? <Volume2 size={19} />
            : <VolumeX size={19} />}
        </button>

        <button
          type="button"
          className="reo-tennis-pause"
          onClick={() =>
            setPhase(
              phase === 'paused'
                ? 'playing'
                : 'paused'
            )
          }
          disabled={
            busyRef.current ||
            (phase !== 'playing' && phase !== 'paused')
          }
          aria-label={
            phase === 'paused' ? 'Retomar jogo' : 'Pausar jogo'
          }
        >
          {phase === 'paused'
            ? <Play size={21} fill="currentColor" />
            : <Pause size={21} fill="currentColor" />}
        </button>
      </div>

      <div
        className="reo-tennis-rewards"
        aria-label="Objetivos de pontos"
      >
        {[
          { points: 100, name: 'Bom trabalho!', stars: 1 },
          { points: 130, name: 'ÁS da Reciclagem!', stars: 2 },
          { points: 200, name: 'Super ÁS!', stars: 3 },
        ].map((reward) => (
          <div
            key={reward.points}
            className={`reo-tennis-reward ${
              score >= reward.points ? 'is-earned' : ''
            }`}
          >
            <span aria-hidden="true">
              {reward.stars === 3
                ? '🏆'
                : '⭐'.repeat(reward.stars)}
            </span>
            <strong>{reward.points} pts</strong>
            <small>{reward.name}</small>
          </div>
        ))}
      </div>

      <div
        ref={courtRef}
        className={`reo-tennis-court ${
          phase === 'playing' ? 'is-active' : ''
        } ${
          feedback && !feedback.correct ? 'has-mistake' : ''
        } ${
          phase === 'paused' ? 'is-paused' : ''
        }`}
      >
        <div className="reo-tennis-sky" aria-hidden="true" />
        <div className="reo-tennis-school" aria-hidden="true" />
        <div className="reo-tennis-ground" aria-hidden="true" />

        <div
          className="reo-tennis-tree tree-left"
          aria-hidden="true"
        >
          🌳
        </div>
        <div
          className="reo-tennis-tree tree-right"
          aria-hidden="true"
        >
          🌳
        </div>

        <div className="reo-tennis-scenery" aria-hidden="true">
          <span className="reo-tennis-cloud cloud-a" />
          <span className="reo-tennis-cloud cloud-b" />
          <span className="reo-tennis-sun">☀️</span>
          <span className="reo-tennis-flower flower-a">🌼</span>
          <span className="reo-tennis-flower flower-b">🌼</span>
          <span className="reo-tennis-school-sign">ESCOLA ♻</span>
          <span className="reo-tennis-court-mark" />
        </div>

        <div
          className={`reo-tennis-mascot ${
            shot ? 'is-serving' : ''
          } ${
            impact && phase === 'playing'
              ? impact.correct
                ? 'is-celebrating'
                : 'is-disappointed'
              : ''
          }`}
          aria-hidden="true"
        >
          <div className="reo-tennis-mascot-arm left-arm" />
          <div className="reo-tennis-mascot-arm right-arm" />
          <div className="reo-tennis-mascot-leg left-leg" />
          <div className="reo-tennis-mascot-leg right-leg" />

          <Logo className="reo-tennis-cookie" />

          <div className="reo-tennis-racket">
            <svg
              viewBox="0 0 96 162"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g transform="rotate(22 46 76)">
                <rect
                  x="42" y="96" width="13" height="63" rx="5"
                  fill="#9b6327" stroke="#252018" strokeWidth="4"
                />
                <rect
                  x="41" y="129" width="15" height="29" rx="4"
                  fill="#222"
                />
                <ellipse
                  cx="48" cy="53" rx="37" ry="51"
                  fill="#214c25" stroke="#f5b523" strokeWidth="7"
                />
                <ellipse
                  cx="48" cy="53" rx="31" ry="44"
                  fill="#d7f6d3" stroke="#162c20" strokeWidth="3"
                />
                {Array.from({ length: 6 }, (_, i) => (
                  <line
                    key={`v-${i}`}
                    x1={26 + i * 9}
                    y1="14"
                    x2={26 + i * 9}
                    y2="92"
                    stroke="#6c8f72"
                    strokeWidth="1.7"
                  />
                ))}
                {Array.from({ length: 8 }, (_, i) => (
                  <line
                    key={`h-${i}`}
                    x1="17"
                    y1={18 + i * 10}
                    x2="79"
                    y2={18 + i * 10}
                    stroke="#6c8f72"
                    strokeWidth="1.7"
                  />
                ))}
              </g>
            </svg>
          </div>

          {shot && (
            <span className="reo-tennis-impact">💥</span>
          )}

          <span className="reo-tennis-mascot-shine">✦</span>

          {impact && phase === 'playing' && (
            <React.Fragment key={impact.id}>
              <span
                className={`reo-tennis-mascot-speech ${
                  impact.correct ? 'speech-good' : 'speech-bad'
                }`}
              >
                {impact.correct
                  ? streak >= 3
                    ? 'SUPER JOGADA!'
                    : 'É PONTO!'
                  : 'OH, NÃO!'}
              </span>

              <span className="reo-tennis-reaction-emoji">
                {impact.correct ? '🎉' : '😮'}
              </span>
            </React.Fragment>
          )}
        </div>

        <div
          key={`card-${incomingToken}`}
          className="reo-tennis-item"
          aria-live="polite"
        >
          <strong>{waste.name}</strong>
          <small>Onde colocas este resíduo?</small>
        </div>

        <div
          key={`incoming-${incomingToken}`}
          ref={wasteRef}
          className={`reo-tennis-incoming ${
            shot ? 'is-hidden' : ''
          }`}
          style={{ left: '96%', top: '43%' }}
          aria-hidden="true"
        >
          <WastePicture waste={waste} />
          <span className="reo-tennis-incoming-trail" />
        </div>

        {phase === 'playing' &&
          !shot &&
          (inContact || aimedBin) && (
            <div
              className="reo-tennis-hit-cue"
              role="status"
            >
              {inContact
                ? '🎾 AGORA! ESCOLHE!'
                : '🎯 ECOBAG SELECIONADA!'}
            </div>
          )}

        {phase === 'playing' &&
          missMessage &&
          !shot && (
            <div
              className="reo-tennis-miss-cue"
              role="status"
            >
              Passou! Tenta o próximo! 🎾
            </div>
          )}

        {shot && (
          <div
            className="reo-tennis-shot"
            style={shotStyle}
            aria-hidden="true"
          >
            <span className="reo-tennis-shot-symbol">
              <WastePicture waste={shot.waste} />
            </span>
            <span className="reo-tennis-flight-glimmer">✦</span>
            <span className="reo-tennis-flight-glimmer second">✧</span>
          </div>
        )}

        <div
          className="reo-tennis-bins"
          role="group"
          aria-label="Escolhe o recipiente correto"
        >
          {BINS.map((bin) => (
            <button
              key={bin.id}
              ref={(element) => {
                binRefs.current[bin.id] = element;
              }}
              type="button"
              className={[
                'reo-tennis-bin',
                `bin-${bin.id}`,
                shot?.bin === bin.id
                  ? shot.correct
                    ? 'is-correct'
                    : 'is-wrong'
                  : '',
                impact?.bin === bin.id
                  ? impact.correct
                    ? 'is-impact-good'
                    : 'is-impact-bad'
                  : '',
                aimedBin === bin.id && !shot
                  ? 'is-aimed'
                  : '',
                feedback &&
                !feedback.correct &&
                feedback.correctBin === bin.id
                  ? 'is-answer'
                  : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => chooseBin(bin.id)}
              disabled={phase !== 'playing' || shot !== null}
              aria-label={`${bin.label}. Tecla ${bin.key}.`}
            >
              <span className="reo-tennis-bin-body">
                <span
                  className="reo-tennis-bin-icon"
                  aria-hidden="true"
                >
                  {bin.id === 'preto' ? '🚮' : '♻'}
                </span>
                <span className="reo-tennis-bin-label">
                  {bin.label}
                </span>

                {impact?.bin === bin.id && (
                  <span
                    key={impact.id}
                    className={`reo-tennis-bag-burst ${
                      impact.correct
                        ? 'burst-good'
                        : 'burst-bad'
                    }`}
                    aria-hidden="true"
                  >
                    <span>{impact.correct ? '✦' : '✕'}</span>
                    <span>{impact.correct ? '✶' : '!'}</span>
                    <span>{impact.correct ? '✦' : '✕'}</span>
                    <strong>
                      {impact.points > 0 ? '+' : ''}
                      {impact.points}
                    </strong>
                  </span>
                )}
              </span>

              <span className="reo-tennis-bin-key">
                {bin.key}
              </span>
            </button>
          ))}
        </div>

        {feedback?.achievement &&
          phase === 'playing' && (
            <div
              key={`star-${feedback.achievement}`}
              className="reo-tennis-achievement-pop"
              aria-hidden="true"
            >
              <span>
                {feedback.achievement === 100 ? '⭐' : '⭐⭐'}
              </span>
              <strong>
                {feedback.achievement === 100
                  ? 'BOM TRABALHO!'
                  : 'ÁS DA RECICLAGEM!'}
              </strong>
            </div>
          )}

        {feedback && phase === 'playing' && (
          <div
            className={`reo-tennis-feedback ${
              feedback.correct ? 'good' : 'bad'
            } ${
              feedback.achievement ? 'is-achievement' : ''
            }`}
            role="status"
          >
            <strong>
              {feedback.points > 0 ? '+' : ''}
              {feedback.points}
            </strong>
            <span>
              <b>{feedback.message}</b>
              <small>{feedback.detail}</small>
            </span>
          </div>
        )}

        {phase !== 'playing' && (
          <div className="reo-tennis-overlay">
            {phase === 'intro' && (
              <div
                className="reo-tennis-modal reo-tennis-intro"
                role="dialog"
                aria-labelledby="reo-tennis-intro-title"
              >
                <Gamepad2
                  size={32}
                  className="reo-tennis-modal-icon"
                  aria-hidden="true"
                />
                <h2 id="reo-tennis-intro-title">
                  Um set para o planeta!
                </h2>
                <p>
                  A REO e o Projeto Tennis Education precisam de ti!
                  Escolhe a ECOBAG enquanto o lixo vem a voar.
                  A Bolacha bate quando ele chega à raquete!
                </p>

                <div className="reo-tennis-guide">
                  {BINS.map((bin) => (
                    <div
                      key={bin.id}
                      className={`reo-tennis-guide-item guide-${bin.id}`}
                    >
                      <b>
                        {bin.id === 'preto'
                          ? 'Caixote'
                          : 'ECOBAG'}{' '}
                        {bin.id === 'preto'
                          ? 'cinzento'
                          : bin.id === 'amarelo'
                            ? 'amarela'
                            : bin.id === 'verde'
                              ? 'verde'
                              : 'azul'}
                      </b>
                      <span>{bin.hint}</span>
                    </div>
                  ))}
                </div>

                <p className="reo-tennis-fineprint">
                  30 segundos · Começas com 60 pontos ·
                  Podes errar uma vez. Se o lixo passar,
                  não perdes pontos. Azul/amarelo/verde: +10;
                  indiferenciado: +5; erro: −20.
                </p>

                <button
                  className="reo-tennis-primary"
                  type="button"
                  onClick={startGame}
                >
                  <Play size={18} fill="currentColor" />
                  Começar!
                </button>
              </div>
            )}

            {phase === 'paused' && (
              <div
                className="reo-tennis-modal"
                role="dialog"
                aria-labelledby="reo-tennis-paused-title"
              >
                <Pause
                  size={36}
                  className="reo-tennis-modal-icon"
                  aria-hidden="true"
                />
                <h2 id="reo-tennis-paused-title">
                  Jogo em pausa
                </h2>
                <p>
                  Vê a cor de cada ECOBAG e pensa
                  onde deve ir o resíduo.
                </p>

                <div className="reo-tennis-guide compact">
                  {BINS.map((bin) => (
                    <div
                      key={bin.id}
                      className={`reo-tennis-guide-item guide-${bin.id}`}
                    >
                      <b>{bin.short}</b>
                      <span>{bin.hint}</span>
                    </div>
                  ))}
                </div>

                <button
                  className="reo-tennis-primary"
                  type="button"
                  onClick={() => setPhase('playing')}
                >
                  <Play size={18} fill="currentColor" />
                  Continuar
                </button>
              </div>
            )}

            {phase === 'won' && (
              <div
                className="reo-tennis-modal is-win"
                role="alertdialog"
                aria-labelledby="reo-tennis-won-title"
              >
                <div
                  className="reo-tennis-victory-fireworks"
                  aria-hidden="true"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <span
                      key={i}
                      style={
                        { '--piece': i } as React.CSSProperties
                      }
                    >
                      {i % 2 ? '✦' : '●'}
                    </span>
                  ))}
                </div>

                <span
                  className="reo-tennis-confetti"
                  aria-hidden="true"
                >
                  🎉 ⭐ 🏆 🎾 ♻️ 🎉
                </span>

                <Trophy
                  size={46}
                  className="reo-tennis-modal-icon"
                  aria-hidden="true"
                />

                <h2 id="reo-tennis-won-title">
                  Parabéns!
                  <br />
                  Super ÁS da Reciclagem!
                </h2>
                <p>
                  Chegaste aos 200 pontos!
                  A REO e o Projeto Tennis Education
                  agradecem a tua ajuda para usar bem as ECOBAGS.
                </p>
                <div className="reo-tennis-result">
                  🏆 {score} pontos · {correctAnswers} acertos
                </div>
                <button
                  className="reo-tennis-primary"
                  type="button"
                  onClick={startGame}
                >
                  <RotateCcw size={18} />
                  Jogar outra vez
                </button>
              </div>
            )}

            {phase === 'timeup' && (
              <div
                className="reo-tennis-modal"
                role="alertdialog"
                aria-labelledby="reo-tennis-timeup-title"
              >
                <div
                  className="reo-tennis-result-stars"
                  aria-label={`${result.stars} estrelas`}
                >
                  {'⭐'.repeat(result.stars) || '🎾'}
                </div>
                <h2 id="reo-tennis-timeup-title">
                  {result.title}
                </h2>
                <p>{result.detail}</p>
                <div className="reo-tennis-result">
                  ⏱️ 30 segundos · {score} pontos ·
                  {correctAnswers} acertos
                </div>
                <p className="reo-tennis-fineprint">
                  Queres tentar chegar aos 200 pontos?
                </p>
                <button
                  className="reo-tennis-primary"
                  type="button"
                  onClick={startGame}
                >
                  <RotateCcw size={18} />
                  Jogar outra vez
                </button>
              </div>
            )}

            {phase === 'lost' && (
              <div
                className="reo-tennis-modal is-loss"
                role="alertdialog"
                aria-labelledby="reo-tennis-lost-title"
              >
                <span
                  aria-hidden="true"
                  className="reo-tennis-sad"
                >
                  🎾
                </span>
                <h2 id="reo-tennis-lost-title">
                  Fim de jogo!
                </h2>
                <p>
                  A REO e o Projeto Tennis Education
                  precisam da tua ajuda para reciclar melhor!
                </p>
                {lastMistake && (
                  <p className="reo-tennis-learning">
                    <strong>Aprendemos uma coisa:</strong>
                    {' '}{lastMistake}
                  </p>
                )}
                <p className="reo-tennis-fineprint">
                  {errors > MAX_ERRORS
                    ? 'Só podes errar uma vez por partida.'
                    : 'Chegaste aos zero pontos.'}
                  {' '}Tenta novamente!
                </p>
                <button
                  className="reo-tennis-primary"
                  type="button"
                  onClick={startGame}
                >
                  <RotateCcw size={18} />
                  Tentar novamente
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <p className="reo-tennis-controls">
        🖱️ <strong>Rato:</strong> clicar ·
        📱 <strong>Telemóvel:</strong> tocar ·
        ⌨️ <strong>Teclado:</strong> 1–4 ·
        <Star size={13} aria-hidden="true" />
        Sequência: {streak}
      </p>

      <p className="reo-tennis-tip">
        Na nossa escola, as cascas de fruta e os restos
        de comida vão para o caixote cinzento (indiferenciado).
      </p>

      <p className="reo-tennis-tip">
        Garrafas e latas de bebidas com símbolo Volta devem
        ser devolvidas num Ponto Volta, não nas ECOBAGS.
      </p>

      <p className="reo-tennis-record">
        Recorde pessoal neste dispositivo:
        <strong> {Math.max(record, score)} pontos</strong>
      </p>
    </section>
  );
};

export default React.memo(TennisEducation);
