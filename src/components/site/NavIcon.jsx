// Inline SVG icon set for the site — no icon-font dependency.
// Every icon is a 24×24 stroked drawing that inherits currentColor, so callers
// control colour through text colour alone. Used by the bottom pill dock
// (NAV_MENU), the page pager, and the Location landmark categories.

const ICONS = {
  home: (
    <>
      <path d="M3.5 10.9 12 3.8l8.5 7.1" />
      <path d="M5.8 9.6V20.2h12.4V9.6" />
      <path d="M9.6 20.2v-5.6h4.8v5.6" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21c4.5-4.7 6.6-8 6.6-10.9A6.6 6.6 0 0 0 5.4 10.1C5.4 13 7.5 16.3 12 21Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  sparkle: (
    <>
      <path d="M11 3.5c.6 4.4 2.6 6.4 7 7-4.4.6-6.4 2.6-7 7-.6-4.4-2.6-6.4-7-7 4.4-.6 6.4-2.6 7-7Z" />
      <path d="M18.5 3.8l.6 1.7 1.7.6-1.7.6-.6 1.7-.6-1.7-1.7-.6 1.7-.6.6-1.7Z" />
    </>
  ),
  grid: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </>
  ),
  medal: (
    <>
      <circle cx="12" cy="8.8" r="4.8" />
      <path d="M8.6 12.9 7.2 20.8l4.8-2.4 4.8 2.4-1.4-7.9" />
    </>
  ),
  'chevron-left': <path d="M14 6 8 12l6 6" />,
  'chevron-right': <path d="M10 6l6 6-6 6" />,
  // WindowView floor plan: the eye hotspot that opens the window view.
  eye: (
    <>
      <path d="M2 12c3-6.5 17-6.5 20 0-3 6.5-17 6.5-20 0Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  // Location panel categories (see LOCATION_CATEGORIES in data/location.js).
  train: (
    <>
      <rect x="5" y="3.5" width="14" height="13" rx="3.2" />
      <path d="M5 10.4h14" />
      <path d="M9.6 16.5 7.6 20.5M14.4 16.5l2 4" />
      <path d="M7 20.5h10" />
      <path d="M9.3 13.4h1.4M13.3 13.4h1.4" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3.5" y="7.6" width="17" height="12" rx="2.2" />
      <path d="M9.1 7.6V5.7a1.7 1.7 0 0 1 1.7-1.7h2.4a1.7 1.7 0 0 1 1.7 1.7v1.9" />
      <path d="M3.5 12.5h17" />
      <path d="M10.8 12.5h2.4" />
    </>
  ),
  bridge: (
    <>
      <path d="M3 18h18" />
      <path d="M4.6 18v-5.1a7.4 7.4 0 0 1 14.8 0V18" />
      <path d="M9 18v-6.6M15 18v-6.6" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3.4 19 5.9v5.5c0 4.3-2.9 7.4-7 9.2-4.1-1.8-7-4.9-7-9.2V5.9Z" />
      <path d="M9.2 11.9 11.4 14l3.5-3.7" />
    </>
  ),
  cross: (
    <>
      <rect x="4.2" y="4.2" width="15.6" height="15.6" rx="4.2" />
      <path d="M12 8.7v6.6M8.7 12h6.6" />
    </>
  ),
  cap: (
    <>
      <path d="M2.8 9.5 12 5.3l9.2 4.2-9.2 4.2Z" />
      <path d="M6.7 11.4v4c0 1.5 2.4 2.7 5.3 2.7s5.3-1.2 5.3-2.7v-4" />
      <path d="M20.6 10.1v4.8" />
    </>
  ),
  road: (
    <>
      <path d="M6.6 20.5 9.7 3.5M17.4 20.5 14.3 3.5" />
      <path d="M12 5v2.6M12 10.7v2.6M12 16.4V19" />
    </>
  ),
  bag: (
    <>
      <path d="M5.2 7.6h13.6l-1.1 12a1.7 1.7 0 0 1-1.7 1.5H8a1.7 1.7 0 0 1-1.7-1.5Z" />
      <path d="M9.1 7.6V6a2.9 2.9 0 0 1 5.8 0v1.6" />
    </>
  ),
}

export default function NavIcon({ name }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {ICONS[name] ?? null}
    </svg>
  )
}