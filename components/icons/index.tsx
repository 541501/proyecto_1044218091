/**
 * ClassSport · Iconografía
 * Set de iconos inline en estilo línea fina (1.5px), redondeados, 24×24.
 * Coherentes con la identidad editorial académica.
 */
import * as React from 'react';

type IconProps = React.SVGProps<SVGSVGElement> & { size?: number };

const base = (extra: React.SVGProps<SVGSVGElement> = {}) => ({
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  ...extra,
});

function make(path: React.ReactNode) {
  const Icon = ({ size = 20, ...props }: IconProps) => (
    <svg {...base(props)} width={size} height={size}>
      {path}
    </svg>
  );
  Icon.displayName = 'Icon';
  return Icon;
}

export const IconBuilding = make(
  <>
    <path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" />
    <path d="M16 11h2a2 2 0 0 1 2 2v8" />
    <path d="M3 21h18" />
    <path d="M8 7h2M8 11h2M8 15h2" />
  </>,
);

export const IconColumns = make(
  <>
    <rect x="3.5" y="3.5" width="5" height="17" rx="0.5" />
    <rect x="10" y="3.5" width="4" height="17" rx="0.5" />
    <rect x="15.5" y="3.5" width="5" height="17" rx="0.5" />
  </>,
);

export const IconDoorway = make(
  <>
    <path d="M4 21V4a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v17" />
    <path d="M3 21h18" />
    <circle cx="15" cy="13" r="0.6" fill="currentColor" />
  </>,
);

export const IconCalendar = make(
  <>
    <rect x="3.5" y="5" width="17" height="15.5" rx="1.5" />
    <path d="M8 3v4M16 3v4M3.5 10h17" />
  </>,
);

export const IconCalendarPlus = make(
  <>
    <rect x="3.5" y="5" width="17" height="15.5" rx="1.5" />
    <path d="M8 3v4M16 3v4M3.5 10h17" />
    <path d="M12 13v5M9.5 15.5h5" />
  </>,
);

export const IconClock = make(
  <>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </>,
);

export const IconUser = make(
  <>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20c1.2-3.6 4-5 7-5s5.8 1.4 7 5" />
  </>,
);

export const IconUsers = make(
  <>
    <circle cx="9" cy="8" r="3" />
    <path d="M3.5 20c1-3 3.2-4.2 5.5-4.2S13.5 17 14.5 20" />
    <circle cx="17" cy="9" r="2.5" />
    <path d="M15 14.5c1.3-.4 2.5-.4 3.5 0 1.5.6 2 2 2.2 3.5" />
  </>,
);

export const IconShield = make(
  <>
    <path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6l8-3z" />
    <path d="M9 12l2 2 4-4" />
  </>,
);

export const IconBookOpen = make(
  <>
    <path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5" />
    <path d="M12 6.5C14 5 17 4.5 20.5 5v13c-3.5-.5-6.5 0-8.5 1.5" />
    <path d="M12 6.5v13" />
  </>,
);

export const IconChart = make(
  <>
    <path d="M3 21h18" />
    <rect x="5" y="13" width="3" height="7" />
    <rect x="10.5" y="9" width="3" height="11" />
    <rect x="16" y="5" width="3" height="15" />
  </>,
);

export const IconClipboard = make(
  <>
    <rect x="6" y="5" width="12" height="16" rx="1.5" />
    <path d="M9 5V3.5A1 1 0 0 1 10 2.5h4a1 1 0 0 1 1 1V5" />
    <path d="M9 11h6M9 14.5h6M9 18h4" />
  </>,
);

export const IconCheck = make(<path d="M5 12.5 10 17.5 19 7" />);

export const IconX = make(<path d="M6 6l12 12M18 6L6 18" />);

export const IconAlert = make(
  <>
    <path d="M12 3 2.5 20h19L12 3z" />
    <path d="M12 10v5" />
    <circle cx="12" cy="17.5" r="0.6" fill="currentColor" />
  </>,
);

export const IconInfo = make(
  <>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 11v5.5" />
    <circle cx="12" cy="8" r="0.6" fill="currentColor" />
  </>,
);

export const IconChevronLeft = make(<path d="M14.5 6 9 12l5.5 6" />);
export const IconChevronRight = make(<path d="M9.5 6 15 12l-5.5 6" />);
export const IconChevronDown = make(<path d="M6 9.5 12 15l6-5.5" />);
export const IconArrowRight = make(
  <>
    <path d="M4 12h15" />
    <path d="M13 6l6 6-6 6" />
  </>,
);

export const IconPlus = make(
  <>
    <path d="M12 5v14M5 12h14" />
  </>,
);

export const IconPencil = make(
  <>
    <path d="M4 20.5h4.5L19 10 14 5 3.5 15.5l.5 5z" />
    <path d="M13 6l5 5" />
  </>,
);

export const IconTrash = make(
  <>
    <path d="M4.5 7h15" />
    <path d="M9 4.5h6M6.5 7l1 13a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1l1-13" />
    <path d="M10 11v6M14 11v6" />
  </>,
);

export const IconSettings = make(
  <>
    <circle cx="12" cy="12" r="2.5" />
    <path d="M19 12a7 7 0 0 0-.1-1.1l1.5-1.2-2-3.4-1.8.7a7 7 0 0 0-1.9-1.1l-.3-1.9h-4l-.3 1.9a7 7 0 0 0-1.9 1.1l-1.8-.7-2 3.4 1.5 1.2A7 7 0 0 0 5 12c0 .4 0 .8.1 1.1l-1.5 1.2 2 3.4 1.8-.7a7 7 0 0 0 1.9 1.1l.3 1.9h4l.3-1.9a7 7 0 0 0 1.9-1.1l1.8.7 2-3.4-1.5-1.2c.1-.3.1-.7.1-1.1z" />
  </>,
);

export const IconLogout = make(
  <>
    <path d="M9 20.5H5a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1h4" />
    <path d="M16 8l4 4-4 4" />
    <path d="M8 12h12" />
  </>,
);

export const IconKey = make(
  <>
    <circle cx="8" cy="15" r="4" />
    <path d="M11 12l9-9M16 5l3 3M14 7l3 3" />
  </>,
);

export const IconDocument = make(
  <>
    <path d="M6 3.5h8l5 5V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1z" />
    <path d="M14 3.5V9h5" />
    <path d="M8.5 13h6M8.5 16.5h6" />
  </>,
);

export const IconDownload = make(
  <>
    <path d="M12 4v11" />
    <path d="M7 10l5 5 5-5" />
    <path d="M4 20h16" />
  </>,
);

export const IconSearch = make(
  <>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M16 16l4 4" />
  </>,
);

export const IconFilter = make(
  <>
    <path d="M4 5h16l-6.2 8v6L10 21v-8L4 5z" />
  </>,
);

export const IconMenu = make(
  <>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </>,
);

export const IconSpark = make(
  <>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.5 5.5l2.8 2.8M15.7 15.7l2.8 2.8M5.5 18.5l2.8-2.8M15.7 8.3l2.8-2.8" />
  </>,
);

export const IconDot = make(<circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />);

export const IconHash = make(
  <>
    <path d="M9 3 7 21M17 3l-2 18M4 9h16M3 15h16" />
  </>,
);

export const IconArchive = make(
  <>
    <rect x="3.5" y="4" width="17" height="4" rx="0.5" />
    <path d="M5 8v11.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8" />
    <path d="M10 12h4" />
  </>,
);

export const IconLab = make(
  <>
    <path d="M10 3v6.5L4.5 19a1 1 0 0 0 .9 1.5h13.2a1 1 0 0 0 .9-1.5L14 9.5V3" />
    <path d="M8 3h8" />
    <path d="M7 15h10" />
  </>,
);

export const IconMic = make(
  <>
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0" />
    <path d="M12 18v3M9 21h6" />
  </>,
);

export const IconAuditorium = make(
  <>
    <path d="M2 20l10-13 10 13" />
    <path d="M2 20h20" />
    <path d="M8 20v-4h8v4" />
    <circle cx="12" cy="11" r="1" />
  </>,
);

export const IconMonitor = make(
  <>
    <rect x="3" y="4" width="18" height="12" rx="1.5" />
    <path d="M8 20h8M12 16v4" />
  </>,
);
