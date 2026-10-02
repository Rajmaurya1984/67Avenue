import { useCallback, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { DEFAULT_VIEW_ID, WINDOW_VIEW_FLOORS, WINDOW_VIEW_TIMES, getWindowViewAssets } from '../../data/windowView.js'
import { getWindowTexture, loadWindowTexture, warmWindowPreviews } from './windowTextures.js'
import PanoramaControls from './PanoramaControls.jsx'
import WindowViewIcon from './WindowViewIcon.jsx'
import './WindowView.css'

const floorById = (id) => WINDOW_VIEW_FLOORS.find((floor) => floor.id === id) ?? WINDOW_VIEW_FLOORS[0]

function PanoramaSphere({ texture }) {
  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[50, 64, 40]} />
      <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
    </mesh>
  )
}

function FadeSphere({ view, onComplete, reducedMotion }) {
  const materialRef = useRef(null)
  const progressRef = useRef(0)
  const completedRef = useRef(false)
  useFrame((_, delta) => {
    if (!materialRef.current || completedRef.current) return
    progressRef.current = Math.min(1, progressRef.current + (reducedMotion ? 1 : Math.min(delta, 0.05) / 0.25))
    const t = progressRef.current
    materialRef.current.opacity = t * t * (3 - 2 * t)
    if (t === 1) {
      completedRef.current = true
      onComplete(view)
    }
  })
  return (
    <mesh scale={[-1, 1, 1]} renderOrder={1}>
      <sphereGeometry args={[50, 64, 40]} />
      <meshBasicMaterial ref={materialRef} map={view.texture} side={THREE.DoubleSide}
        transparent opacity={0} depthWrite={false} depthTest={false} />
    </mesh>
  )
}

function WindowViewSession({ onClose }) {
  const [selection, setSelection] = useState({ id: DEFAULT_VIEW_ID, time: 'day', revision: 0 })
  const [activeView, setActiveView] = useState(null)
  const [incomingView, setIncomingView] = useState(null)
  const [error, setError] = useState('')
  const [fov, setFov] = useState(72)
  const [reducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [rotating, setRotating] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  useEffect(() => {
    let cancelled = false
    const assets = getWindowViewAssets(floorById(selection.id), selection.time)
    const load = async () => {
      setError('')
      try {
        const texture = getWindowTexture(assets.image)
          ?? await loadWindowTexture(assets.preview).catch(() => loadWindowTexture(assets.image))
        if (cancelled) return
        const view = { ...selection, texture }
        setIncomingView(view)
        const detail = await loadWindowTexture(assets.image).catch(() => null)
        if (cancelled || !detail) return
        const sharpView = { ...selection, texture: detail }
        setIncomingView((current) => current?.revision === selection.revision ? sharpView : current)
        setActiveView((current) => current?.revision === selection.revision ? sharpView : current)
      } catch {
        if (!cancelled) setError('This view could not be loaded. Select it again to retry.')
      }
    }
    const frame = requestAnimationFrame(() => { void load() })
    return () => { cancelled = true; cancelAnimationFrame(frame) }
  }, [selection])

  const completeFade = useCallback((view) => {
    setActiveView(view)
    setIncomingView((current) => current?.revision === view.revision ? null : current)
  }, [])

  useEffect(() => {
    const onKeyDown = (event) => { if (event.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  const choose = (update) => setSelection((current) => {
    const next = { ...current, ...update }
    if (!error && next.id === current.id && next.time === current.time) return current
    return { ...next, revision: current.revision + 1 }
  })
  const warm = (id, time) => {
    const assets = getWindowViewAssets(floorById(id), time)
    void loadWindowTexture(assets.preview).catch(() => {})
  }
  const displayed = activeView ?? selection

  return (
    <div className="window-view" role="dialog" aria-modal="true"
      aria-label={`Window view - ${floorById(displayed.id).label} - ${displayed.time}`}>
      <Canvas className="window-view__canvas" camera={{ position: [0, 0, 0.1], fov: 72 }} dpr={[1, 1.5]}>
        {activeView && <PanoramaSphere texture={activeView.texture} />}
        {incomingView && <FadeSphere key={incomingView.revision} view={incomingView} onComplete={completeFade} reducedMotion={reducedMotion} />}
        <PanoramaControls fov={fov} setFov={setFov} rotating={rotating && !!activeView} />
      </Canvas>
      <div className="window-view__menu">
        <div className="window-view__times" role="group" aria-label="Time of day">
          {WINDOW_VIEW_TIMES.map((time) => (
            <button key={time.id} type="button" className="window-view__time"
              aria-label={time.label} aria-pressed={selection.time === time.id} title={time.label}
              onPointerEnter={() => warm(selection.id, time.id)} onFocus={() => warm(selection.id, time.id)}
              onClick={() => choose({ time: time.id })}>
              <WindowViewIcon name={time.id} /><span>{time.label}</span>
            </button>
          ))}
        </div>
        <p className="window-view__menu-label">FLOORS</p>
        {WINDOW_VIEW_FLOORS.map((floor) => (
          <button key={floor.id} type="button"
            className={`window-view__floor${floor.id === selection.id ? ' is-active' : ''}`}
            aria-current={floor.id === selection.id ? 'true' : undefined}
            onPointerEnter={() => warm(floor.id, selection.time)} onFocus={() => warm(floor.id, selection.time)}
            onClick={() => choose({ id: floor.id })}>
            {floor.label}
          </button>
        ))}
        {error && <p className="window-view__error" role="status">{error}</p>}
      </div>
      <div className="window-view__tools" role="group" aria-label="Panorama controls">
        <button type="button" aria-label="Zoom in" title="Zoom in" disabled={fov <= 35}
          onClick={() => setFov((value) => Math.max(35, value - 8))}><WindowViewIcon name="plus" /></button>
        <button type="button" aria-label="Zoom out" title="Zoom out" disabled={fov >= 95}
          onClick={() => setFov((value) => Math.min(95, value + 8))}><WindowViewIcon name="minus" /></button>
        <button type="button" aria-label={rotating ? 'Pause rotation' : 'Start rotation'}
          title={rotating ? 'Pause rotation' : 'Start rotation'} aria-pressed={rotating}
          onClick={() => setRotating((value) => !value)}><WindowViewIcon name={rotating ? 'pause' : 'play'} /></button>
      </div>
      <button type="button" className="window-view__close" onClick={onClose} aria-label="Close window view">
        <WindowViewIcon name="close" />
      </button>
    </div>
  )
}

export default function WindowView({ open, onClose, preload = false }) {
  useEffect(() => {
    if (!preload && !open) return undefined
    let cancelled = false
    void warmWindowPreviews(() => cancelled)
    return () => { cancelled = true }
  }, [preload, open])
  return open ? <WindowViewSession onClose={onClose} /> : null
}
