import React, { useEffect, useRef, useState } from 'react';
import reoDashHtml from '../games/reo-dash.html?raw';
import reoDashMusic from '../games/reo-dash-background.mp3';

const ReoDash: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const signalObserverRef = useRef<MutationObserver | null>(null);
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const cleanupGameBindingsRef = useRef<(() => void) | null>(null);

  const gameActiveRef = useRef(false);
  const gameStartedRef = useRef(false);

  const [mobileIframeHeight, setMobileIframeHeight] = useState<number | null>(
    null
  );

  /*
   * Enquanto o REO DASH está aberto, impede seleção,
   * long-press e arrastar elementos no documento principal.
   *
   * O CSS global é necessário sobretudo no iPhone,
   * que pode ignorar o evento selectstart em alguns
   * gestos de pressão prolongada.
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
    const gameDocument = iframeRef.current?.contentDocument;

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

  const updateMobileIframeHeight = () => {
    const iframe = iframeRef.current;
    const gameDocument = iframe?.contentDocument;

    if (!iframe || !gameDocument) return;

    /*
     * Em tablet/desktop mantemos a altura normal.
     * O ajuste automático é apenas para o layout mobile.
     */
    if (!window.matchMedia('(max-width: 639px)').matches) {
      setMobileIframeHeight(null);
      return;
    }

    const mesa = gameDocument.querySelector<HTMLElement>('.mesa');

    if (!mesa) return;

    const measuredHeight = Math.ceil(
      mesa.getBoundingClientRect().height
    );

    if (measuredHeight > 0) {
      setMobileIframeHeight(measuredHeight + 2);
    }
  };

  const handleGameLoad = () => {
    const gameDocument = iframeRef.current?.contentDocument;

    if (!gameDocument) return;

    /*
     * Limpa eventuais ligações anteriores caso o iframe
     * volte a carregar.
     */
    resizeObserverRef.current?.disconnect();
    signalObserverRef.current?.disconnect();
    cleanupGameBindingsRef.current?.();

    musicRef.current?.pause();
    musicRef.current = null;

    gameActiveRef.current = false;
    gameStartedRef.current = false;

    /*
     * Impede seleção, callout e drag também dentro
     * do documento do jogo.
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
     * Evita duplicar os estilos se o iframe voltar
     * a executar o evento load.
     */
    gameDocument
      .getElementById('reo-dash-mobile-overrides')
      ?.remove();

    const style = gameDocument.createElement('style');
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
       * O canvas fica exclusivamente como área visual.
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
       * A REO fornece os dois controlos externos.
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
         * 4 estatísticas numa única linha.
         */
        .consola {
          display: grid !important;
          grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
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
     * É criada dentro do próprio documento do jogo para que
     * o gesto de tocar em "Jogar" no iPhone conte diretamente
     * como interação do utilizador e permita iniciar áudio.
     */
    gameDocument
      .getElementById('reo-dash-background-music')
      ?.remove();

    const music = gameDocument.createElement('audio');

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

    const isMuted = () => {
      return bSom?.textContent?.trim() === '✕';
    };

    const pauseMusic = (reset = false) => {
      music.pause();

      if (reset) {
        try {
          music.currentTime = 0;
        } catch {
          // Alguns browsers podem não permitir alterar
          // currentTime antes dos metadados carregarem.
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
         * O iOS pode recusar play() caso não reconheça
         * uma interação direta. O próximo toque em Jogar
         * volta a tentar automaticamente.
         */
      });
    };

    /*
     * JOGAR também funciona como pausa/continuar.
     *
     * Mantemos um estado apenas para a música.
     * Não alteramos qualquer variável interna do jogo.
     */
    const handlePlayButton = () => {
      if (!gameStartedRef.current) {
        gameStartedRef.current = true;
        gameActiveRef.current = true;
        playMusic();
        return;
      }

      if (gameActiveRef.current) {
        gameActiveRef.current = false;
        pauseMusic(false);
      } else {
        gameActiveRef.current = true;
        playMusic();
      }
    };

    /*
     * Recomeçar volta ao ecrã inicial do jogo.
     * A música para e regressa ao início.
     */
    const handleRestartButton = () => {
      gameStartedRef.current = false;
      gameActiveRef.current = false;
      pauseMusic(true);
    };

    /*
     * O botão ♪ / ✕ já existente passa a controlar
     * também a música de fundo.
     *
     * Usamos capture para o play() acontecer diretamente
     * dentro do gesto do utilizador no iPhone.
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
     * Mantém Enter e P coerentes com os controlos
     * de teclado existentes no jogo.
     */
    const handleGameKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        handlePlayButton();
        return;
      }

      if (
        (event.key === 'p' || event.key === 'P') &&
        gameStartedRef.current
      ) {
        if (gameActiveRef.current) {
          gameActiveRef.current = false;
          pauseMusic(false);
        } else {
          gameActiveRef.current = true;
          playMusic();
        }
      }
    };

    /*
     * Quando a PWA vai para segundo plano, o jogo
     * já se coloca em pausa. Fazemos o mesmo à música.
     */
    const handleVisibilityChange = () => {
      if (gameDocument.hidden) {
        gameActiveRef.current = false;
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
     * Quando o sinal chega a zero, o jogo termina.
     * Observamos apenas o mostrador já existente:
     * não tocamos na lógica interna do jogo.
     */
    if (vSinal) {
      signalObserverRef.current = new MutationObserver(
        () => {
          if (vSinal.textContent?.trim() === '0') {
            gameStartedRef.current = false;
            gameActiveRef.current = false;
            pauseMusic(true);
          }
        }
      );

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
     * Ajusta a altura do iframe ao tamanho verdadeiro
     * do painel REO DASH.
     */
    const mesa =
      gameDocument.querySelector<HTMLElement>('.mesa');

    if (
      mesa &&
      typeof ResizeObserver !== 'undefined'
    ) {
      resizeObserverRef.current = new ResizeObserver(
        () => {
          updateMobileIframeHeight();
        }
      );

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
        // Não é crítico para o funcionamento do jogo.
      });
  };

  const startJump = (
    event: React.PointerEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();

    try {
      event.currentTarget.setPointerCapture(
        event.pointerId
      );
    } catch {
      // Alguns browsers móveis não necessitam
      // de pointer capture.
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

    dispatchGameKey(
      'keyup',
      'Space',
      ' '
    );
  };

  const roll = (
    event: React.PointerEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();

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
                height: `${mobileIframeHeight}px`,
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

        Agora fazem parte do fluxo normal da página:
        ficam imediatamente abaixo do jogo e antes do footer.

        Deixam portanto de estar fixed sobre outros
        elementos da aplicação.
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
            active:scale-95
            active:bg-amber-500
            active:text-black
          "
        >
          <span className="pointer-events-none select-none">
            Rolar
          </span>
        </button>

        {/* SALTAR — direita */}
        <button
          type="button"
          aria-label="Saltar"
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
            active:scale-95
            active:bg-amber-500
            active:text-black
          "
        >
          <span className="pointer-events-none select-none">
            Saltar
          </span>
        </button>
      </div>
    </section>
  );
};

export default React.memo(ReoDash);
