// Confirmed in-panorama positions - placed with the in-panorama placement tool.
// category is the destination scene ID.
export const AMENITY_HOTSPOTS = [
  ['walking-1', 'yoga', 'Yoga Deck', [49.792, -1.929, -2.694]],
  ['ludo', 'gazebo', 'Gazebo Seating', [-0.881, -5.485, -49.618]],
  ['gazebo', 'kids', "Kids' Play Area", [-49.752, -3.111, -2.558]],
  ['kids', 'terrace-1', 'Terrace Seating 1', [-49.615, -4.448, 3.429]],
  ['swings', 'screening', 'Outdoor Screening Space', [12.021, -9.531, -47.488]],
  ['swings', 'walking-1','Walking Space 1', [ 21.654,-12.119,43.336]],
  ['swings', 'stargazing','Stargazing Deck', [ -18.949,-14.357,43.919]],
  ['screening', 'swings', 'Swing Area', [1.984, -17.012, 46.879]],
  ['walking-2', 'stargazing', 'Stargazing Deck', [-49.749, -3.827, 2.059]],
  ['terrace-1', 'screening', 'Outdoor Screening Space', [-26.677, -10.478, 40.902]],
  ['walking-1', 'stargazing', 'Stargazing Deck', [-49.811, -2.883, -1.549]],
  ['walking-2', 'walking-1', 'Walking Space 1', [49.662, -4.511, 2.332]],
  ['kids', 'gazebo', 'Gazebo Seating', [49.296, -0.447, 7.903]],
  ['ludo', 'yoga', 'Yoga Deck', [0.977,-18.856,46.249]],
  ['gazebo', 'ludo', 'Life-size Ludo', [5.228, -7.155, 49.169]],
  ['terrace-1', 'kids', "Kids' Play Area", [47.96, -12.086, -6.833]],
  ['screening', 'terrace-1', 'Terrace Seating 1', [1.592, -8.272, -49.217]],
  ['screening', 'stargazing', 'Stargazing Deck', [-19.758, -2.296, 45.799]],
  ['walking-1', 'walking-4', 'Walking Space 2', [47.745, -7.611, -12.492]],
  ['walking-4', 'yoga', 'Yoga Deck', [49.654, -4.721, 1.976]],
  ['walking-4', 'walking-1', 'Walking Space 1', [-49.441, -6.093, 3.01]],
  ['stargazing', 'swings','Swing Area',[19.974,-14.554,-43.373]],
  ['stargazing','walking-1','Walking Space 1',[  48.258,-11.203,6.252]],
  ['yoga','walking-1','Walking Space 1',[-49.646,-4.463,2.759]],
  ['yoga','ludo','Life-size Ludo',[ 9.907,-14.509,-46.755]]
].map(([sourceScene, category, title, position]) => ({
  id: `${sourceScene}-${category}`, sourceScene, category, title, description: '', position,
}))
