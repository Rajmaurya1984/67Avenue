// WindowView page data (nav "WindowView" -> /plan): the typical floor plan
// that fills the stage, the eye hotspot on it, and the floors behind the eye.
//
// Images live in public/ and are referenced by URL (never imported), so Vite
// serves them as-is with stable, predictable paths: 
//   public/assets/plan/floor/floorPlan.png   -> /assets/plan/floor/floorPlan.png
//   public/assets/windowView/<name>.jpg      -> /assets/windowView/<name>.jpg
// Each direction has its own day, evening, and night panorama for every floor.

export const FLOOR_PLAN_IMAGE = '/assets/plan/floor/floorPlan-web.webp'
// any screen size. Adjust these two numbers to reposition it.
// The drawing only fills y 19.94%..82.79% of the image, and the plan page
// crops the transparent margins, so `bottom` has to stay above 17.24% to sit
// on the plan itself rather than on empty margin.
export const EYE_HOTSPOT = { left: 29, bottom: 10 }

// North is on Wing A's right side; positions use the full image coordinates.
export const WINDOW_VIEW_DIRECTIONS = [
  { id: 'north', label: 'North', left: 91, top: 51 },
  { id: 'south', label: 'South', left: 9, top: 51 },
 // { id: 'east', label: 'East', left: 50, top: 86 },
  { id: 'west', label: 'West', left: 50, top: 13 },
]

// Filename stems match the supplied floor_time_direction WebP images.
export const WINDOW_VIEW_FLOORS = [
  { id: 'terrace', menu: 'Terrace', label: 'TERRACE', fileStem: 'Terrace Floor' },
  { id: 'floor-18', menu: '18', label: '18TH FLOOR', fileStem: '18th Floor' },
  { id: 'floor-13', menu: '13', label: '13TH FLOOR', fileStem: '13th Floor' },
  { id: 'floor-8', menu: '8', label: '8TH FLOOR', fileStem: '8th Floor' },
  { id: 'floor-5', menu: '5', label: '5TH FLOOR', fileStem: '5th Floor (AMENITY)' },
]

export const DEFAULT_VIEW_ID = 'terrace'
export const WINDOW_VIEW_TIMES = [
  { id: 'day', label: 'Day', fileToken: 'Day' },
  { id: 'evening', label: 'Evening', fileToken: 'Eve' },
  { id: 'night', label: 'Night', fileToken: 'Night' },
]

export const WINDOW_VIEW_DIRECTION_ASSETS = Object.fromEntries(
  WINDOW_VIEW_DIRECTIONS.map(({ id: direction, label }) => [direction,
    Object.fromEntries(WINDOW_VIEW_FLOORS.map((floor) => [floor.id,
      Object.fromEntries(WINDOW_VIEW_TIMES.map(({ id: time, fileToken }) => {
        const image = `/assets/windowView/${floor.fileStem}_${fileToken}_${label}.webp`
        return [time, { image, preview: image }]
      })),
    ])),
  ]),
)

export function getWindowViewAssets(floor, time, direction = 'north') {
  return WINDOW_VIEW_DIRECTION_ASSETS[direction]?.[floor.id]?.[time] ?? null
}

