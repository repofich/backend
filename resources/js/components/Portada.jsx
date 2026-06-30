export default function Portada({ titulo, autores, carrera, tutor, año, compact }) {
  if (compact) {
    return (
      <>
        <img src="/logo.png" alt="" className="w-5 sm:w-6 md:w-8 mb-0.5 opacity-70" />
        <p className="text-card-value text-[8px] sm:text-[9px] md:text-[11px] leading-tight line-clamp-3 font-semibold">
          {titulo}
        </p>
        <p className="text-card-label text-[6px] sm:text-[7px] md:text-[9px] mt-auto">
          {autores} · {año}
        </p>
      </>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-800 flex flex-col items-center text-center md:sticky md:top-0 md:max-h-screen md:overflow-y-auto">
      <div className="w-full flex flex-col items-center gap-5 aspect-[17/22] justify-center p-6 md:p-5">
        <p className="text-neutral-600 dark:text-neutral-400 text-[11px] uppercase tracking-[0.15em] font-semibold leading-tight">
          Universidad Autónoma Gabriel René Moreno
        </p>

        <div className="w-16 h-20 flex items-center justify-center">
          <img
            src="/logo.png"
            alt="Escudo UAGRM"
            className="max-w-full max-h-full object-contain"
          />
        </div>

        <h1 className="text-neutral-800 dark:text-neutral-100 text-xs sm:text-sm font-bold leading-snug uppercase">
          {titulo}
        </h1>

        <div className="w-10 h-px bg-neutral-300 dark:bg-neutral-500" />

        <div className="space-y-1">
          <p className="text-neutral-700 dark:text-neutral-200 text-sm font-semibold">
            {autores}
          </p>
          <p className="text-neutral-500 dark:text-neutral-400 text-xs">
            {carrera}
          </p>
        </div>

        {tutor && (
          <p className="text-neutral-600 dark:text-neutral-300 text-xs">
            <span className="text-neutral-500 dark:text-neutral-400">Docente: </span>
            {tutor}
          </p>
        )}

        <p className="text-neutral-500 dark:text-neutral-400 text-xs font-semibold">
          {año}
        </p>
      </div>
    </div>
  );
}
