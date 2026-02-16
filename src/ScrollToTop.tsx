import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    // Imediato
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    const main = document.querySelector("main");
    if (main) main.scrollTop = 0;

    // Reforço para conteúdo que carrega depois (imagens, fonts, animações)
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      if (main) main.scrollTop = 0;
    }, 50); // 50-100ms costuma bastar

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
