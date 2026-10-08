import { createElement } from 'react';
import { ICON_SVG_ATTRS, ICONS, type IconName } from '../lib/icons';

export type { IconName };

const SVG_PROPS = {
  xmlns: ICON_SVG_ATTRS.xmlns,
  viewBox: ICON_SVG_ATTRS.viewBox,
  fill: ICON_SVG_ATTRS.fill,
  stroke: ICON_SVG_ATTRS.stroke,
  strokeWidth: ICON_SVG_ATTRS['stroke-width'],
  strokeLinecap: ICON_SVG_ATTRS['stroke-linecap'],
  strokeLinejoin: ICON_SVG_ATTRS['stroke-linejoin'],
} as const;

/**
 * Linien-Icon (lib/icons.ts) in Textgröße und -farbe. Ohne `label` rein dekorativ (aria-hidden) – der Text daneben trägt die
 * Bedeutung; mit `label` (Icon allein auf einem Knopf) bekommt es role="img" und einen Namen.
 */
export function Icon({ name, label, className }: { name: IconName; label?: string; className?: string }) {
  return (
    <svg
      {...SVG_PROPS}
      className={className ? `icon ${className}` : 'icon'}
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true, focusable: false })}
    >
      {ICONS[name].map(([tag, attrs], i) => createElement(tag, { key: i, ...attrs }))}
    </svg>
  );
}
