import { useEffect, useState } from 'react';

export default function Header({ children }) {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 bg-bg-header transition-all duration-300 ${
        compact
          ? 'px-4 sm:px-[45px] py-2 sm:py-3 shadow-md'
          : 'px-4 sm:px-[45px] py-4 sm:py-[32px]'
      }`}
    >
      <div className="flex justify-between items-center gap-3 sm:gap-0">
        <div className="flex items-center gap-3 sm:gap-[18px]">
          <img
            src="/logo.png"
            alt="Logo FICH"
            className={`object-contain transition-all duration-300 ${
              compact ? 'w-[35px] sm:w-[50px]' : 'w-[50px] sm:w-[85px]'
            }`}
          />
          <div>
            <h1
              className={`m-0 text-text-primary font-[400] leading-[1.1] transition-all duration-300 ${
                compact
                  ? 'text-[14px] sm:text-[18px] md:text-[22px]'
                  : 'text-[16px] sm:text-[22px] md:text-[28px]'
              }`}
            >
              Repositorio Institucional
            </h1>
            <h2
              className={`m-0 text-text-primary font-[400] leading-[1.1] transition-all duration-300 overflow-hidden ${
                compact
                  ? 'max-h-0 mt-0 text-[0px] opacity-0'
                  : 'max-h-8 mt-[2px] text-[16px] sm:text-[22px] md:text-[28px] opacity-100'
              }`}
            >
              Facultad Integral del Chaco
            </h2>
            <p
              className={`text-text-secondary transition-all duration-300 overflow-hidden ${
                compact
                  ? 'max-h-0 mt-0 text-[0px] opacity-0'
                  : 'mt-[2px] sm:mt-[6px] text-[11px] sm:text-[14px] md:text-[16px] opacity-100'
              }`}
            >
              Universidad Autonoma Gabriel Rene Moreno
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {children}
        </div>
      </div>
    </header>
  );
}
