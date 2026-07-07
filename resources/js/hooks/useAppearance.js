import { useState, useEffect, useCallback } from 'react';

function getTimeMode() {
  const h = new Date().getHours();
  return h >= 6 && h < 19 ? 'day' : 'night';
}

const STORAGE_KEY = 'appearance';

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {};
}

function saveSettings(settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function useAppearance() {
  const saved = loadSettings();

  const [palette, setPaletteState] = useState(saved.palette || 'adulto');
  const [modeSetting, setModeSetting] = useState(saved.mode || 'auto');
  const [fontSize, setFontSizeState] = useState(saved.fontSize || 'normal');
  const [contrast, setContrastState] = useState(saved.contrast || 'normal');
  const [timeMode, setTimeMode] = useState(getTimeMode);

  const isDark = modeSetting === 'auto' ? timeMode === 'night' : modeSetting === 'night';

  const setPalette = useCallback((v) => {
    setPaletteState(v);
    saveSettings({ palette: v, mode: modeSetting, fontSize, contrast });
  }, [modeSetting, fontSize, contrast]);

  const setMode = useCallback((v) => {
    setModeSetting(v);
    saveSettings({ palette, mode: v, fontSize, contrast });
  }, [palette, fontSize, contrast]);

  const setFontSize = useCallback((v) => {
    setFontSizeState(v);
    saveSettings({ palette, mode: modeSetting, fontSize: v, contrast });
  }, [palette, modeSetting, contrast]);

  const setContrast = useCallback((v) => {
    setContrastState(v);
    saveSettings({ palette, mode: modeSetting, fontSize, contrast: v });
  }, [palette, modeSetting, fontSize]);

  const toggleDark = useCallback(() => {
    if (modeSetting === 'auto') {
      setMode('night');
    } else {
      setMode(modeSetting === 'night' ? 'day' : 'night');
    }
  }, [modeSetting, setMode]);

  useEffect(() => {
    const interval = setInterval(() => setTimeMode(getTimeMode()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-palette', palette);
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.setAttribute('data-font-size', fontSize);
    document.documentElement.setAttribute('data-contrast', contrast);
  }, [palette, isDark, fontSize, contrast]);

  return { palette, modeSetting, fontSize, contrast, isDark, setPalette, setMode, setFontSize, setContrast, toggleDark };
}
