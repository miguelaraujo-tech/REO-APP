import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const location = useLocation();

  useLayoutEffect(() => {
    // Wait for the new route to render + any layout/animation classes to apply
    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => {
        // Cover iOS/Safari quirks too
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        window.scrollTo(0, 0);
      });

      // cleanup inner RAF
      return () => cancelAnimationFrame(raf2);
    });

    // cleanup outer RAF
    return () => cancelAnimationFrame(raf1);
  }, [location.key]); // key changes on every navigation (best for HashRouter)

  return null;
};

export default ScrollToTop;
