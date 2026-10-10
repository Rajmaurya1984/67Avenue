import { lazy, Suspense, useCallback, useState } from 'react'
import SiteHeader from '../components/site/SiteHeader.jsx'
import NavIcon from '../components/site/NavIcon.jsx'
import WindowView from '../components/window-view/WindowView.jsx'
import { WINDOW_VIEW_DIRECTIONS, FLOOR_PLAN_IMAGE } from '../data/windowView.js'
import { assetUrl } from '../lib/utils.js'
import './Editorial.css'
import './Plan.css'

// WindowView page (nav "WindowView" -> /plan): the typical floor plan is a
// fitted hero image within the available stage. The eye opens <WindowView>.
// Window-view controls scale with the frame inside the image's clear margins.
const FlatTour = lazy(() => import('../components/flat-tour/FlatTour.jsx'))

export default function Plan() {
  const [tourOpen, setTourOpen] = useState(false)
  const [planLoaded, setPlanLoaded] = useState(false)
  const [viewDirection, setViewDirection] = useState(null)
  const [zoom] = useState(1)

  const closeView = useCallback(() => setViewDirection(null), [])
  return (
    <main className="editorial-page editorial-page--plan">
      <SiteHeader />
      <div className='flatNo'>
        <section className="plan-welcome" aria-label="Explore the residences">
        <button
          type="button"
          className="flat-three-trigger"
          onClick={() => setTourOpen(true)}
        >
          <span className="flat-three-trigger__label"><small>2 BHK</small>Flat no 3</span>
        </button>
        </section>
        <section className="plan-welcome" aria-label="Explore the residences">
          <button
            type="button"
            className="flat-three-trigger"
            onClick={() => setTourOpen(true)}
          >
            <span className="flat-three-trigger__label"><small>2 BHK</small>Flat no 3</span>
          </button>
        </section>
      </div>
      {!tourOpen && !viewDirection && <img
        className="plan-compass"
        src={assetUrl('/assets/home/compasslogo.png')}
        alt="Compass"
        draggable={false}
      />}
      <div className="editorial-page__body">
        <div className={`floorplan-stage${planLoaded ? ' is-loaded' : ''} is-fixed`}>
          <div className="floorplan-stage__frame" style={{ '--plan-zoom': zoom }}>
            <img
              className="floorplan-stage__plan"
              src={assetUrl(FLOOR_PLAN_IMAGE)}
              alt="Typical floor plan"
              width="8000"
              height="5657"
              draggable={false}
              onLoad={() => setPlanLoaded(true)}
            />
            {planLoaded && WINDOW_VIEW_DIRECTIONS.map(direction => (
                <button
                  key={direction.id}
                  type="button"
                  className="floorplan-stage__eye"
                  data-direction={direction.id}
                  onClick={() => setViewDirection(direction.id)}
                  aria-label={`Open ${direction.label} window view`}
                >
                  <NavIcon name="eye" />
                  
                </button>
            ))}
          </div>
          {/* <div className="floorplan-stage__controls" role="group" aria-label="Floor plan zoom">
            <button type="button" aria-label="Zoom out" disabled={!planLoaded || zoom <= 1} onClick={() => setZoom(value => Math.max(1, value - 0.25))}>−</button>
            <output aria-live="polite">{Math.round(zoom * 100)}%</output>
            <button type="button" aria-label="Zoom in" disabled={!planLoaded || zoom >= 2} onClick={() => setZoom(value => Math.min(2, value + 0.25))}>+</button>
            <button type="button" className="floorplan-stage__fit" disabled={!planLoaded} onClick={() => setZoom(1)}>Reset</button>
          </div> */}
          {!planLoaded && (
            <p className="floorplan-stage__loading" role="status" aria-live="polite">
              LOADING FLOOR PLAN
            </p>
          )}
        </div>
     
      </div>
      

      {tourOpen && <Suspense fallback={<p className="flat-tour-opening" role="status">Opening Flat no 3…</p>}>
        <FlatTour onClose={() => setTourOpen(false)} />
      </Suspense>}
      <WindowView open={!!viewDirection} direction={viewDirection} onClose={closeView} preload={planLoaded} />
    </main>
  )
}
