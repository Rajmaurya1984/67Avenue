import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { LOCATION_CATEGORIES, LOCATION_INTRO } from '../../../data/location.js'
import {
  LandmarkLegend,
  LandmarkMarker,
  PlacementMarker,
  PlacementPanel,
  filterByCategory,
  isMapped,
  usePlacementMarkers,
} from '../../landmarks/index.js'
import "../LandMark/LandMarkPanaroma.css"
import { LocationCallouts, LocationCalloutProjection } from './LocationCallouts.jsx'
import { landmarkLabelLanes, selectLandmarkLabels } from './locationLabelLayout.js'

const DEFAULT_IMAGE_URL = '/assets/location/Location.webp'
const TERRACE_IMAGE_URL = '/assets/location/Terrace Top (2) - Copy.png'

// Exact 4 corner pointers on the terrace floor
const DEFAULT_TERRACE_POINTS = [
  [6.52, -48.55, 9.96],   // P0: Front-Right
  [-4.7, -48.74, 9.98],   // P1: Front-Left
  [-6.08, -48.41, -10.8], // P2: Back-Left
  [6.18, -48.23, -11.5],  // P3: Back-Right
]

// Eagerly tell the browser / Three loader to fetch textures
try {
  useTexture.preload(DEFAULT_IMAGE_URL)
  useTexture.preload(TERRACE_IMAGE_URL)
} catch {
  // SSR or non-browser environments can ignore preload
}



// Landmark data for the Location panorama. Each entry carries:
//   title       place name with its drive time inline ("... 5 MINS"); the panel
//               lifts the time out into its own badge (see splitLandmarkTitle).
//   category    an id from LOCATION_CATEGORIES in data/location.js.
//   description optional detail shown in the popup; authoring placeholders are
//               suppressed (see landmarkDetail).
//   position    [x, y, z] on the 50-unit sphere, or null while a landmark is
//               still waiting to be placed by the authoring tool (placementMode).
// The file order is the order of the "View all" numbering; the filter panel
// groups these by category.
const landmarks = [
  {
    "title": "KANDIVALI WEST METRO 7 MINS",
    "category": "transportation",
    "description": "",
    "position": [
      49.46,
      -2.64,
      -6.18
    ]
  },
  {
    "title": "KANDIVALI STATION 12 MINS",
    "category": "transportation",
    "description": "",
    "position": [
      46.62,
      -1.58,
      17.75
    ]
  },
   {
    "title": "DAHANUKARWADI METRO 5 MINS",
    "category": "transportation",
    "description": "",
    "position": [
      34.05,
      -2.88,
      36.39
    ]
  },
   {
    "title": "ZENITH HOSPITAL 8 MINS",
    "category": "hospitals",
    "description": "",
    "position": [
      1.84,
      -2.33,
      49.82
    ]
  },
  {
    "title": "NAMAHA HOSPITAL 10 MINS",
    "category": "hospitals",
    "description": "",
    "position": [
      26.53,
      -1.07,
      42.27
    ]
  },
  {
    "title": "KAPADIA HOSPITAL 12 MINS",
    "category": "hospitals",
    "description": "",
    "position": [
      13.45,
      -0.71,
      48.08
    ]
  },
   {
    "title": "KANDIVALI POLICE STATION 5 MINS",
    "category": "safety",
    "description": "",
    "position": [
      49.29,
      -1.22,
      7.72
    ]
  },
    {
    "title": "OXFORD PUBLIC SCHOOL 7 MINS",
    "category": "schools",
    "description": "",
    "position": [
      38.76,
      -2.69,
      -31.39
    ]
  },
  {
    "title": "SVIS 10 MINS",
    "category": "schools",
    "description": "Swami VivekNand International School 10 min",
    "position": [
      48.27,
      -3.62,
      12.24
    ]
  },
  {
    "title": "ST. LAWRENCE 10 MINS",
    "category": "schools",
    "description": "",
    "position": [
      49.84,
      -0.46,
      -2.91
    ]
  },
  {
    "title": "RAGHULEELA MALL 9 MINS",
    "category": "lifestyle",
    "description": "",
    "position": [
      49.1,
      -3.42,
      -8.46
    ]
  },
  {
    "title": "DMART CHARKOP 5 MINS",
    "category": "lifestyle",
    "description": "",
    "position": [
      49.56,
      -4.21,
      4.99
    ]
  },
  {
    "title": "OSCAR HOSPITAL 2 MINS",
    "category": "hospitals",
    "description": "",
    "position": [
      49.22,
      -8.42,
      0.85
    ]
  },
    {
    "title": "VIPASSANA PAGODA",
    "category": "lifestyle",
    "description": "Global Vipassana Pagoda",
    "position": [
      -35.79,
      1.3,
      -34.8
    ]
  },
   {
    "title": "MINDSPACE 15min",
    "category": "business",
    "description": "",
    "position": [
      42.51,
      -1.02,
      26.13
    ]
  },
  {
    "title": "INFINITY IT PARK  18min",
    "category": "business",
    "description": "",
    "position": [
      28.1,
      0.07,
      41.33
    ]
  },
  {
    "title": "APPROVED COASTAL ROAD 10min",
    "category": "infrastructure",
    "description": "",
    "position": [
      46.9,
      -1.22,
      -17.02
    ]
  },
  {
    "title": "LINK ROAD 5min",
    "category": "roads",
    "description": "",
    "position": [
      35.24,
      -6.57,
      34.79
    ]
  },
  {
    "title": "S.V. ROAD  10 min",
    "category": "roads",
    "description": "",
    "position": [
      15.38,
      -5.3,
      47.2
    ]
  },

]

// Legend / dot display helpers live in components/landmarks/landmarkUtils.js
// so any page can share them. Panorama-only code stays here.

function PanoramaZoom() {
  const { camera, gl } = useThree()

  useEffect(() => {
    const handleWheel = (event) => {
      event.preventDefault()
      if (!camera.isPerspectiveCamera) return

      const zoomStep = event.deltaY > 0 ? 3 : -3
      camera.fov = THREE.MathUtils.clamp(camera.fov + zoomStep, 35, 100)
      camera.updateProjectionMatrix()
    }

    const canvas = gl.domElement
    canvas.addEventListener('wheel', handleWheel, { passive: false })
    return () => canvas.removeEventListener('wheel', handleWheel)
  }, [camera, gl])

  return null
}

const ROTATION_UP = new THREE.Vector3(0, 1, 0)

function PanoramaRotation({ enabled }) {
  const controls = useThree(state => state.controls)
  const interaction = useRef({ dragging: false, resumeAt: 0 })
  useEffect(() => {
    if (!controls) return undefined
    const start = () => { interaction.current.dragging = true }
    const end = () => {
      interaction.current.dragging = false
      interaction.current.resumeAt = performance.now() + 3000
    }
    controls.addEventListener('start', start)
    controls.addEventListener('end', end)
    return () => {
      controls.removeEventListener('start', start)
      controls.removeEventListener('end', end)
    }
  }, [controls])
  useFrame(({ camera }, delta) => {
    if (!enabled || interaction.current.dragging || performance.now() < interaction.current.resumeAt) return
    camera.position.applyAxisAngle(ROTATION_UP, -.045 * Math.min(delta, .05))
  }, -2)
  return null
}

function TerraceOverlay({ points = DEFAULT_TERRACE_POINTS }) {
  const terraceTexture = useTexture(TERRACE_IMAGE_URL)

  const geometry = useMemo(() => {
    // Lift vertices slightly inward toward origin (0,0,0) so the overlay
    // sits cleanly inside the panorama sphere without z-fighting.
    const lift = 0.986
    const p = points.map(([x, y, z]) => [x * lift, y * lift, z * lift])

    const geom = new THREE.BufferGeometry()

    // 2 triangles defining the quad between the 4 corner pointers.
    //
    // UV orientation, matching how the 4 pointers were labelled
    // (plan convention: "Front" = bottom of the artwork = world +Z):
    //   P0 Front-Right (1, 0)   P1 Front-Left (0, 0)
    //   P2 Back-Left   (0, 1)   P3 Back-Right  (1, 1)
    // so image bottom row -> +Z ("Front"), image top row -> -Z ("Back"),
    // image right column -> +X, image left column -> -X.
    // The default view faces the +X skyline (azimuth +2 degrees, elevation -4 degrees).
    // Terrace UV orientation remains tied to the world axes above, independent of the camera.
    //   If it reads 180° out, swap the v values (0 <-> 1).
    //   If it reads mirrored, swap the u values (0 <-> 1).
    const vertices = new Float32Array([
      // Triangle 1: P0, P1, P2
      p[0][0], p[0][1], p[0][2],
      p[1][0], p[1][1], p[1][2],
      p[2][0], p[2][1], p[2][2],

      // Triangle 2: P0, P2, P3
      p[0][0], p[0][1], p[0][2],
      p[2][0], p[2][1], p[2][2],
      p[3][0], p[3][1], p[3][2],
    ])

    const uvs = new Float32Array([
      // Triangle 1: P0, P1, P2
      1, 0,
      0, 0,
      0, 1,

      // Triangle 2: P0, P2, P3
      1, 0,
      0, 1,
      1, 1,
    ])

    geom.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
    geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
    geom.computeVertexNormals()

    return geom
  }, [points])

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial
        map={terraceTexture}
        transparent={true}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

function PanoramaSphere({
  imageUrl,
  markerData,
  placedMarkers,
  onPlaceMarker,
  openIndex,
  onToggle,
  containerRef,
  onReady,
  categories,
  labelLanes,
  onMarkerInteraction,
  detailsPortal,
}) {
  // useTexture suspends, so this effect only runs once the panorama texture
  // has actually resolved on this visit - the per-visit "ready" signal the
  // loader waits for (mirrors TowerOrbit's all-settled flag on the home page).
  const texture = useTexture(imageUrl)
  useEffect(() => {
    onReady?.()
  }, [texture, onReady])
  const { camera } = useThree()
  const cardRefs = useRef(new Map())
  const projected = useMemo(() => new THREE.Vector3(), [])
  const labelLayout = useRef({ visible: new Set(), measurements: new Map(), size: '', reserved: [], openIndex: null })
  const registerCard = useCallback((index, element) => {
    if (element) cardRefs.current.set(index, element)
    else cardRefs.current.delete(index)
  }, [])

  // Keep labels attached to their pins, and hide markers behind the camera.
  useFrame(({ size }) => {
    const layout = labelLayout.current
    const sizeKey = `${size.width}:${size.height}`
    if (layout.size !== sizeKey || layout.openIndex !== openIndex) {
      layout.size = sizeKey
      layout.openIndex = openIndex
      layout.measurements.clear()
      const origin = containerRef.current.getBoundingClientRect()
      layout.reserved = [...document.querySelectorAll('.site-brand, .site-dock, .page-pager__btn, .landmark-legend, .location-view-controls, .location-landmark-detail')].map(element => {
        const rect = element.getBoundingClientRect()
        return { left: rect.left - origin.left, right: rect.right - origin.left, top: rect.top - origin.top, bottom: rect.bottom - origin.top }
      })
    }
    const cards = []
    cardRefs.current.forEach((element, index) => {
      const marker = markerData[index]
      if (!marker) return
      projected.set(...marker.position).applyMatrix4(camera.matrixWorldInverse)
      const behind = projected.z >= 0
      projected.set(...marker.position).project(camera)
      const offscreen = behind || Math.abs(projected.x) > 1 || Math.abs(projected.y) > 1
      element.classList.toggle('is-offscreen', offscreen)
      if (offscreen) return
      const plate = element.querySelector('.landmark-callout__plate')
      if (!plate) return
      let measurement = layout.measurements.get(element)
      if (!measurement) {
        measurement = { width: plate.offsetWidth, height: plate.offsetHeight }
        layout.measurements.set(element, measurement)
      }
      const lift = 48 + (labelLanes.get(marker.title) ?? 0) * 54
      element.style.setProperty('--label-lift', `${lift}px`)
      cards.push({ element, plate, id: marker.title, priority: openIndex === index || element.contains(document.activeElement) || element.matches(':hover'), x: (projected.x + 1) * size.width / 2, y: (1 - projected.y) * size.height / 2, lift, ...measurement })
    })
    layout.visible = selectLandmarkLabels(cards, size.width, size.height, layout.reserved, layout.visible)
    cards.forEach(card => {
      const visible = layout.visible.has(card.id)
      card.element.classList.toggle('is-compact', !visible)
      card.plate.tabIndex = visible ? 0 : -1
      card.plate.setAttribute('aria-hidden', String(!visible))
    })
  })
  const handleBackgroundDoubleClick = (event) => {
    event.stopPropagation()
    const position = event.point.toArray().map((value) => Number(value.toFixed(2)))
    onPlaceMarker(position)
  }

  return (
    <>
      <mesh scale={[-1, 1, 1]} onDoubleClick={handleBackgroundDoubleClick}>
        <sphereGeometry args={[50, 64, 40]} />
        <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
      </mesh>
      <TerraceOverlay />
      {markerData.map((landmark, index) => (
        <LandmarkMarker
          key={landmark.id ?? landmark.title}
          landmark={landmark}
          index={index}
          isOpen={openIndex === index}
          onToggle={onToggle}
          registerCard={registerCard}
          containerRef={containerRef}
          variant="callout"
          staticMarker
          onInteractionChange={onMarkerInteraction}
          detailsPortal={detailsPortal}
          icon={categories.find(category => category.id === landmark.category)?.icon ?? 'pin'}
        />
      ))}
      {placedMarkers.map((marker) => <PlacementMarker key={marker.id} marker={marker} />)}
    </>
  )
}

// Texture loading has no intermediate percentages. Animate an estimated count
// using elapsed time so cached visits and different refresh rates feel consistent.
function PanoramaLoader({ ready, onComplete }) {
  const [shown, setShown] = useState(1)
  const progressRef = useRef(1)

  useEffect(() => {
    let frame = 0
    let previous = performance.now()
    const tick = (now) => {
      // Avoid a large jump after a stalled frame or a background tab resumes.
      const delta = Math.max(0, Math.min(now - previous, 50))
      previous = now
      const current = progressRef.current
      const next = ready
        ? Math.min(100, current + delta / 20)
        : Math.min(95, current + (95 - current) * (1 - Math.exp(-delta / 1800)))
      progressRef.current = Math.max(1, current, Math.min(100, next))
      setShown(Math.floor(progressRef.current))
      if (next < 100) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [ready])

  const isComplete = ready && shown === 100
  useEffect(() => {
    if (!isComplete) return undefined
    const timer = setTimeout(onComplete, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 500)
    return () => clearTimeout(timer)
  }, [isComplete, onComplete])

  return (
    <div
      className={`landmark-panorama__loader${isComplete ? ' is-complete' : ''}`}
      role="status"
      aria-live="polite"
      aria-hidden={isComplete || undefined}
    >
      <span className="landmark-panorama__loader-value">{shown}%</span>
      <span className="landmark-panorama__loader-label">Loading</span>
      <span className="landmark-panorama__loader-bar">
        <i style={{ width: `${shown}%` }} />
      </span>
    </div>
  )
}

const FOCUS_EASE = 0.12
const FOCUS_EPSILON = 0.002
const FOCUS_MAX_FRAMES = 300

// Shortest signed angle between two headings, so a turn never takes the long
// way round the sphere.
const shortestAngle = (angle) => Math.atan2(Math.sin(angle), Math.cos(angle))

// Turns the camera onto a landmark when its legend row is clicked.
//
// three r186's OrbitControls exposes no setAzimuthalAngle/setPolarAngle, and its
// update() re-derives the spherical state from the camera position at the top of
// every frame. So rather than pushing angles into the controls (which the damping
// 
// would fight and overshoot), this writes the interpolated camera position and
// lets update() own the camera again. A manual drag ("start") always wins and
// ends the animation.
function PanoramaFocus({ target, onArrive }) {
  const controls = useThree((state) => state.controls)
  const frames = useRef(0)
  const scratch = useMemo(() => ({
    offset: new THREE.Vector3(),
    spherical: new THREE.Spherical(),
    aim: new THREE.Spherical(),
  }), [])

  useEffect(() => {
    if (!target) return
    frames.current = 0
    // The camera orbits the controls' target, so the view direction is the
    // negation of its own offset from that target.
    scratch.offset.set(...target.position).normalize().multiplyScalar(-1)
    scratch.aim.setFromVector3(scratch.offset)
  }, [target, scratch])

  useEffect(() => {
    if (!controls || !target) return undefined
    const cancel = () => onArrive()
    controls.addEventListener('start', cancel)
    return () => controls.removeEventListener('start', cancel)
  }, [controls, target, onArrive])

  useFrame(() => {
    if (!target || !controls) return

    scratch.spherical.setFromVector3(
      scratch.offset.copy(controls.object.position).sub(controls.target),
    )
    const { radius, theta, phi } = scratch.spherical

    const nextTheta = theta + shortestAngle(scratch.aim.theta - theta) * FOCUS_EASE
    const nextPhi = THREE.MathUtils.lerp(phi, scratch.aim.phi, FOCUS_EASE)

    scratch.offset.setFromSphericalCoords(radius, nextPhi, nextTheta)
    controls.object.position.copy(controls.target).add(scratch.offset)
    controls.update()

    frames.current += 1
    const settled = Math.abs(shortestAngle(scratch.aim.theta - nextTheta)) < FOCUS_EPSILON
      && Math.abs(scratch.aim.phi - nextPhi) < FOCUS_EPSILON
    if (settled || frames.current > FOCUS_MAX_FRAMES) onArrive()
  })

  return null
}

// Location's filter-panel config. The common <LandmarkLegend> renders it;
// panorama-only copy stays in this file.
export default function LandmarkPanorama({
  imageUrl = DEFAULT_IMAGE_URL,
  landmarks: markerData = landmarks,
  categories = LOCATION_CATEGORIES,
  eyebrow = LOCATION_INTRO.eyebrow,
  placementMode = false,
}) {
  const containerRef = useRef(null)
  const calloutElements = useRef(new Map())
  const [detailsPortal, setDetailsPortal] = useState(null)
  const attachContainer = useCallback(element => {
    containerRef.current = element
    setDetailsPortal(element)
  }, [])

  // One open popup and one highlighted dot at a time, shared by the dots and the
  // legend so the two views always agree.
  const [activeIndex, setActiveIndex] = useState(null)
  const [openIndex, setOpenIndex] = useState(null)
  const [focusTarget, setFocusTarget] = useState(null)
  // Per-visit loader signal: true once the sphere texture has resolved
  // (fresh `false` every time the route mounts, like home's frame counter).
  const [panoramaReady, setPanoramaReady] = useState(false)
  const [loadingComplete, setLoadingComplete] = useState(false)
  const finishLoading = useCallback(() => setLoadingComplete(true), [])
  const [rotating, setRotating] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [markerInteracting, setMarkerInteracting] = useState(false)
  const labelLanes = useMemo(() => landmarkLabelLanes(markerData), [markerData])
  const handlePanoramaReady = useCallback(() => setPanoramaReady(true), [])

  // 'all', or one category id from `categories`.
  const [category, setCategory] = useState('all')

  // Everything, or just the selected category - the user's filter.
  const visible = useMemo(
    () => filterByCategory(markerData, category),
    [markerData, category],
  )

  // Only placed landmarks get a dot, and a dot's number is its index in this
  
  // array, so the panel's row numbers always match the dots on screen.
  const mappedDots = useMemo(() => visible.filter(isMapped), [visible])

  // Changing the filter must not leave a popup or a camera turn pointing at a
  // landmark that just disappeared.
  const changeCategory = useCallback((next) => {
    setCategory(next)
    setActiveIndex(null)
    setOpenIndex(null)
    setFocusTarget(null)
  }, [])

  const clearFocus = useCallback(() => setFocusTarget(null), [])

  // Authoring tool state lives in the common hook so any page can enable it.
  const {
    placedMarkers,
    placementCategory,
    setPlacementCategory,
    placeMarker,
    undo,
    clear,
    copyMarkers,
    didCopy,
  } = usePlacementMarkers(categories[0]?.id)

  return (
    <div ref={attachContainer} className={`landmark-panorama-container${activeIndex !== null ? ' has-active-landmark' : ''}`}>
      {/* Skyline marker azimuths: aim +2 degrees from +X toward +Z, elevation -4 degrees.
          OrbitControls looks toward the origin, so the radius-0.1 camera sits opposite that heading. */}
      <Canvas className="landmark-panorama" camera={{ position: [-0.0984, 0.0174, -0.0034], fov: 75 }} dpr={[1, 1.5]}>
        <Suspense fallback={null}>
          <PanoramaSphere
            imageUrl={imageUrl}
            markerData={[]}
            placedMarkers={placedMarkers}
            onPlaceMarker={placementMode && loadingComplete ? placeMarker : () => {}}
            openIndex={openIndex}
            onToggle={setOpenIndex}
            containerRef={containerRef}
            onReady={handlePanoramaReady}
            categories={categories}
            labelLanes={labelLanes}
            onMarkerInteraction={setMarkerInteracting}
            detailsPortal={detailsPortal}
          />
        </Suspense>
        <PanoramaZoom />
        <LocationCalloutProjection markers={mappedDots} elements={calloutElements} />
        <PanoramaFocus target={focusTarget} onArrive={clearFocus} />
        <PanoramaRotation enabled={rotating && panoramaReady && !markerInteracting && openIndex === null && !focusTarget && !placementMode} />
        <OrbitControls
          makeDefault
          enablePan={false}
          enableZoom={false}
          enableDamping
          dampingFactor={0.08}
          rotateSpeed={-0.35}
          minAzimuthAngle={-Infinity}
          maxAzimuthAngle={Infinity}
        />
      </Canvas>

      <PanoramaLoader ready={panoramaReady} onComplete={finishLoading} />
      {loadingComplete && <LocationCallouts markers={mappedDots} categories={categories} elements={calloutElements} />}
      {/* <div className="location-view-controls">
        <span>360° VIEW · Drag to explore</span>
        <button type="button" aria-pressed={rotating} onClick={() => setRotating(value => !value)}>{rotating ? 'Pause rotation' : 'Start rotation'}</button>
      </div> */}

      {loadingComplete && <LandmarkLegend
        markers={markerData}
        categories={categories}
        value={category}
        onChange={changeCategory}
        eyebrow={eyebrow}
        allLabel="View all"
      />}

      {placementMode && loadingComplete && (
        <PlacementPanel
          categories={categories}
          placementCategory={placementCategory}
          onPlacementCategory={setPlacementCategory}
          onUndo={undo}
          onClear={clear}
          onCopy={copyMarkers}
          canEdit={placedMarkers.length > 0}
          didCopy={didCopy}
        />
      )}
    </div>
  )
}
