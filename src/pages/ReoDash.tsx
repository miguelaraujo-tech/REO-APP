import React, { useEffect, useRef, useState } from 'react';
import reoDashHtml from '../games/reo-dash.html?raw';
import reoDashMusic from '../games/reo-dash-background.mp3';

type GameUiState = 'ready' | 'playing' | 'paused' | 'ended';

const ReoDash: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const signalObserverRef = useRef<MutationObserver | null>(null);
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const cleanupGameBindingsRef = useRef<(() => void) | null>(null);

  const gameActiveRef = useRef(false);
  const gameStartedRef = useRef(false);
  const gameUiStateRef = useRef<GameUiState>('ready');

  const [gameUiState, setGameUiState] =
    useState<GameUiState>('ready');

  const [mobileIframeHeight, setMobileIframeHeight] =
    useState<number | null>(null);

  /*
   * Enquanto o REO DASH está aberto, impede seleção,
   * long-press e arrastar elementos em toda a página REO.
   *
   * Isto é particularmente importante no iPhone.
   * Ao sair do REO DASH, estes estilos são removidos.
   */
  useEffect(() => {
    const preventNativeInteraction = (event: Event) => {
      event.preventDefault();
    };

    const globalStyle = document.createElement('style');
    globalStyle.id = 'reo-dash-global-no-select';

    globalStyle.textContent = `
      html,
      body,
      #root,
      #root * {
        -webkit-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
        -webkit-tap-highlight-color: transparent !important;
      }

      img,
      svg {
        -webkit-user-drag: none !important;
        user-drag: none !important;
      }
    `;

    document.head.appendChild(globalStyle);

    document.addEventListener(
      'selectstart',
      preventNativeInteraction,
      true
    );

    document.addEventListener(
      'contextmenu',
      preventNativeInteraction,
      true
    );

    document.addEventListener(
      'dragstart',
      preventNativeInteraction,
      true
    );

    return () => {
      resizeObserverRef.current?.disconnect();
      signalObserverRef.current?.disconnect();
      cleanupGameBindingsRef.current?.();

      musicRef.current?.pause();
      musicRef.current = null;

      globalStyle.remove();

      document.removeEventListener(
        'selectstart',
        preventNativeInteraction,
        true
      );

      document.removeEventListener(
        'contextmenu',
        preventNativeInteraction,
        true
      );

      document.removeEventListener(
        'dragstart',
        preventNativeInteraction,
        true
      );
    };
  }, []);

  const dispatchGameKey = (
    type: 'keydown' | 'keyup',
    code: string,
    key: string
  ) => {
    const gameDocument =
      iframeRef.current?.contentDocument;

    if (!gameDocument) return;

    gameDocument.dispatchEvent(
      new KeyboardEvent(type, {
        code,
        key,
        bubbles: true,
        cancelable: true,
      })
    );
  };

  /*
   * Feedback tátil.
   *
   * Se o dispositivo/browser não suportar vibration,
   * simplesmente não acontece nada.
   */
  const vibrate = (duration: number) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(duration);
    }
  };

  const updateMobileIframeHeight = () => {
    const iframe = iframeRef.current;
    const gameDocument = iframe?.contentDocument;

    if (!iframe || !gameDocument) return;

    /*
     * Em tablet/desktop mantemos a altura normal.
     * O ajuste automático é apenas mobile.
     */
    if (
      !window.matchMedia('(max-width: 639px)').matches
    ) {
      setMobileIframeHeight(null);
      return;
    }

    const mesa =
      gameDocument.querySelector<HTMLElement>('.mesa');

    if (!mesa) return;

    const measuredHeight = Math.ceil(
      mesa.getBoundingClientRect().height
    );

    if (measuredHeight > 0) {
      setMobileIframeHeight(measuredHeight + 2);
    }
  };

  const handleGameLoad = () => {
    const gameDocument =
      iframeRef.current?.contentDocument;

    if (!gameDocument) return;

    /*
     * Limpa eventuais ligações anteriores caso
     * o iframe volte a carregar.
     */
    resizeObserverRef.current?.disconnect();
    signalObserverRef.current?.disconnect();
    cleanupGameBindingsRef.current?.();

    musicRef.current?.pause();
    musicRef.current = null;

    gameActiveRef.current = false;
    gameStartedRef.current = false;
    gameUiStateRef.current = 'ready';
    setGameUiState('ready');

    /*
     * Impede seleção, callout e drag também
     * dentro do próprio documento do jogo.
     */
    const preventNativeInteraction = (event: Event) => {
      event.preventDefault();
    };

    gameDocument.addEventListener(
      'selectstart',
      preventNativeInteraction,
      true
    );

    gameDocument.addEventListener(
      'contextmenu',
      preventNativeInteraction,
      true
    );

    gameDocument.addEventListener(
      'dragstart',
      preventNativeInteraction,
      true
    );

    /*
     * Evita duplicar estilos se o iframe
     * executar novamente o evento load.
     */
    gameDocument
      .getElementById('reo-dash-mobile-overrides')
      ?.remove();

    const style =
      gameDocument.createElement('style');

    style.id = 'reo-dash-mobile-overrides';

    style.textContent = `
      html,
      body,
      body * {
        -webkit-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
        -webkit-tap-highlight-color: transparent !important;
      }

      html,
      body {
        overscroll-behavior: none;
      }

      /*
       * No telemóvel o salto é feito pelo botão SALTAR.
       * O canvas é exclusivamente a área visual do jogo.
       */
      #game {
        pointer-events: none !important;
        -webkit-user-drag: none !important;
        user-drag: none !important;
        -webkit-touch-callout: none !important;
        -webkit-tap-highlight-color: transparent !important;
      }

      /*
       * O botão ROLAR original do HTML fica escondido.
       * A REO fornece ROLAR e SALTAR externamente.
       */
      #dash {
        display: none !important;
      }

      @media (max-width: 600px) {
        html,
        body {
          width: 100% !important;
          height: auto !important;
          min-height: 0 !important;
          overflow: hidden !important;
        }

        body {
          display: block !important;
          padding: 0 !important;
          align-items: flex-start !important;
          justify-content: flex-start !important;
        }

        .mesa {
          width: 100% !important;
          max-width: none !important;
          padding: 8px !important;
          border-radius: 0 !important;
          border-left: 0 !important;
          border-right: 0 !important;
          box-shadow: none !important;
        }

        .barra {
          gap: 8px !important;
          margin-bottom: 5px !important;
        }

        /*
         * As quatro estatísticas permanecem
         * compactas numa única linha.
         */
        .consola {
          display: grid !important;
          grid-template-columns:
            repeat(4, minmax(0, 1fr)) !important;
          gap: 4px !important;
          margin-bottom: 4px !important;
        }

        .mod {
          min-width: 0 !important;
          padding: 6px 5px !important;
          border-radius: 7px !important;
        }

        .mod label {
          margin-bottom: 2px !important;
          font-size: 0.42rem !important;
          letter-spacing: 0.06em !important;
          line-height: 1.1 !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
        }

        .mod output {
          font-size: 0.95rem !important;
          line-height: 1.05 !important;
        }

        .nota {
          margin-top: 3px !important;
          font-size: 0.40rem !important;
          line-height: 1.1 !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
        }

        .vu {
          gap: 2px !important;
          margin-top: 4px !important;
        }

        .vu i {
          height: 4px !important;
          border-radius: 1px !important;
        }

        canvas#game {
          width: 100% !important;
          max-width: none !important;
          border-radius: 10px !important;
        }

        .comandos {
          margin-top: 8px !important;
        }

        .ajuda {
          display: none !important;
        }
      }
    `;

    gameDocument.head.appendChild(style);

    /*
     * Música de fundo.
     *
     * É criada dentro do documento do jogo para
     * aproveitar diretamente o gesto do utilizador
     * quando toca em Jogar no iPhone.
     */
    gameDocument
      .getElementById(
        'reo-dash-background-music'
      )
      ?.remove();

    const music =
      gameDocument.createElement('audio');

    music.id = 'reo-dash-background-music';
    music.src = reoDashMusic;
    music.loop = true;
    music.preload = 'auto';
    music.volume = 0.22;
    music.setAttribute('playsinline', '');

    gameDocument.body.appendChild(music);
    musicRef.current = music;

    const bJogar =
      gameDocument.getElementById(
        'bJogar'
      ) as HTMLButtonElement | null;

    const bRecomecar =
      gameDocument.getElementById(
        'bRecomecar'
      ) as HTMLButtonElement | null;

    const bSom =
      gameDocument.getElementById(
        'bSom'
      ) as HTMLButtonElement | null;

    const vSinal =
      gameDocument.getElementById('vSinal');

    /*
     * Sincroniza o estado da camada React
     * com o estado visual do botão interno.
     */
    const updateGameUiState = (
      nextState: GameUiState
    ) => {
      gameUiStateRef.current = nextState;
      setGameUiState(nextState);

      if (nextState === 'playing') {
        gameStartedRef.current = true;
        gameActiveRef.current = true;
      } else if (nextState === 'paused') {
        gameStartedRef.current = true;
        gameActiveRef.current = false;
      } else {
        gameStartedRef.current = false;
        gameActiveRef.current = false;
      }

      if (!bJogar) return;

      if (nextState === 'playing') {
        bJogar.textContent = 'Pausar';
      } else if (nextState === 'paused') {
        bJogar.textContent = 'Continuar';
      } else {
        bJogar.textContent = 'Jogar';
      }
    };

    /*
     * Estado inicial.
     */
    updateGameUiState('ready');

    const isMuted = () => {
      return (
        bSom?.textContent?.trim() === '✕'
      );
    };

    const pauseMusic = (
      reset = false
    ) => {
      music.pause();

      if (reset) {
        try {
          music.currentTime = 0;
        } catch {
          /*
           * Alguns browsers podem não permitir
           * alterar currentTime antes de carregar
           * os metadados.
           */
        }
      }
    };

    const playMusic = () => {
      if (
        !gameActiveRef.current ||
        isMuted() ||
        gameDocument.hidden
      ) {
        return;
      }

      music.play().catch(() => {
        /*
         * O iOS pode recusar play() se não
         * reconhecer uma interação direta.
         * Um novo toque volta a tentar.
         */
      });
    };

    /*
     * O jogo original usa o mesmo botão para:
     *
     * JOGAR
     * PAUSAR
     * CONTINUAR
     *
     * Aqui apenas sincronizamos o texto e a música.
     * A lógica original do jogo não é substituída.
     */
    const handlePlayButton = () => {
      const current =
        gameUiStateRef.current;

      if (
        current === 'ready' ||
        current === 'ended'
      ) {
        updateGameUiState('playing');
        playMusic();
        return;
      }

      if (current === 'playing') {
        updateGameUiState('paused');
        pauseMusic(false);
        return;
      }

      updateGameUiState('playing');
      playMusic();
    };

    /*
     * Recomeçar volta ao estado inicial.
     */
    const handleRestartButton = () => {
      updateGameUiState('ready');
      pauseMusic(true);
    };

    /*
     * O botão ♪ / ✕ existente controla
     * também a música de fundo.
     *
     * Este listener executa em capture, antes
     * de o botão original trocar ♪ por ✕.
     */
    const handleSoundButton = () => {
      const currentlyMuted = isMuted();

      if (currentlyMuted) {
        if (
          gameActiveRef.current &&
          !gameDocument.hidden
        ) {
          music.play().catch(() => {});
        }
      } else {
        pauseMusic(false);
      }
    };

    /*
     * Mantém Enter e P coerentes
     * com o comportamento visual.
     */
    const handleGameKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key === 'Enter') {
        handlePlayButton();
        return;
      }

      if (
        (event.key === 'p' ||
          event.key === 'P') &&
        (
          gameUiStateRef.current === 'playing' ||
          gameUiStateRef.current === 'paused'
        )
      ) {
        if (
          gameUiStateRef.current === 'playing'
        ) {
          updateGameUiState('paused');
          pauseMusic(false);
        } else {
          updateGameUiState('playing');
          playMusic();
        }
      }
    };

    /*
     * Se a PWA for para segundo plano,
     * o jogo original pausa.
     *
     * Sincronizamos o botão e a música.
     */
    const handleVisibilityChange = () => {
      if (
        gameDocument.hidden &&
        gameUiStateRef.current === 'playing'
      ) {
        updateGameUiState('paused');
        pauseMusic(false);
      }
    };

    bJogar?.addEventListener(
      'click',
      handlePlayButton,
      true
    );

    bRecomecar?.addEventListener(
      'click',
      handleRestartButton,
      true
    );

    bSom?.addEventListener(
      'click',
      handleSoundButton,
      true
    );

    gameDocument.addEventListener(
      'keydown',
      handleGameKeyDown,
      true
    );

    gameDocument.addEventListener(
      'visibilitychange',
      handleVisibilityChange
    );

    /*
     * Quando o sinal chega a zero,
     * o próprio jogo termina.
     *
     * Apenas observamos o mostrador existente
     * para atualizar os controlos externos.
     */
    if (vSinal) {
      signalObserverRef.current =
        new MutationObserver(() => {
          if (
            vSinal.textContent?.trim() === '0'
          ) {
            updateGameUiState('ended');
            pauseMusic(true);
          }
        });

      signalObserverRef.current.observe(
        vSinal,
        {
          childList: true,
          subtree: true,
          characterData: true,
        }
      );
    }

    cleanupGameBindingsRef.current = () => {
      bJogar?.removeEventListener(
        'click',
        handlePlayButton,
        true
      );

      bRecomecar?.removeEventListener(
        'click',
        handleRestartButton,
        true
      );

      bSom?.removeEventListener(
        'click',
        handleSoundButton,
        true
      );

      gameDocument.removeEventListener(
        'keydown',
        handleGameKeyDown,
        true
      );

      gameDocument.removeEventListener(
        'visibilitychange',
        handleVisibilityChange
      );

      gameDocument.removeEventListener(
        'selectstart',
        preventNativeInteraction,
        true
      );

      gameDocument.removeEventListener(
        'contextmenu',
        preventNativeInteraction,
        true
      );

      gameDocument.removeEventListener(
        'dragstart',
        preventNativeInteraction,
        true
      );

      signalObserverRef.current?.disconnect();
    };

    /*
     * Ajusta automaticamente a altura do iframe
     * à altura real do REO DASH.
     */
    const mesa =
      gameDocument.querySelector<HTMLElement>(
        '.mesa'
      );

    if (
      mesa &&
      typeof ResizeObserver !== 'undefined'
    ) {
      resizeObserverRef.current =
        new ResizeObserver(() => {
          updateMobileIframeHeight();
        });

      resizeObserverRef.current.observe(mesa);
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        updateMobileIframeHeight();
      });
    });

    gameDocument.fonts?.ready
      .then(() => {
        updateMobileIframeHeight();
      })
      .catch(() => {
        /*
         * O carregamento das fontes
         * não é crítico para o jogo.
         */
      });
  };

  /*
   * SALTAR
   *
   * Só é executado quando o botão está ativo.
   */
  const startJump = (
    event: React.PointerEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();

    if (
      gameUiStateRef.current !== 'playing'
    ) {
      return;
    }

    vibrate(10);

    try {
      event.currentTarget.setPointerCapture(
        event.pointerId
      );
    } catch {
      /*
       * Alguns browsers móveis
       * não necessitam de pointer capture.
       */
    }

    dispatchGameKey(
      'keydown',
      'Space',
      ' '
    );
  };

  const endJump = (
    event: React.PointerEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();

    if (
      gameUiStateRef.current !== 'playing'
    ) {
      return;
    }

    dispatchGameKey(
      'keyup',
      'Space',
      ' '
    );
  };

  /*
   * ROLAR
   */
  const roll = (
    event: React.PointerEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();

    if (
      gameUiStateRef.current !== 'playing'
    ) {
      return;
    }

    vibrate(14);

    dispatchGameKey(
      'keydown',
      'ShiftLeft',
      'Shift'
    );

    dispatchGameKey(
      'keyup',
      'ShiftLeft',
      'Shift'
    );
  };

  const preventReactNativeInteraction = (
    event: React.SyntheticEvent
  ) => {
    event.preventDefault();
  };

  const noSelectStyle = {
    WebkitUserSelect: 'none',
    userSelect: 'none',
    WebkitTouchCallout: 'none',
  } as React.CSSProperties;

  const gameButtonStyle = {
    WebkitUserSelect: 'none',
    userSelect: 'none',
    WebkitTouchCallout: 'none',
    WebkitTapHighlightColor: 'transparent',
    touchAction: 'none',
  } as React.CSSProperties;

  const controlsEnabled =
    gameUiState === 'playing';

  return (
    <section
      onContextMenu={
        preventReactNativeInteraction
      }
      onDragStart={
        preventReactNativeInteraction
      }
      style={noSelectStyle}
      className="
        relative
        -mx-4
        -mt-6
        -mb-6
        w-[calc(100%+2rem)]
        select-none
        sm:mx-0
        sm:mt-0
        sm:mb-0
        sm:w-full
      "
    >
      <iframe
        ref={iframeRef}
        title="REO Dash"
        srcDoc={reoDashHtml}
        onLoad={handleGameLoad}
        draggable={false}
        style={
          mobileIframeHeight !== null
            ? {
                height:
                  `${mobileIframeHeight}px`,
                ...noSelectStyle,
              }
            : noSelectStyle
        }
        className="
          block
          w-full
          h-[700px]
          md:h-[780px]
          rounded-none
          sm:rounded-[1.75rem]
          border-y
          border-amber-500/25
          sm:border
          bg-[#0b0908]
          shadow-[0_0_40px_rgba(245,158,11,0.08)]
          select-none
        "
        allow="autoplay"
      />

      {/*
        CONTROLOS MÓVEIS

        Fazem parte do fluxo normal da página.
        Ficam imediatamente abaixo do REO DASH
        e antes do footer da aplicação.
      */}
      <div
        onContextMenu={
          preventReactNativeInteraction
        }
        onDragStart={
          preventReactNativeInteraction
        }
        style={noSelectStyle}
        className="
          relative
          z-20
          flex
          w-full
          items-center
          justify-between
          px-10
          pt-8
          pb-10
          bg-[#0b0b13]
          border-b
          border-amber-500/20
          select-none
          sm:hidden
        "
      >
        {/* ROLAR — esquerda */}
        <button
          type="button"
          aria-label="Rolar"
          disabled={!controlsEnabled}
          onPointerDown={roll}
          onContextMenu={
            preventReactNativeInteraction
          }
          onDragStart={
            preventReactNativeInteraction
          }
          style={gameButtonStyle}
          className="
            flex
            h-[88px]
            w-[88px]
            shrink-0
            touch-none
            select-none
            items-center
            justify-center
            rounded-full
            border
            border-amber-500/60
            bg-[#24180d]/95
            text-[12px]
            font-black
            uppercase
            tracking-[0.14em]
            text-amber-400
            shadow-[0_8px_30px_rgba(0,0,0,0.55)]
            backdrop-blur-md
            transition-all
            duration-100
            active:scale-90
            active:border-amber-300
            active:bg-amber-500
            active:text-black
            disabled:opacity-30
            disabled:shadow-none
            disabled:cursor-default
          "
        >
          <span
            className="
              pointer-events-none
              select-none
            "
          >
            Rolar
          </span>
        </button>

        {/* SALTAR — direita */}
        <button
          type="button"
          aria-label="Saltar"
          disabled={!controlsEnabled}
          onPointerDown={startJump}
          onPointerUp={endJump}
          onPointerCancel={endJump}
          onPointerLeave={endJump}
          onContextMenu={
            preventReactNativeInteraction
          }
          onDragStart={
            preventReactNativeInteraction
          }
          style={gameButtonStyle}
          className="
            flex
            h-[88px]
            w-[88px]
            shrink-0
            touch-none
            select-none
            items-center
            justify-center
            rounded-full
            border
            border-amber-500/60
            bg-[#24180d]/95
            text-[12px]
            font-black
            uppercase
            tracking-[0.14em]
            text-amber-400
            shadow-[0_8px_30px_rgba(0,0,0,0.55)]
            backdrop-blur-md
            transition-all
            duration-100
            active:scale-90
            active:border-amber-300
            active:bg-amber-500
            active:text-black
            disabled:opacity-30
            disabled:shadow-none
            disabled:cursor-default
          "
        >
          <span
            className="
              pointer-events-none
              select-none
            "
          >
            Saltar
          </span>
        </button>
      </div>
    </section>
  );
};

export default React.memo(ReoDash);
