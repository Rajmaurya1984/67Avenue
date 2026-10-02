// WindowView page data (nav "WindowView" -> /plan): the typical floor plan
// that fills the stage, the eye hotspot on it, and the floors behind the eye.
//
// Images live in public/ and are referenced by URL (never imported), so Vite
// serves them as-is with stable, predictable paths:
//
//   public/assets/plan/floor/floorPlan.png   -> /assets/plan/floor/floorPlan.png
//   public/assets/windowView/<name>.jpg      -> /assets/windowView/<name>.jpg
//
// Day, evening, and night use lightweight previews followed by display images.

export const FLOOR_PLAN_IMAGE = '/assets/plan/floor/floorPlan-web.webp'

// Eye hotspot on the floor plan, in percent of the plan image box (not the
// viewport), so the button stays pinned to the same room of the drawing at
// any screen size. Adjust these two numbers to reposition it.
// The drawing only fills y 19.94%..82.79% of the image, and the plan page
// crops the transparent margins, so `bottom` has to stay above 17.24% to sit
// on the plan itself rather than on empty margin.
export const EYE_HOTSPOT = { left: 29, bottom: 10 }

// The floor menu shown bottom-left once the view opens, in display order.
//   menu   button text in the small floor menu
//   label  full name used in the panorama's alt text
//   image  Day render served to the 360 viewer
export const WINDOW_VIEW_FLOORS = [

  {
    id: 'terrace',
    menu: 'Terrace',
    label: 'TERRACE',
    preview: '/assets/windowView/optimized/terrace-preview.jpg',
    image: '/assets/windowView/optimized/terrace.jpg',
  },
  {
    id: 'floor-18',
    menu: '18',
    label: '18TH FLOOR',
    preview: '/assets/windowView/optimized/floor-18-preview.jpg',
    image: '/assets/windowView/optimized/floor-18.jpg',
  },
  {
    id: 'floor-13',
    menu: '13',
    label: '13TH FLOOR',
    preview: '/assets/windowView/optimized/floor-13-preview.jpg',
    image: '/assets/windowView/optimized/floor-13.jpg',
  },
  {
    id: 'floor-8',
    menu: '8',
    label: '8TH FLOOR',
    preview: '/assets/windowView/optimized/floor-8-preview.jpg',
    image: '/assets/windowView/optimized/floor-8.jpg',
  },
  {
    id: 'floor-5',
    menu: '5',
    label: '5TH FLOOR',
    preview: '/assets/windowView/optimized/floor-5-preview.jpg',
    image: '/assets/windowView/optimized/floor-5.jpg',
  },
]

// The eye always opens on the terrace view first; the menu covers the rest.
export const DEFAULT_VIEW_ID = 'terrace'
export const WINDOW_VIEW_TIMES = [
  { id: 'day', label: 'Day' },
  { id: 'evening', label: 'Evening' },
  { id: 'night', label: 'Night' },
]

export function getWindowViewAssets(floor, time) {
  if (time === 'day') return { image: floor.image, preview: floor.preview }
  const base = '/assets/windowView/optimized/' + floor.id + '-' + time
  return { image: base + '.webp', preview: base + '-preview.webp' }
}
