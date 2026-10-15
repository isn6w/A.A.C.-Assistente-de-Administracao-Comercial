'use client';

import { useEffect, useState } from 'react';
import { applyAccentColor, DEFAULT_ACCENT_COLOR } from '@/lib/appearance';

export default function AccentColorPicker() {
  const [color, setColor] = useState(DEFAULT_ACCENT_COLOR);

  useEffect(() => {
    const savedColor = window.localStorage.getItem('aac-accent-color');
    if (savedColor && /^#[\da-f]{6}$/i.test(savedColor)) {
      setColor(savedColor);
      applyAccentColor(savedColor);
      return;
    }
  }, []);

  function changeColor(value: string) {
    setColor(value);
    applyAccentColor(value);
    window.localStorage.setItem('aac-accent-color', value);
  }

  function resetColor() {
    changeColor(DEFAULT_ACCENT_COLOR);
  }

  return (
    <div className="accent-picker">
      <label htmlFor="aacAccentColor">Cor de destaque</label>
      <div className="accent-picker-control">
        <input
          id="aacAccentColor"
          type="color"
          value={color}
          onChange={event => changeColor(event.target.value)}
          aria-describedby="accentColorDescription"
        />
        <output htmlFor="aacAccentColor">{color.toUpperCase()}</output>
        <button className="button button-secondary" type="button" onClick={resetColor}>Restaurar azul</button>
      </div>
      <p id="accentColorDescription">A cor escolhida será aplicada aos destaques e botões e ficará salva neste navegador.</p>
    </div>
  );
}
