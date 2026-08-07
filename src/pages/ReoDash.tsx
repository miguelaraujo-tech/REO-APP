import React, { useEffect, useRef, useState } from 'react';
import reoDashHtml from '../games/reo-dash.html?raw';

const ReoDash: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [mobileIframeHeight, setMobileIframeHeight] = useState<number | null>(null);

  /*
   * Enquanto o REO DASH está aberto, impede seleção,
   * long-press e arrastar elementos no documento principal.
   */
  useEffect(() => {
    const preventNativeInteraction = (event: Event) => {
      event.preventDefault();
    };

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

    resizeObserverRef.current?.disconnect();

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

        /*
         * Cabeçalho ligeiramente mais próximo
         * do painel de estatísticas.
         */
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

        /*
         * Um pouco mais legível do que a versão anterior,
         * sem voltar a ocupar demasiado espaço.
         */
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

        /*
         * Mantém o jogo na proporção original 16:9,
         * usando toda a largura disponível.
         */
        canvas#game {
          width: 100% !important;
          max-width: none !important;
          border-radius: 10px !important;
        }

        .comandos {
          margin-top: 8px !important;
        }

        /*
         * As instruções de teclado não são necessárias
         * durante a utilização mobile.
         */
        .ajuda {
          display: none !important;
        }
      }
    `;

    gameDocument.head.appendChild(style);

    /*
     * Ajusta a altura do iframe ao tamanho verdadeiro
     * do painel REO DASH.
     */
    const mesa =
      gameDocument.querySelector<HTMLElement>('.mesa');

    if (mesa && typeof ResizeObserver !== 'undefined') {
      resizeObserverRef.current = new ResizeObserver(() => {
        updateMobileIframeHeight();
      });

      resizeObserverRef.current.observe(mesa);
    }

    /*
     * Esperamos que os estilos tenham sido aplicados
     * antes da primeira medição.
     */
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        updateMobileIframeHeight();
      });
    });

    /*
     * As fontes Google podem alterar alguns píxeis
     * quando terminam de carregar.
     */
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
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Alguns browsers móveis não necessitam de pointer capture.
    }

    dispatchGameKey('keydown', 'Space', ' ');
  };

  const endJump = (
    event: React.PointerEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();

    dispatchGameKey('keyup', 'Space', ' ');
  };

  const roll = (
    event: React.PointerEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();

    dispatchGameKey('keydown', 'ShiftLeft', 'Shift');
    dispatchGameKey('keyup', 'ShiftLeft', 'Shift');
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
      onContextMenu={preventReactNativeInteraction}
      onDragStart={preventReactNativeInteraction}
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

      {/* CONTROLOS MÓVEIS */}
      <div
        className="
          fixed
          left-0
          right-0
          z-[70]
          flex
          items-end
          justify-between
          px-5
          pointer-events-none
          select-none
          sm:hidden
        "
        style={{
          ...noSelectStyle,
          bottom:
            'calc(env(safe-area-inset-bottom, 0px) + 18px)',
        }}
      >
        {/* ROLAR — esquerda */}
        <button
          type="button"
          aria-label="Rolar"
          onPointerDown={roll}
          onContextMenu={preventReactNativeInteraction}
          onDragStart={preventReactNativeInteraction}
          style={gameButtonStyle}
          className="
            pointer-events-auto
            flex
            h-[88px]
            w-[88px]
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
          onContextMenu={preventReactNativeInteraction}
          onDragStart={preventReactNativeInteraction}
          style={gameButtonStyle}
          className="
            pointer-events-auto
            flex
            h-[88px]
            w-[88px]
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
