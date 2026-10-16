import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import SiteHeader from '../components/site/SiteHeader.jsx'
import NavIcon from '../components/site/NavIcon.jsx'
import { INTERIOR_AMENITY_SCENES } from '../data/interiorAmenities.js'
import './Editorial.css'
import './Amenities.css'
import '../components/window-view/TourSceneMenu.css'
import './InteriorAmenities.css'

const AmenityPanorama = lazy(() => import('../components/amenity-tour/AmenityPanorama.jsx'))
const warmScene = (scene) => {
  void import('../components/window-view/windowTextures.js')
    .then(({ loadWindowTexture }) => loadWindowTexture(scene.image)).catch(() => {})
}

export default function InteriorAmenities() {
  const [selectedId, setSelectedId] = useState(INTERIOR_AMENITY_SCENES[0].id)
  const scene = INTERIOR_AMENITY_SCENES.find((item) => item.id === selectedId)
  const titleRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    titleRef.current?.focus()
    const onKeyDown = (event) => {
      if (event.key === 'Escape') navigate('/amenities')
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [navigate])

  return (
    <main className="editorial-page amenities-page interior-amenities-page" aria-label="Interior amenities">
      <SiteHeader showGroup={false} />
      <Suspense fallback={<p className="interior-amenities__loading" role="status">Opening interior amenities?</p>}>
        <AmenityPanorama scene={scene} onNavigate={setSelectedId} />
      </Suspense>
      {/* <div className="interior-amenities__heading">
        <p>Interior Amenities</p>
        <h1 ref={titleRef} tabIndex={-1} aria-live="polite">{scene.name}</h1>
      </div> */}
      <div className="amenities-tour-controls">
      <Link className="amenities-back" to="/amenities"><NavIcon name="chevron-left" />Back</Link>
      <nav className="minimal-room-stack" aria-label="Explore interior amenities">
        <div className="minimal-room-stack__title">Interior Amenities</div>
        {INTERIOR_AMENITY_SCENES.map((item, index) => (
          <button key={item.id} type="button" className={'stack-item' + (item.id === selectedId ? ' active' : '')}
            aria-pressed={item.id === selectedId}
            onPointerEnter={() => warmScene(item)} onFocus={() => warmScene(item)}
            onClick={() => setSelectedId(item.id)}>
            <span className="stack-item__number" aria-hidden="true">{index + 1}</span>
            <span className="stack-item__label">{item.name}</span>
          </button>
        ))}
      </nav>
      </div>
    </main>
  )
}
