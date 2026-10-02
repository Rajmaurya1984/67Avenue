import { useCallback, useEffect, useRef, useState } from 'react'
import SiteHeader from '../components/site/SiteHeader.jsx'
import NavIcon from '../components/site/NavIcon.jsx'
import AmenityPanorama from '../components/amenity-tour/AmenityPanorama.jsx'
import { loadWindowTexture } from '../components/window-view/windowTextures.js'
import { AMENITY_OVERVIEW, AMENITY_SCENES } from '../data/amenityTour.js'
import { AMENITY_POINTERS } from '../data/amenityPointers.js'
import { assetUrl } from '../lib/utils.js'
import { PlacementPanel, usePlacementMarkers } from '../components/landmarks/index.js'
import './Editorial.css'
import './Amenities.css'

// Set true to place overview dots; panorama placer is enabled separately below.
// Both stay on while you are adding pointers - set false before shipping.

const landmark = false;
const panoramaPlacement = false;
const placementCategories = AMENITY_SCENES.map((scene) => ({ id: scene.id, label: scene.name }))

export default function Amenities() {
  const [selectedId, setSelectedId] = useState(null)
  const [overviewAspect, setOverviewAspect] = useState(2)
  const [imageReady, setImageReady] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)
  const [imageAttempt, setImageAttempt] = useState(0)
  const [hoveredId, setHoveredId] = useState(null)
  const [elbows, setElbows] = useState({})
  const overviewRef = useRef(null)
  const cardRefs = useRef(new Map())
  const measureRef = useRef(null)
  const placer = usePlacementMarkers(placementCategories[0].id)
  const pointers = [...AMENITY_POINTERS, ...(landmark ? placer.placedMarkers : [])].map((marker, index) => ({
    id: marker.id ?? 'amenity-' + index,
    sceneId: marker.sceneId ?? marker.category,
    label: marker.label,
    left: marker.left ?? marker.position?.[0],
    top: marker.top ?? marker.position?.[1],
  }))
  const originRef = useRef(null)
  const backRef = useRef(null)
  const selected = AMENITY_SCENES.find((scene) => scene.id === selectedId)
  // Stable pointer list: AMENITY_POINTERS is a module constant, so ids are
  // stable and elbows only re-measure on count / readiness changes.
  const entries = pointers.map((pointer) => ({
    pointer,
    scene: AMENITY_SCENES.find((item) => item.id === pointer.sceneId),
  })).filter((entry) =>
    entry.scene && Number.isFinite(entry.pointer.left) && Number.isFinite(entry.pointer.top)
    && entry.pointer.left >= 0 && entry.pointer.left <= 100 && entry.pointer.top >= 0 && entry.pointer.top <= 100)
  const leftRail = entries.filter((entry) => entry.pointer.left <= 50)
  const rightRail = entries.filter((entry) => entry.pointer.left > 50)

  // Measure each rail card's vertical centre so the orthogonal SVG leader
  // line starts exactly at the card edge (90-degree H-then-V routing).
  const entryKeys = entries.map((entry) => entry.pointer.id).join('|')
  useEffect(() => {
    if (selectedId || !imageReady) return undefined
    const measure = () => {
      const root = overviewRef.current
      if (!root) return
      const box = root.getBoundingClientRect()
      if (!box.width || !box.height) return
      const next = {}
      for (const key of cardRefs.current.keys()) {
        const card = cardRefs.current.get(key)
        if (!card) continue
        const cardBox = card.getBoundingClientRect()
        next[key] = Number((((cardBox.top + cardBox.height / 2) - box.top) / box.height * 100).toFixed(3))
      }
      setElbows((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next))
    }
    measureRef.current = measure
    measure()
    const frame = requestAnimationFrame(measure)
    window.addEventListener('resize', measure)
    let observer = null
    if (typeof ResizeObserver !== 'undefined' && overviewRef.current) {
      observer = new ResizeObserver(measure)
      observer.observe(overviewRef.current)
    }
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', measure)
      observer?.disconnect()
    }
  }, [imageReady, selectedId, entryKeys])

  const closeView = useCallback(() => {
    setSelectedId(null)
    requestAnimationFrame(() => originRef.current?.focus())
  }, [])

  useEffect(() => {
    if (!selectedId) return undefined
    const keydown = (event) => { if (event.key === 'Escape') closeView() }
    window.addEventListener('keydown', keydown)
    return () => window.removeEventListener('keydown', keydown)
  }, [selectedId, closeView])

  const placePointer = (event) => {
    if (!landmark || !imageReady || selected || event.target.closest('button')) return
    const rect = event.currentTarget.getBoundingClientRect()
    const left = Math.max(0, Math.min(100, (event.clientX - rect.left) / rect.width * 100))
    const top = Math.max(0, Math.min(100, (event.clientY - rect.top) / rect.height * 100))
    placer.placeMarker([Number(left.toFixed(3)), Number(top.toFixed(3))])
  }

  const openView = (scene, event) => {
    originRef.current = event.currentTarget
    setSelectedId(scene.id)
    requestAnimationFrame(() => backRef.current?.focus())
  }



  return (
    <main className="editorial-page amenities-page" aria-label="Rooftop amenities">
      <SiteHeader />
      <div ref={overviewRef} className={`amenities-overview${landmark ? ' is-placing' : ''}`} style={{ '--overview-aspect': overviewAspect }} onDoubleClick={placePointer} aria-hidden={selected ? true : undefined}>
        <img className="amenities-overview__image" key={imageAttempt} src={assetUrl(AMENITY_OVERVIEW) + (imageAttempt ? `?retry=${imageAttempt}` : '')}
          alt="Aerial view of 67 Avenue and its rooftop amenities" width="6000" height="3000"
          draggable={false} fetchPriority="high" onLoad={event => { setOverviewAspect(event.currentTarget.naturalWidth / event.currentTarget.naturalHeight); setImageFailed(false); setImageReady(true); requestAnimationFrame(() => measureRef.current?.()) }} onError={() => { setImageReady(false); setImageFailed(true) }} />
        {imageReady && !selected && (
          <svg className="amenity-vectors" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
            {entries.map(({ pointer }) => {
              const startY = elbows[pointer.id] ?? pointer.top
              const edgeX = pointer.left <= 50 ? 15.5 : 84.5
              return (
                <path key={`line-${pointer.id}`} className={`amenity-vector${hoveredId === pointer.id ? ' is-hot' : ''}`}
                  d={`M ${edgeX},${startY} L ${pointer.left},${startY} L ${pointer.left},${pointer.top}`} />
              )
            })}
          </svg>
        )}
        {imageReady && !selected && (
          <>
            {[['left', leftRail], ['right', rightRail]].map(([side, rail]) => (
              <div key={side} className={`amenity-rail amenity-rail--${side}`} role="list" onScroll={() => measureRef.current?.()}>
                {rail.map(({ pointer, scene }) => {
                  const warm = () => { void loadWindowTexture(scene.preview).catch(() => { }) }
                  return (
                    <button key={pointer.id} ref={(node) => {
                      if (node) cardRefs.current.set(pointer.id, node)
                      else cardRefs.current.delete(pointer.id)
                    }}
                      type="button" role="listitem"
                      className={`amenity-rail-card${hoveredId === pointer.id ? ' is-hot' : ''}`}
                      aria-label={`Explore ${pointer.label || scene.name} in 360 degrees`}
                      onPointerEnter={() => { warm(); setHoveredId(pointer.id) }}
                      onFocus={() => { warm(); setHoveredId(pointer.id) }}
                      onPointerLeave={() => setHoveredId((id) => (id === pointer.id ? null : id))}
                      onBlur={() => setHoveredId((id) => (id === pointer.id ? null : id))}
                      onClick={(event) => openView(scene, event)}>
                      <img src={assetUrl(scene.preview)} alt="" loading="lazy" />
                      <span className="amenity-rail-card__text">{pointer.label || scene.name}</span>
                      {/* <NavIcon name="chevron-right" /> */}
                    </button>
                  )
                })}
              </div>
            ))}
            {entries.map(({ pointer, scene }) => {
              const warm = () => { void loadWindowTexture(scene.preview).catch(() => { }) }
              return (
                <button key={`node-${pointer.id}`} type="button"
                  className={`amenity-node${hoveredId === pointer.id ? ' is-hot' : ''}`}
                  style={{ left: `${pointer.left}%`, top: `${pointer.top}%` }}
                  aria-label={`Explore ${pointer.label || scene.name} in 360 degrees`}
                  onPointerEnter={() => { warm(); setHoveredId(pointer.id) }}
                  onFocus={() => { warm(); setHoveredId(pointer.id) }}
                  onPointerLeave={() => setHoveredId((id) => (id === pointer.id ? null : id))}
                  onBlur={() => setHoveredId((id) => (id === pointer.id ? null : id))}
                  onClick={(event) => openView(scene, event)}>
                  <span className="amenity-node__core" aria-hidden="true" />
                </button>
              )
            })}
          </>
        )}
      </div>
      {!selected && <label className="amenities-scene-picker">Explore amenities
        <select value="" onChange={event => {
          const scene = AMENITY_SCENES.find(item => item.id === event.target.value)
          if (scene) openView(scene, event)
        }}>
          <option value="" disabled>Select a view</option>
          {AMENITY_SCENES.map(scene => <option key={scene.id} value={scene.id}>{scene.name}</option>)}
        </select>
      </label>}
      {landmark && !selected && (
        <PlacementPanel categories={placementCategories}
          instructions="Choose an amenity, then double-click its location on the image. Copy config saves the image coordinates for amenityPointers.js."
          placementCategory={placer.placementCategory} onPlacementCategory={placer.setPlacementCategory}
          onUndo={placer.undo} onClear={placer.clear} onCopy={placer.copyMarkers}
          canEdit={placer.placedMarkers.length > 0} didCopy={placer.didCopy} />
      )}
      {selected && (
        <>
          <AmenityPanorama scene={selected} onNavigate={setSelectedId} placementMode={panoramaPlacement} />
          <button ref={backRef} type="button" className="amenities-back" onClick={closeView}>
            <NavIcon name="chevron-left" />Back to amenities
          </button>
          <p className="amenities-view-name">{selected.name}</p>
        </>
      )}
      {imageFailed && !selected && <p className="amenities-image-error" role="alert">The amenities image could not be loaded. <button type="button" onClick={() => { setImageFailed(false); setImageReady(false); setImageAttempt(value => value + 1) }}>Try again</button></p>}
    </main>
  )
}
