const ROOT = '/assets/plan/2bhk/Flat_No_03_'
// Each panorama has its own azimuth. Anchor a visible feature to a plan axis:
// u is its horizontal position in the original equirectangular image (0..1),
// heading is clockwise from the top of the plan. These are visual calibrations.
export const FLAT_THREE_RADAR_ANCHORS = {
  living: { u: .467, heading: 0 }, // Balcony, above the living room.
  passage: { u: .5, heading: 180 }, // Kitchen opening, below the passage.
  kitchen: { u: .54, heading: 180 }, // Hob on the bottom wall.
  'bedroom-1': { u: .714, heading: 0 }, // Window on the top wall.
  'bedroom-2': { u: .456, heading: 0 }, // Window on the top wall.
  'bathroom-1': { u: .845, heading: 0 }, // Door back toward Bedroom 1.
  'bathroom-2': { u: 0, heading: 270 }, // Door back toward Bedroom 2.
}

export function flatThreeRadarHeading(direction, roomId) {
  const anchor = FLAT_THREE_RADAR_ANCHORS[roomId]
  // SphereGeometry with scale [-1, 1, 1] maps texture u to world
  // (cos(2πu), sin(2πu)) in the X/Z plane.
  const azimuth = Math.atan2(direction.z, direction.x) * 180 / Math.PI
  return ((anchor.heading + azimuth - anchor.u * 360) % 360 + 360) % 360
}

// Positions on the Flat 03 crop of floorPlan-web.webp, measured from its top-left.
export const FLAT_THREE_ROOMS = [
  { id: 'living', name: 'Living Room', file: 'Living Room', left: 86, top: 62 },
  { id: 'passage', name: 'Living Passage', file: 'Living Passage', left: 47, top: 61 },
  { id: 'kitchen', name: 'Kitchen', file: 'Kitchen', left: 43, top: 78 },
  { id: 'bedroom-1', name: 'Bedroom 1', file: 'M_Bedroom_01', left: 14, top: 38 },
  { id: 'bedroom-2', name: 'Bedroom 2', file: 'M_Bedroom_02', left: 42, top: 29 },
  { id: 'bathroom-1', name: 'Bathroom 1', file: 'M_Toilet_01', left: 10, top: 76 },
  { id: 'bathroom-2', name: 'Bathroom 2', file: 'M_Toilet_02', left: 62, top: 42 },
].map((room) => ({
  ...room,
  image: `${ROOT}${room.file}.jpg`,
  // Face the main room feature on arrival; bathrooms face their basin.
  arrivalU: room.id.startsWith('bathroom') ? .5 : FLAT_THREE_RADAR_ANCHORS[room.id].u,
}))

// The tour opens here: selecting "Flat no 3" on the Plan page loads this
// panorama immediately, with no introduction screen in between.
export const FLAT_THREE_OPENING_ROOM = FLAT_THREE_ROOMS[0]
