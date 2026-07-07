import { FaSun, FaMoon, FaPalette, FaFont, FaCircle } from 'react-icons/fa';
import { FiMinus, FiPlus } from 'react-icons/fi';

const paletteOptions = [
  { value: 'adulto', label: 'Adulto', color: '#233f99' },
  { value: 'joven', label: 'Joven', color: '#e63946' },
  { value: 'nino', label: 'Niño', color: '#ff9f1c' },
];

const fontSizeOptions = [
  { value: 'normal', label: 'A' },
  { value: 'large', label: 'A+' },
  { value: 'xlarge', label: 'A++' },
];

const modeOptions = [
  { value: 'auto', label: 'Automático' },
  { value: 'day', label: 'Día' },
  { value: 'night', label: 'Noche' },
];

export default function AppearanceDropdown({ appearance }) {
  const { palette, modeSetting, fontSize, contrast, setPalette, setMode, setFontSize, setContrast } = appearance;

  const activePaletteOption = paletteOptions.find((o) => o.value === palette);

  return (
    <div className="px-4 py-3 space-y-4 border-b border-gray-100 dark:border-[#3a3a3a]">
      <div>
        <div className="flex items-center gap-2 text-card-label text-[11px] uppercase tracking-wider font-bold mb-2">
          <FaPalette size={11} />
          Tema
        </div>
        <div className="flex gap-1.5">
          {paletteOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPalette(opt.value)}
              className={`flex-1 h-[32px] rounded-[8px] text-[11px] font-[600] cursor-pointer transition-colors inline-flex items-center justify-center gap-1 ${
                palette === opt.value
                  ? 'bg-primary text-text-on-primary'
                  : 'border border-gray-300 dark:border-[#555] text-card-value hover:bg-gray-50 dark:hover:bg-[#333]'
              }`}
            >
              <FaCircle size={8} style={{ color: opt.color }} />
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 text-card-label text-[11px] uppercase tracking-wider font-bold mb-2">
          {isNightIcon(modeSetting) ? <FaMoon size={11} /> : <FaSun size={11} />}
          Modo {modeSetting === 'auto' ? '(automático)' : modeSetting === 'night' ? 'nocturno' : 'diurno'}
        </div>
        <div className="flex gap-1.5">
          {modeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setMode(opt.value)}
              className={`flex-1 h-[32px] rounded-[8px] text-[11px] font-[600] cursor-pointer transition-colors ${
                modeSetting === opt.value
                  ? 'bg-primary text-text-on-primary'
                  : 'border border-gray-300 dark:border-[#555] text-card-value hover:bg-gray-50 dark:hover:bg-[#333]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 text-card-label text-[11px] uppercase tracking-wider font-bold mb-2">
          <FaFont size={11} />
          Tamaño de letra
        </div>
        <div className="flex gap-1.5 items-center">
          <button
            onClick={() => {
              const idx = fontSizeOptions.findIndex((o) => o.value === fontSize);
              if (idx > 0) setFontSize(fontSizeOptions[idx - 1].value);
            }}
            disabled={fontSize === 'normal'}
            className="h-[32px] w-[32px] rounded-[8px] border border-gray-300 dark:border-[#555] text-card-value cursor-pointer hover:bg-gray-50 dark:hover:bg-[#333] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <FiMinus size={14} />
          </button>
          <div className="flex-1 flex gap-1.5">
            {fontSizeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFontSize(opt.value)}
                className={`flex-1 h-[32px] rounded-[8px] text-[11px] font-[600] cursor-pointer transition-colors ${
                  fontSize === opt.value
                    ? 'bg-primary text-text-on-primary'
                    : 'border border-gray-300 dark:border-[#555] text-card-value hover:bg-gray-50 dark:hover:bg-[#333]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              const idx = fontSizeOptions.findIndex((o) => o.value === fontSize);
              if (idx < fontSizeOptions.length - 1) setFontSize(fontSizeOptions[idx + 1].value);
            }}
            disabled={fontSize === 'xlarge'}
            className="h-[32px] w-[32px] rounded-[8px] border border-gray-300 dark:border-[#555] text-card-value cursor-pointer hover:bg-gray-50 dark:hover:bg-[#333] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <FiPlus size={14} />
          </button>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 text-card-label text-[11px] uppercase tracking-wider font-bold mb-2">
          Contraste
        </div>
        <div className="flex gap-1.5">
          {[
            { value: 'normal', label: 'Normal' },
            { value: 'high', label: 'Alto' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setContrast(opt.value)}
              className={`flex-1 h-[32px] rounded-[8px] text-[11px] font-[600] cursor-pointer transition-colors ${
                contrast === opt.value
                  ? 'bg-primary text-text-on-primary'
                  : 'border border-gray-300 dark:border-[#555] text-card-value hover:bg-gray-50 dark:hover:bg-[#333]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function isNightIcon(mode) {
  if (mode === 'auto') {
    const h = new Date().getHours();
    return h < 6 || h >= 19;
  }
  return mode === 'night';
}
