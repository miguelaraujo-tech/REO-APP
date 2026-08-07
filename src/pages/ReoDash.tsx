import React, { useRef } from 'react';
import reoDashHtml from '../games/reo-dash.html?raw';

const ReoDash: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

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
      }

      html,
      body {
        overscroll-behavior: none;
      }

      /*
       * No telemóvel o salto passa a ser feito pelo botão SALTAR.
       * O canvas deixa de receber toques, evitando seleção/interação
       * acidental com a página.
       */
      #game {
        pointer-events: none !important;
        -webkit-user-drag: none !important;
        user-drag: none !important;
      }

      /*
       * Escondemos o botão móvel ROLAR original do HTML.
       * A interface REO apresenta agora os dois controlos
       * SALTAR e ROLAR de forma consistente.
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
          margin-bottom: 8px !important;
        }

        .consola {
          gap: 6px !important;
          margin-bottom: 8px !important;
        }

        .mod {
          padding: 7px 8px !important;
        }

        canvas#game {
          width: 100% !important;
          max-width: none !important;
          border-radius: 10px !important;
        }

        .comandos {
          margin-top: 8px !important;
        }

        /*
         * No telemóvel os controlos ficam visíveis nos dois
         * botões grandes, portanto estas instruções de teclado
         * deixam de ocupar espaço útil.
         */
        .ajuda {
          display: none !important;
        }
      }
    `;

    gameDocument.head.appendChild(style);
  };

  const startJump = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();

    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Alguns browsers móveis não necessitam de pointer capture.
    }

    dispatchGameKey('keydown', 'Space', ' ');
  };

  const endJump = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    dispatchGameKey('keyup', 'Space', ' ');
  };

  const roll = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();

    dispatchGameKey('keydown', 'ShiftLeft', 'Shift');
    dispatchGameKey('keyup', 'ShiftLeft', 'Shift');
  };

  return (
    <section
      className="
        relative
        -mx-4
        -mt-6
        -mb-6
        w-[calc(100%+2rem)]
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
          sm:hidden
        "
        style={{
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 18px)',
        }}
      >
        <button
          type="button"
          aria-label="Saltar"
          onPointerDown={startJump}
          onPointerUp={endJump}
          onPointerCancel={endJump}
          className="
            pointer-events-auto
            flex
            h-[88px]
            w-[88px]
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
          Saltar
        </button>

        <button
          type="button"
          aria-label="Rolar"
          onPointerDown={roll}
          className="
            pointer-events-auto
            flex
            h-[88px]
            w-[88px]
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
          Rolar
        </button>
      </div>
    </section>
  );
};

export default React.memo(ReoDash);
