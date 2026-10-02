import { Html } from '@react-three/drei'
import { AMENITY_HOTSPOTS } from '../../data/amenityHotspots.js'
import { AMENITY_SCENES } from '../../data/amenityTour.js'
import { PlacementMarker, PlacementPanel } from '../landmarks/index.js'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import PanoramaControls from '../window-view/PanoramaControls.jsx'
import WindowViewIcon from '../window-view/WindowViewIcon.jsx'
import { getWindowTexture, loadWindowTexture } from '../window-view/windowTextures.js'

function PanoramaLayer({ view, fade = false, reducedMotion, onComplete, onPlace }) {
  const gl = useThree(state => state.gl)
  useLayoutEffect(() => { gl.initTexture(view.texture) }, [gl, view.texture])
  const materialRef = useRef(null)
  const elapsedRef = useRef(0)
  const completeRef = useRef(false)
  useFrame((_, delta) => {
    if (!fade || completeRef.current || !materialRef.current) return
    elapsedRef.current = Math.min(1, elapsedRef.current + (reducedMotion ? 1 : Math.min(delta, 0.05) / 0.65))
    const t = elapsedRef.current
    materialRef.current.opacity = t * t * (3 - 2 * t)
    if (t === 1) { completeRef.current = true; onComplete(view) }
  })
  return (
    <mesh scale={[-1, 1, 1]} renderOrder={fade ? 1 : 0}
      onDoubleClick={onPlace ? (event) => {
        event.stopPropagation()
        onPlace(event.point.toArray().map((value) => Number(value.toFixed(3))))
      } : undefined}>
      <sphereGeometry args={[50, 64, 40]} />
      <meshBasicMaterial ref={materialRef} map={view.texture} side={THREE.DoubleSide}
        transparent={fade} opacity={fade ? 0 : 1} depthTest={!fade} depthWrite={!fade} />
    </mesh>
  )
}

const DRAFT_KEY = '67avenue-amenity-hotspots-v1'

export default function AmenityPanorama({ scene, onNavigate, placementMode = false }) {
  const [active, setActive] = useState(null)
  const [incoming, setIncoming] = useState(null)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [fov, setFov] = useState(72)
  const [reducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [rotating, setRotating] = useState(false)
  // Local toggle — same pattern as FlatTour's "Place room pointers" button.
  // `placementMode` (from Amenities.jsx `panoramaPlacement`) enables the
  // amenity hotspot tool; this toggle shows/hides it at runtime.
  const [placing, setPlacing] = useState(placementMode)
  useEffect(() => { setPlacing(placementMode) }, [placementMode])
  const [destination, setDestination] = useState('')
  const [didCopy, setDidCopy] = useState(false)
  const [draftMessage, setDraftMessage] = useState('')
  const [exportText, setExportText] = useState('')
  const [drafts, setDrafts] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) || '[]')
      return Array.isArray(saved) ? saved.filter((marker) =>
        typeof marker.id === 'string' && AMENITY_SCENES.some((item) => item.id === marker.sourceScene)
        && AMENITY_SCENES.some((item) => item.id === marker.category)
        && Array.isArray(marker.position) && marker.position.length === 3 && marker.position.every(Number.isFinite)) : []
    } catch { return [] }
  })
  useEffect(() => {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts)) }
    catch { /* Copy config remains available when browser storage is disabled. */ }
  }, [drafts])

  useEffect(() => {
    let cancelled = false
    const token = {}
    const load = async () => {
      setError('')
      setRotating(false)
      setFov(72)
      try {
        const texture = getWindowTexture(scene.image)
          ?? await loadWindowTexture(scene.preview).catch(() => loadWindowTexture(scene.image))
        if (cancelled) return
        setIncoming({ id: scene.id, name: scene.name, texture, token })
        const detail = await loadWindowTexture(scene.image).catch(() => null)
        if (cancelled || !detail) return
        const sharp = { id: scene.id, name: scene.name, texture: detail, token }
        setIncoming((current) => current?.token === token ? sharp : current)
        setActive((current) => current?.token === token ? sharp : current)
      } catch {
        if (!cancelled) setError('This view could not be opened. Please try again.')
      }
    }
    const frame = requestAnimationFrame(() => { void load() })
    return () => { cancelled = true; cancelAnimationFrame(frame) }
  }, [scene, retry])

  const busy = active?.id !== scene.id || !!incoming
  const categories = AMENITY_SCENES.filter((item) => item.id !== scene.id)
    .map((item) => ({ id: item.id, label: item.name }))
  const targetId = categories.some((item) => item.id === destination) ? destination : categories[0].id
  const sceneMarkers = drafts.filter((marker) => marker.sourceScene === scene.id)
  const place = (position) => {
    if (busy) return
    setRotating(false)
    setDidCopy(false)
    const target = AMENITY_SCENES.find((item) => item.id === targetId)
    setDrafts((current) => [...current, {
      id: crypto.randomUUID(), sourceScene: scene.id, title: target.name,
      category: target.id, description: '', position,
    }])
  }
  const undo = () => {
    const last = sceneMarkers.at(-1)?.id
    setDrafts((current) => current.filter((marker) => marker.id !== last))
    setDidCopy(false)
  }
  const clear = () => {
    setDrafts((current) => current.filter((marker) => marker.sourceScene !== scene.id))
    setDidCopy(false)
  }
  const copy = async () => {
    const json = JSON.stringify(drafts.map(({ sourceScene, title, category, description, position }) =>
      ({ sourceScene, title, category, description, position })), null, 2)
    setExportText(json)
    try {
      await navigator.clipboard.writeText(json)
      setDidCopy(true)
      setDraftMessage('Copied pointers from all panoramas. Paste the JSON into the chat.')
    } catch {
      setDraftMessage('Clipboard unavailable. Select and copy the JSON below.')
    }
  }
  const complete = useCallback((view) => {
    setActive(view)
    setIncoming((current) => current?.token === view.token ? null : current)
  }, [])

  return (
    <section className="amenity-panorama" aria-label={`360 view: ${active?.name ?? scene.name}`}>
      <Canvas camera={{ position: [0, 0, 0.1], fov: 72 }} dpr={[1, 1.5]}>
        {active && <PanoramaLayer view={active} onPlace={placementMode && placing && !busy ? place : undefined} />}
        {incoming && <PanoramaLayer key={`${incoming.id}-${retry}`} view={incoming} fade reducedMotion={reducedMotion} onComplete={complete} />}
        {placementMode && placing && !busy && sceneMarkers.map((marker) => <PlacementMarker key={marker.id} marker={marker} />)}
        {(!placing || !placementMode) && !busy && AMENITY_HOTSPOTS.filter((marker) => marker.sourceScene === scene.id).map((marker) => (
          <Html key={marker.id} position={marker.position} center zIndexRange={[1000, 100]}>
            <button type="button" className="amenity-hotspot" aria-label={`Go to ${marker.title}`}
              onPointerDown={(event) => event.stopPropagation()}
              onDoubleClick={(event) => event.stopPropagation()}
              onPointerEnter={() => {
                const destinationScene = AMENITY_SCENES.find((item) => item.id === marker.category)
                if (destinationScene) void loadWindowTexture(destinationScene.preview).catch(() => { })
              }}
              onFocus={() => {
                const destinationScene = AMENITY_SCENES.find((item) => item.id === marker.category)
                if (destinationScene) void loadWindowTexture(destinationScene.preview).catch(() => { })
              }}
              onClick={(event) => {
                event.stopPropagation()
                setRotating(false)
                onNavigate(marker.category)
              }}>
              <span className="amenity-hotspot__pulse" aria-hidden="true" />
              <span className="amenity-hotspot__label">{marker.title}</span>
            </button>
          </Html>
        ))}
        <PanoramaControls fov={fov} setFov={setFov} rotating={rotating && !!active && !busy} arrivalView={AMENITY_SCENES.find(item => item.id === (incoming?.id ?? active?.id))} />
      </Canvas>
      {placementMode && <button type="button" className="amenity-pointer-toggle" aria-pressed={placing}
        onClick={() => setPlacing((value) => !value)}>{placing ? 'Hide amenity pointers' : 'Place amenity pointers'}</button>}
      {placementMode && placing && <div className="amenity-authoring">
        <PlacementPanel title="Amenity pointer placer" categories={categories}
          instructions={`In ${scene.name}: select the destination below, drag to look around, then double-click its exact location. Undo/Clear affect this panorama. Copy exports all panoramas.`}
          placementCategory={targetId} onPlacementCategory={setDestination}
          onUndo={undo} onClear={clear} onCopy={copy}
          canEdit={sceneMarkers.length > 0} didCopy={didCopy} />
        <p className="amenity-authoring__count">{sceneMarkers.length} pointers here · {drafts.length} total</p>
        {drafts.length > 0 && !sceneMarkers.length && <button type="button" onClick={copy}>Copy all panoramas</button>}
        {draftMessage && <p role="status">{draftMessage}</p>}
        {exportText && <textarea aria-label="Exported panorama pointers" value={exportText} readOnly onFocus={(event) => event.target.select()} />}
      </div>}      {busy && !error && <p className="amenity-tour__loading" role="status">Opening {scene.name}…</p>}
      <div className="amenity-camera" role="group" aria-label="Panorama controls">
        <button type="button" aria-label="Zoom in" title="Zoom in" disabled={fov <= 35} onClick={() => setFov((value) => Math.max(35, value - 8))}><WindowViewIcon name="plus" /></button>
        <button type="button" aria-label="Zoom out" title="Zoom out" disabled={fov >= 95} onClick={() => setFov((value) => Math.min(95, value + 8))}><WindowViewIcon name="minus" /></button>
        <button type="button" aria-label={rotating ? 'Pause rotation' : 'Start rotation'} title={rotating ? 'Pause rotation' : 'Start rotation'} aria-pressed={rotating} onClick={() => setRotating((value) => !value)}><WindowViewIcon name={rotating ? 'pause' : 'play'} /></button>
      </div>
      {error && <div className="amenity-tour__error" role="alert">{error}<button type="button" onClick={() => setRetry((value) => value + 1)}>Retry</button></div>}
    </section>
  )
}
