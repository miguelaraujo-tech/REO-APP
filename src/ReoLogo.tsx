import React from "react";

type Props = {
  size?: number;
  className?: string;
};

const ReoLogo = React.memo(function ReoLogo({ size = 96, className = "" }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 256 256"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="REO logo"
      focusable="false"
    >
      <defs>
        <filter id="reoRelief" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.5" result="blur" />
          <feSpecularLighting
            in="blur"
            surfaceScale="2"
            specularConstant="0.8"
            specularExponent="20"
            lightingColor="#ffffff"
            result="light"
          >
            <fePointLight x="128" y="-50" z="100" />
          </feSpecularLighting>
          <feComposite in="light" in2="SourceGraphic" operator="in" result="lightOverlay" />
          <feBlend in="SourceGraphic" in2="lightOverlay" mode="screen" />
        </filter>
      </defs>

      <circle cx="128" cy="128" r="126" fill="#050505" />

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

      <g fill="#757575" opacity="0.6">
        {Array.from({ length: 60 }).map((_, i) => {
          const a = (i / 60) * Math.PI * 2;
          const x = 128 + Math.cos(a) * 102;
          const y = 128 + Math.sin(a) * 102;
          return <circle key={i} cx={x} cy={y} r="1.5" />;
        })}
      </g>

      <g filter="url(#reoRelief)">
        <ellipse cx="128" cy="132" rx="72" ry="42" fill="none" stroke="#757575" strokeWidth="5" />

        {Array.from({ length: 16 }).map((_, i) => {
          const a = (i / 16) * Math.PI * 2;
          const x = 128 + Math.cos(a) * 75;
          const y = 132 + Math.sin(a) * 45;
          return <circle key={i} cx={x} cy={y} r="3.5" fill="#757575" />;
        })}

        <text
          x="128"
          y="146"
          textAnchor="middle"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          fontSize="48"
          fontWeight="900"
          fontStyle="italic"
          fill="#757575"
          style={{ letterSpacing: "1px" }}
        >
          REO
        </text>

        <path d="M100 115 Q128 108 156 115" fill="none" stroke="#757575" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
        <path d="M100 152 Q128 159 156 152" fill="none" stroke="#757575" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
      </g>

      <g transform="translate(128 72)" fill="none" stroke="#757575" strokeLinecap="round" strokeWidth="5">
        <path d="M0 -18 V12" />
        <path d="M-18 -10 H18" />
        <path d="M-12 -2 H12" />
        <path d="M-8 6 H8" />
      </g>

      <g fill="#757575" fontFamily="serif" fontWeight="900">
        <text x="70" y="85" fontSize="32" transform="rotate(-15 70 85)">♫</text>
        <text x="182" y="90" fontSize="28" transform="rotate(10 182 90)">♪</text>
        <text x="155" y="212" fontSize="38" transform="rotate(-10 155 212)">𝄞</text>
        <text x="75" y="195" fontSize="30" transform="rotate(5 75 195)">♪</text>
        <text x="108" y="60" fontSize="20" opacity="0.9">#</text>
        <text x="195" y="185" fontSize="24" opacity="0.9">#</text>
        <text x="48" y="145" fontSize="34" opacity="0.7" transform="rotate(90 48 145)">~</text>
        <text x="208" y="155" fontSize="30" opacity="0.7" transform="rotate(-90 208 155)">~</text>
      </g>

      <path
        d="M118 190 L128 200 L138 190"
        fill="none"
        stroke="#757575"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="128" cy="208" r="2.5" fill="#757575" />

      {[ [88,115], [175,75], [55,175], [215,125], [145,55], [115,220] ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2" fill="#757575" opacity="0.3" />
      ))}
    </svg>
  );
});

export default ReoLogo;
