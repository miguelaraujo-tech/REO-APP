import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    // Reset scroll no documento
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Reset scroll no <main> se ele for o container scrollável
    const main = document.querySelector("main");
    if (main) {
      main.scrollTop = 0;
    }
  }, [pathname]);

  return null;
}
