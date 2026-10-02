const ROOT = '/assets/amenities'
export const AMENITY_OVERVIEW = `${ROOT}/optimized/overview.webp`

// Horizontal feature positions measured on the current equirectangular renders.
// Mirrored SphereGeometry maps u to (cos(2?u), 0, sin(2?u)).
export const AMENITY_ARRIVAL_U = {
  yoga: 0, 'walking-3': .49, 'walking-4': .49, 'walking-1': .5,
  'walking-5': .06, stargazing: .51, screening: 0,
  'terrace-2': .69, 'terrace-1': .51, kids: .44, 'kids-2': .79,
  'gazebo-2': .94, gazebo: .75, ludo: .84, 'walking-2': .36, swings: .5,
}

// Numbered views correspond to the supplied camera renders. The overview uses
// one rooftop entry point rather than inventing precise camera coordinates.
export const AMENITY_SCENES = [
  ['yoga', 'Yoga Deck', 'cam01_yogaDeck.webp'],
  ['walking-3', 'Walking Space 3', 'cam02_walkingSpace.webp'],
  ['walking-4', 'Walking Space 2', 'cam03_walkingSpace.webp'],
  ['walking-1', 'Walking Space 1', 'cam04_walkingSpace.webp'],
  ['walking-5', 'Walking Space 5', 'cam05_walkingSpace.webp'],
  ['stargazing', 'Stargazing Deck', 'cam06_starGazingDeck.webp'],
  ['screening', 'Outdoor Screening Space', 'cam07_outdoorScreeningSpace.webp'],
  ['terrace-2', 'Terrace Seating 2', 'cam08_terraceSeating.webp'],
  ['terrace-1', 'Terrace Seating 1', 'cam09_terraceSeating.webp'],
  ['kids', "Kids' Play Area", 'cam10_kidsPlayArea.webp'],
  ['kids-2', "Kids' Play Area 2", 'cam11_kidsPlayArea.webp'],
  ['gazebo-2', 'Gazebo Seating 2', 'cam12_gazeboSeating.webp'],
  ['gazebo', 'Gazebo Seating', 'cam13_gazeboSeating.webp'],
  ['ludo', 'Life-size Ludo', 'cam14_lifeSizeLudo.webp'],
  ['walking-2', 'Walking Space 2', 'cam15_walkingSpace.webp'],
  ['swings', 'Swing Area', 'cam06_swingArea.webp'],
].map(([id, name, filename], index) => ({
  id, name, number: String(index + 1).padStart(2, '0'),
  image: `${ROOT}/${filename}`,
  arrivalU: AMENITY_ARRIVAL_U[id],
  arrivalImmediate: true,
  preview: `${ROOT}/optimized/${filename.replace('.webp', '-preview.webp')}`,
}))
