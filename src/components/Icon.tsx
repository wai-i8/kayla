import type { SVGProps } from 'react';

export type IconName =
  | 'home'
  | 'records'
  | 'plus'
  | 'book'
  | 'calendar'
  | 'settings'
  | 'logout'
  | 'bottle'
  | 'nappy'
  | 'temperature'
  | 'moon'
  | 'medicine'
  | 'weight'
  | 'note'
  | 'clock'
  | 'search'
  | 'shield'
  | 'alert'
  | 'chevron'
  | 'trash'
  | 'check'
  | 'user'
  | 'close'
  | 'edit'
  | 'camera'
  | 'image';

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 22, ...props }: IconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    ...props,
  };

  const paths: Record<IconName, React.ReactNode> = {
    home: <><path d="m3 11 9-8 9 8"/><path d="M5.5 9.5V21h13V9.5"/><path d="M9.5 21v-7h5v7"/></>,
    records: <><path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.08V21h-4v-.09A1.7 1.7 0 0 0 8.55 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.08-.4H3v-4h.09A1.7 1.7 0 0 0 4.6 8.55a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.08V3h4v.09A1.7 1.7 0 0 0 15.45 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.14.37.37.7.68.94.3.24.68.38 1.08.4H21v4h-.09A1.7 1.7 0 0 0 19.4 15Z"/></>,
    logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/></>,
    bottle: <><path d="M9 2h6M10 5h4M9 5v3l-2 3v8a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-8l-2-3V5"/><path d="M8 13h8M8 17h5"/></>,
    nappy: <><path d="M4 6c2 1.5 3.2 3.4 3.5 5.6.4 2.7 2 4.4 4.5 4.4s4.1-1.7 4.5-4.4C16.8 9.4 18 7.5 20 6v9.5c0 3-2.4 5.5-5.5 5.5h-5C6.4 21 4 18.5 4 15.5Z"/><path d="M4 9h3M17 9h3"/></>,
    temperature: <><path d="M14 14.76V5a4 4 0 0 0-8 0v9.76a6 6 0 1 0 8 0Z"/><path d="M10 9v8"/></>,
    moon: <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7Z"/>,
    medicine: <><path d="m10.5 20.5-7-7a4.95 4.95 0 0 1 7-7l7 7a4.95 4.95 0 0 1-7 7Z"/><path d="m8.5 11.5 4-4"/></>,
    weight: <><path d="M5 8h14l2 13H3Z"/><path d="M9 8a3 3 0 0 1 6 0M12 12v3"/></>,
    note: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h6"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>,
    alert: <><path d="M10.3 3.7 2.4 18a2 2 0 0 0 1.75 3h15.7a2 2 0 0 0 1.75-3L13.7 3.7a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/></>,
    chevron: <path d="m9 18 6-6-6-6"/>,
    trash: <><path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v5M14 11v5"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    close: <path d="M18 6 6 18M6 6l12 12"/>,
    edit: <><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/></>,
    camera: <><path d="M14.5 5 13 3h-2L9.5 5H5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Z"/><circle cx="12" cy="12.5" r="4"/></>,
    image: <><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9" r="1.5"/><path d="m4 17 4.5-4 3.5 3 2.5-2 5.5 5"/></>,
  };

  return <svg {...common}>{paths[name]}</svg>;
}
