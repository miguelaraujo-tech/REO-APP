import React from "react";

type Props = {
  size?: number; // px
  className?: string;
};

export default function ReoLogo({ size = 96, className = "" }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 256 256"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="REO logo"
    >
      <defs>
        {/* Filtro para dar um leve efeito de profundidade/relevo como na bolacha */}
        <filter id="reoRelief" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.5" result="blur" />
          <feSpecularLighting in="blur" surfaceScale="2" specularConstant="0.8" specularExponent="20" lightingColor="#ffffff" result="light">
            <fePointLight x="128" y="-50" z="100" />
          </feSpecularLighting>
          <feComposite in="light" in2="SourceGraphic" operator="in" result="lightOverlay" />
          <feBlend in="SourceGraphic" in2="lightOverlay" mode="screen" />
        </filter>
      </defs>

      {/* 1. Base da Bolacha (Preto Profundo) */}
      <circle cx="128" cy="128" r="126" fill="#050505" />

      {/* 2. Dentes da Borda (Ridges) - 72 unidades para realismo Oreo */}
      <g fill="#757575">
        {Array.from({ length: 72 }).map((_, i) => {
          const angle = (i * 360) / 72;
          return (
            <rect
              key={i}
              x="126"
              y="5"
              width="4"
              height="14"
              rx="2"
              transform={`rotate(${angle} 128 128)`}
            />
          );
        })}
      </g>

      {/* 3. Círculo Pontilhado Interno */}
      <g fill="#757575" opacity="0.6">
        {Array.from({ length: 60 }).map((_, i) => {
          const a = (i / 60) * Math.PI * 2;
          const x = 128 + Math.cos(a) * 102;
          const y = 128 + Math.sin(a) * 102;
          return <circle key={i} cx={x} cy={y} r="1.5" />;
        })}
      </g>

      {/* 4. Elipse Central com Efeito Scalloped (Recortes) */}
      <g filter="url(#reoRelief)">
        {/* Contorno da elipse */}
        <ellipse cx="128" cy="132" rx="72" ry="42" fill="none" stroke="#757575" strokeWidth="5" />
        
        {/* Pequenos "folhos" à volta da elipse */}
        {Array.from({ length: 16 }).map((_, i) => {
          const a = (i / 16) * Math.PI * 2;
          const x = 128 + Math.cos(a) * 75;
          const y = 132 + Math.sin(a) * 45;
          return <circle key={i} cx={x} cy={y} r="3.5" fill="#757575" />;
        })}

        {/* Texto REO - Itálico e Negrito como na imagem */}
        <text
          x="128"
          y="146"
          textAnchor="middle"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          fontSize="48"
          fontWeight="900"
          fontStyle="italic"
          fill="#757575"
          style={{ letterSpacing: '1px' }}
        >
          REO
        </text>

        {/* Arcos decorativos acima e abaixo do REO */}
        <path d="M100 115 Q128 108 156 115" fill="none" stroke="#757575" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
        <path d="M100 152 Q128 159 156 152" fill="none" stroke="#757575" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
      </g>

      {/* 5. Antena (Topo) */}
      <g transform="translate(128 72)" fill="none" stroke="#757575" strokeLinecap="round" strokeWidth="5">
        <path d="M0 -18 V12" /> {/* Haste vertical */}
        <path d="M-18 -10 H18" /> {/* Barra topo */}
        <path d="M-12 -2 H12" />  {/* Barra meio */}
        <path d="M-8 6 H8" />    {/* Barra base antena */}
      </g>

      {/* 6. Símbolos Musicais e Elementos (Posições exatas da imagem) */}
      <g fill="#757575" fontFamily="serif" fontWeight="900">
        {/* Notas duplas (Topo Esquerda) */}
        <text x="70" y="85" fontSize="32" transform="rotate(-15 70 85)">♫</text>
        
        {/* Notas simples (Topo Direita) */}
        <text x="182" y="90" fontSize="28" transform="rotate(10 182 90)">♪</text>
        
        {/* Clave de Sol (Base Direita) */}
        <text x="155" y="212" fontSize="38" transform="rotate(-10 155 212)">𝄞</text>
        
        {/* Nota simples (Base Esquerda) */}
        <text x="75" y="195" fontSize="30" transform="rotate(5 75 195)">♪</text>
        
        {/* Hashtags */}
        <text x="108" y="60" fontSize="20" opacity="0.9">#</text>
        <text x="195" y="185" fontSize="24" opacity="0.9">#</text>

        {/* Ondas/Símbolos de vibração */}
        <text x="48" y="145" fontSize="34" opacity="0.7" transform="rotate(90 48 145)">~</text>
        <text x="208" y="155" fontSize="30" opacity="0.7" transform="rotate(-90 208 155)">~</text>
      </g>

      {/* 7. Ornamento em V (Base) */}
      <path
        d="M118 190 L128 200 L138 190"
        fill="none"
        stroke="#757575"
        strokeWidth="4"
        strokeLinecap="round"
        // Corrected from strokeJoin to strokeLinejoin for React SVG props compatibility
        strokeLinejoin="round"
      />
      <circle cx="128" cy="208" r="2.5" fill="#757575" />

      {/* 8. Pontos de Textura Aleatórios (como na bolacha real) */}
      {[ [88,115], [175,75], [55,175], [215,125], [145,55], [115,220] ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2" fill="#757575" opacity="0.3" />
      ))}
    </svg>
  );
}
