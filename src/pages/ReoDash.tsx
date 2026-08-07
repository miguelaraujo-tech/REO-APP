import React, { useEffect, useRef } from 'react';
import reoDashHtml from '../games/reo-dash.html?raw';

const ReoDash: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  /*
   * Enquanto o REO DASH está aberto, impede a seleção nativa,
   * o menu de long-press e o arrastar de elementos no documento
   * principal da PWA.
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

  const handleGameLoad = () => {
    const gameDocument = iframeRef.current?.contentDocument;

    if (!gameDocument) return;

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
     * Ajustes exclusivamente para a integração móvel na REO.
     * Não altera física, pontuação, obstáculos ou lógica do jogo.
     */
    const style = gameDocument.createElement('style');

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
       * O canvas deixa de receber toques.
       */
      #game {
        pointer-events: none !important;
        -webkit-user-drag: none !important;
        user-drag: none !important;
        -webkit-touch-callout: none !important;
        -webkit-tap-highlight-color: transparent !important;
      }

      /*
       * Esconde o botão ROLAR original do HTML.
       * A REO fornece os dois controlos externos.
       */
      #dash {
        display: none !important;
      }

      @media (max-width: 600px) {
        html,
        body {
          width: 100% !important;
          min-height: 100% !important;
        }

        body {
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
          margin-bottom: 7px !important;
        }

        /*
         * PAINEL DE ESTATÍSTICAS MOBILE
         *
         * As quatro caixas passam de uma grelha 2x2
         * para uma única linha compacta de 4 caixas.
         */
        .consola {
          display: grid !important;
          grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
          gap: 4px !important;
          margin-bottom: 6px !important;
        }

        .mod {
          min-width: 0 !important;
          padding: 5px 4px !important;
          border-radius: 7px !important;
        }

        .mod label {
          margin-bottom: 2px !important;
          font-size: 0.38rem !important;
          letter-spacing: 0.07em !important;
          line-height: 1.1 !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
        }

        .mod output {
          font-size: 0.85rem !important;
          line-height: 1.05 !important;
        }

        .nota {
          margin-top: 3px !important;
          font-size: 0.36rem !important;
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
        className="
          block
          w-full
          h-[700px]
          sm:h-[700px]
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
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 18px)',
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
