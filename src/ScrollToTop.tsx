import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const location = useLocation();

  useLayoutEffect(() => {
    // Force scroll on window
    window.scrollTo(0, 0);

    // Also force scroll inside main container
    const main = document.querySelector('main');
    if (main) {
      main.scrollTop = 0;
    }
  }, [location.pathname]);

  return null;
};

export default ScrollToTop;
