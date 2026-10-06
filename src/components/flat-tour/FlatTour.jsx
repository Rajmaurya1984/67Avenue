import { FLAT_THREE_HOTSPOTS } from '../../data/flatThreeHotspots.js'
import { useRoomPointers } from './RoomPointerTools.jsx'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { FLAT_THREE_DEFAULT_FOV, FLAT_THREE_OPENING_ROOM, FLAT_THREE_ROOMS, flatThreeRadarHeading } from '../../data/flatThree.js'
import { FLOOR_PLAN_IMAGE } from '../../data/windowView.js'
import { assetUrl } from '../../lib/utils.js'
import { loadWindowTexture } from '../window-view/windowTextures.js'
import PanoramaControls from '../window-view/PanoramaControls.jsx'
import PanoramaMarker from '../window-view/PanoramaMarker.jsx'
import './FlatTour.css'
import '../window-view/TourSceneMenu.css'
import SiteHeader from '../site/SiteHeader.jsx'

function RoomLayer({ view, fade, onComplete }) {
  const gl = useThree(state => state.gl)
  const camera = useThree(state => state.camera)
  const [rotation] = useState(() => {
    if (view.rotation !== undefined) return view.rotation
    const direction = camera.getWorldDirection(new THREE.Vector3())
    const room = FLAT_THREE_ROOMS.find(room => room.id === view.id)
    // Immediate arrivals move the camera to the authored heading. Keep the
    // panorama and its pointers in that same native coordinate system.
    if (room.arrivalImmediate) return 0
    // Align the destination's authored view to the current camera heading.
    // Rotating only the new sphere keeps the outgoing room perfectly still.
    return room.arrivalU * Math.PI * 2 - Math.atan2(direction.z, direction.x)
  })
  const material = useRef(null)
  const elapsed = useRef(0)
  const completed = useRef(false)
  const [reduce] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useLayoutEffect(() => { gl.initTexture(view.texture) }, [gl, view.texture])
  useFrame((_, delta) => {
    if (!material.current) return
    if (!fade || completed.current) return
    elapsed.current = Math.min(1, elapsed.current + (reduce ? 1 : Math.min(delta, .05) / .95))
    const progress = elapsed.current
    material.current.opacity = progress ** 3 * (progress * (progress * 6 - 15) + 10)
    if (progress === 1) { completed.current = true; onComplete({ ...view, rotation }) }
  })
  return <mesh rotation={[0, rotation, 0]} scale={[-1, 1, 1]} renderOrder={fade ? 1 : 0}>
    <sphereGeometry args={[50, 64, 40]} />
    <meshBasicMaterial ref={material} map={view.texture} side={THREE.DoubleSide}
      transparent={!!fade} opacity={fade ? 0 : 1} depthTest={!fade} depthWrite={!fade} />
  </mesh>
}


function RadarHeading({ coneRef, roomId, rotation = 0 }) {
  const direction = useRef(new THREE.Vector3())
  useFrame(({ camera }) => {
    if (!coneRef.current) return
    camera.getWorldDirection(direction.current)
    direction.current.applyAxisAngle(THREE.Object3D.DEFAULT_UP, -rotation)
    // Keep the last heading when looking straight up or down (yaw is undefined).
    if (Math.hypot(direction.current.x, direction.current.z) > 1e-5) {
      const heading = flatThreeRadarHeading(direction.current, roomId)
      coneRef.current.style.transform = `rotate(${heading}deg)`
    }
    // The floor-plan cone represents horizontal coverage: derive it from the
    // live vertical FOV and aspect on every frame so scroll/pinch zoom
    // narrows and widens the cone accurately.
    const horizontalFov = THREE.MathUtils.radToDeg(
      2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(camera.getEffectiveFOV()) / 2) * camera.aspect),
    )
    coneRef.current.style.setProperty('--radar-fov', `${horizontalFov}deg`)
  })
  return null
}

export default function FlatTour({ onClose }) {
  const coneRef = useRef(null)
  const [radarExpanded] = useState(true)
  const dialog = useRef(null)
  const [selected, setSelected] = useState(FLAT_THREE_OPENING_ROOM)
  const pointerTools = useRoomPointers(selected.id)
  const [active, setActive] = useState(null)
  const [incoming, setIncoming] = useState(null)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [fov, setFov] = useState(FLAT_THREE_DEFAULT_FOV)
  const [autoRotate] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [mapFailed, setMapFailed] = useState(false)
  const busy = active?.id !== selected.id || !!incoming
  const radarRoom = FLAT_THREE_ROOMS.find(room => room.id === active?.id) ?? selected
  const radarPosition = radarRoom.cameraPosition
  // Published pointers take priority over old browser drafts at the same spot.
  // Keep the drafts available in placement mode for editing and export.
  const tourMarkers = [...FLAT_THREE_HOTSPOTS, ...pointerTools.markers.filter(draft =>
    !FLAT_THREE_HOTSPOTS.some(marker => marker.sourceScene === draft.sourceScene
      && Math.hypot(...marker.position.map((value, axis) => value - draft.position[axis])) < 3))]

  useLayoutEffect(() => {
    const element = dialog.current
    element.showModal()
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { element.close(); document.body.style.overflow = overflow }
  }, [])

  // Opens straight into the 360 view: the first panorama starts downloading as
  // soon as the dialog mounts, so the room appears without an intro screen.
  useEffect(() => {
    let cancelled = false
    const request = requestAnimationFrame(() => {
      setError('')
      void loadWindowTexture(selected.image).then((texture) => {
        if (!cancelled) setIncoming({ id: selected.id, name: selected.name, texture })
      }).catch(() => {
        if (!cancelled) setError(`${selected.name} could not be loaded.`)
      })
    })
    return () => { cancelled = true; cancelAnimationFrame(request) }
  }, [selected, retry])

  const complete = useCallback((view) => {
    setActive(view)
    setIncoming((current) => current?.id === view.id ? null : current)
  }, [])
  const choose = (room) => {
    // Let a visible crossfade finish; removing its partially opaque layer
    // midway through would snap back to the previous room.
    if (busy) return
    if (room.id === selected.id) return
    setIncoming(null)
    setError('')
    setSelected(room)
  }
  const warm = (room) => { void loadWindowTexture(room.image).catch(() => { }) }

  return <dialog ref={dialog} className="flat-tour flat-tour--immersive" aria-labelledby="flat-tour-title"
    onCancel={(event) => { event.preventDefault(); onClose() }}>
    <header className="flat-tour__header">
      <div className="flat-tour__header-actions">
        <button type="button" onClick={onClose} aria-label="Close Flat no 3 tour"><span aria-hidden="true">✕</span></button>
      </div>
    </header>
    <div className="flat-tour__body">
      <SiteHeader showGroup={false} />
      <nav className="minimal-room-stack" aria-label="Explore rooms">
        {/* <span className="minimal-room-stack__title">Explore your home</span> */}
        {FLAT_THREE_ROOMS.map(room => <button key={room.id} type="button"
          className={`stack-item${selected.id === room.id ? ' active' : ''}`}
          data-room={room.id} aria-pressed={selected.id === room.id} disabled={busy}
          onPointerEnter={() => warm(room)} onFocus={() => warm(room)} onClick={() => choose(room)}>
          {room.name.replace('Bathroom', 'Toilet')}
        </button>)}
      </nav>
      <aside className="flat-tour__map-panel" aria-label="Flat no 3 room map">
        {/* <header className="flat-radar__header"><span>FLOOR PLAN</span><button type="button" aria-expanded={radarExpanded} aria-controls="flat-radar-drawing" onClick={() => setRadarExpanded(value => !value)} aria-label={radarExpanded ? 'Minimize floor plan' : 'Expand floor plan'}>{radarExpanded ? '−' : '+'}</button></header> */}
        <div id="flat-radar-drawing" hidden={!radarExpanded}>
          <p className="flat-tour__eyebrow">EXPLORE YOUR HOME</p>
          <h3>A room-by-room perspective.</h3>
          <p>Select a pulsing pointer to step inside.</p>
          <div className="flat-tour__map">
            <svg viewBox="520 141.4 185 127.26" role="img" aria-label="Flat 03 floor plan with two bedrooms, living room, kitchen and bathrooms">
              <image href={assetUrl(FLOOR_PLAN_IMAGE)} width="1000" height="707" onError={() => setMapFailed(true)} />
            </svg>
            {!mapFailed && <div className="flat-radar__position" aria-hidden="true" style={{ left: `${radarPosition.left}%`, top: `${radarPosition.top}%` }}><span ref={coneRef} className="flat-radar__cone" /><i /></div>}
            {!mapFailed && FLAT_THREE_ROOMS.map((room) => <button key={room.id} type="button"
              className={`flat-tour__pin${radarRoom.id === room.id ? ' is-selected' : ''}`}
              style={{ left: `${room.left}%`, top: `${room.top}%` }}
              aria-label={`Explore ${room.name}`} aria-pressed={selected.id === room.id}
              disabled={busy}
              onPointerEnter={() => warm(room)} onFocus={() => warm(room)} onClick={() => choose(room)}>
              <span className="flat-tour__ping" aria-hidden="true" /><span className="flat-tour__dot" aria-hidden="true" />
              <span className="flat-tour__tooltip">{room.name}</span>
            </button>)}
          </div>
          {mapFailed && <p role="alert">The plan image could not load. Select a room below.</p>}
          <nav className="flat-tour__rooms" aria-label="Choose a room">
            {FLAT_THREE_ROOMS.map((room) => <button key={room.id} type="button" aria-pressed={selected.id === room.id}
              disabled={busy}
              onPointerEnter={() => warm(room)} onFocus={() => warm(room)} onClick={() => choose(room)}>{room.name}</button>)}
          </nav>
          </div>
      </aside>
      <section className="flat-tour__viewer" aria-label={`360 tour: ${active?.name ?? selected.name}`}>
        <Canvas camera={{ position: [.1, 0, 0], fov: FLAT_THREE_DEFAULT_FOV }} dpr={[1, 1.5]}>
          {active && <RoomLayer key={active.id} view={active} />}
          {incoming && <RoomLayer key={`${incoming.id}-${retry}`} view={incoming} fade onComplete={complete} />}
          <RadarHeading coneRef={coneRef} roomId={radarRoom.id} rotation={active?.rotation} />
          {!busy && tourMarkers.filter(marker => marker.sourceScene === active?.id).map(marker => {
            const destination = FLAT_THREE_ROOMS.find(room => room.id === marker.category)
            if (!destination) return null
            const position = new THREE.Vector3(...marker.position).applyAxisAngle(THREE.Object3D.DEFAULT_UP, active?.rotation ?? 0)
            return <PanoramaMarker key={marker.id} position={position} zIndexRange={[3, 1]}>
              <button type="button" className="flat-room-hotspot" aria-label={`Go to ${destination.name}`}
                onPointerDown={event => event.stopPropagation()} onDoubleClick={event => event.stopPropagation()}
                onPointerEnter={() => warm(destination)} onFocus={() => warm(destination)} onTouchStart={() => warm(destination)}
                onClick={event => { event.stopPropagation(); choose(destination) }}>
                <span className="flat-room-hotspot__arrow" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="M16 6 27 18h-7v9h-8v-9H5Z" /></svg></span>
                <span className="flat-room-hotspot__label">{destination.name}</span>
              </button>
            </PanoramaMarker>
          })}
          <PanoramaControls fov={fov} setFov={setFov} rotationDelay={3}
            rotating={autoRotate && !!active && !busy}
            arrivalView={FLAT_THREE_ROOMS.find(room => room.id === (incoming ?? active)?.id)} />
        </Canvas>
        <div className="flat-tour__caption"><h3>{active?.name ?? selected.name}</h3></div>
        {/* <div className="flat-tour__zoom" role="group" aria-label="Room panorama zoom">
          <button type="button" aria-label="Zoom in" disabled={busy || fov <= 35} onClick={() => setFov((value) => Math.max(35, value - 8))}>+</button>
          <button type="button" aria-label="Zoom out" disabled={busy || fov >= 95} onClick={() => setFov((value) => Math.min(95, value + 8))}>−</button>
        </div> */}
        {error && <div className="flat-tour__status" role="alert">{error} <button type="button" onClick={() => setRetry((value) => value + 1)}>Retry</button></div>}
      </section>
    </div>
  </dialog>
}
