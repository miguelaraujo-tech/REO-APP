import React from 'react';
import reoDashHtml from '../games/reo-dash.html?raw';

const ReoDash: React.FC = () => {
  return (
    <section className="w-full">
      <iframe
        title="REO Dash"
        srcDoc={reoDashHtml}
        className="block w-full h-[640px] sm:h-[700px] md:h-[780px] rounded-[1.75rem] border border-amber-500/25 bg-[#0b0908] shadow-[0_0_40px_rgba(245,158,11,0.08)]"
        allow="autoplay"
      />
    </section>
  );
};

export default React.memo(ReoDash);
