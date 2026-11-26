import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Palette } from 'lucide-react';
import {
  THEME_PALETTES,
  type PaletteId,
} from '../../theme/palettes.ts';

interface PaletteSwitcherProps {
  activePaletteId: PaletteId;
  onChangePalette: (id: PaletteId) => void;
  compact?: boolean;
}

export function PaletteSwitcher({
  activePaletteId,
  onChangePalette,
  compact = false,
}: PaletteSwitcherProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const activePalette =
    THEME_PALETTES.find((p) => p.id === activePaletteId) ?? THEME_PALETTES[0];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onOutside);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onOutside);
    };
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Switch UI color palette"
        className={`clinical-btn inline-flex items-center gap-2 rounded-lg border border-[var(--bn-border)] bg-[var(--bn-soft-bg)] text-xs font-medium text-[var(--bn-text)] hover:border-[var(--bn-border-hover)] hover:bg-white ${
          compact ? 'h-9 px-2.5' : 'h-9 px-3'
        }`}
      >
        <Palette className="h-3.5 w-3.5 text-[var(--bn-primary)] shrink-0" aria-hidden="true" />
        <span className="hidden xl:inline whitespace-nowrap">{activePalette.name}</span>
        <span className="flex items-center -space-x-1 shrink-0" aria-hidden="true">
          {activePalette.swatches.map((hex) => (
            <span
              key={hex}
              className="h-3 w-3 rounded-full border border-white shadow-xs"
              style={{ backgroundColor: hex }}
            />
          ))}
        </span>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            role="listbox"
            aria-label="Color palette presets"
            className="absolute right-0 mt-2 w-72 rounded-xl border border-[var(--bn-border)] bg-white p-2 z-50 shadow-[0_18px_42px_rgba(14,50,36,0.14)]"
          >
            <div className="px-2.5 py-1.5 border-b border-[var(--bn-border)] mb-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--bn-primary)]">
                Color Palette Studio
              </p>
              <p className="text-[11px] text-[var(--bn-muted)]">
                Select a luxury clinical theme preset
              </p>
            </div>
            <div className="space-y-1">
              {THEME_PALETTES.map((palette) => {
                const selected = palette.id === activePaletteId;
                return (
                  <button
                    key={palette.id}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => {
                      onChangePalette(palette.id);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors ${
                      selected
                        ? 'bg-[var(--bn-soft-bg)] ring-1 ring-[var(--bn-primary)]/20'
                        : 'hover:bg-[var(--bn-soft-bg)]/70'
                    }`}
                  >
                    <div className="flex items-center -space-x-1.5 shrink-0">
                      {palette.swatches.map((hex) => (
                        <span
                          key={hex}
                          className="h-4 w-4 rounded-full border-2 border-white shadow-xs"
                          style={{ backgroundColor: hex }}
                        />
                      ))}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[var(--bn-text)] truncate">
                        {palette.name}
                      </p>
                      <p className="text-[11px] text-[var(--bn-muted)] truncate">
                        {palette.tagline}
                      </p>
                    </div>
                    {selected ? (
                      <Check
                        className="h-3.5 w-3.5 text-[var(--bn-primary)] shrink-0"
                        aria-hidden="true"
                      />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
