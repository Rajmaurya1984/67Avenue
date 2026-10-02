import { lazy, Suspense, useCallback, useState } from 'react'
import SiteHeader from '../components/site/SiteHeader.jsx'
import NavIcon from '../components/site/NavIcon.jsx'
import WindowView from '../components/window-view/WindowView.jsx'
import { EYE_HOTSPOT, FLOOR_PLAN_IMAGE } from '../data/windowView.js'
import { assetUrl } from '../lib/utils.js'
import './Editorial.css'
import './Plan.css'

// WindowView page (nav "WindowView" -> /plan): the typical floor plan is a
// fitted hero image within the available stage. The eye opens <WindowView>.
// No pan or zoom: the hotspot tracks the drawing via % of the plan image.
const FlatTour = lazy(() => import('../components/flat-tour/FlatTour.jsx'))

export default function Plan() {
  const [tourOpen, setTourOpen] = useState(false)
  const [planLoaded, setPlanLoaded] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)

  const openView = useCallback(() => setViewOpen(true), [])
  const closeView = useCallback(() => setViewOpen(false), [])

  return (
    <main className="editorial-page editorial-page--plan">
      <SiteHeader />
      <section className="plan-welcome" aria-label="Explore the residences">
        {/* <p>THE RESIDENCES</p><h1>Your next perspective.</h1> */}
        <button type="button" className="flat-three-trigger" onClick={() => setTourOpen(true)}><span><small>2 BHK · INTERACTIVE TOUR</small>Flat no 3</span></button>
      </section>
      <p className="plan-view-hint">Explore Flat, or select the eye on the plan to discover the window views.</p>
      <div className="editorial-page__body">
        <div className={`floorplan-stage${planLoaded ? ' is-loaded' : ''} is-fixed`}>
          <div className="floorplan-stage__frame">
            <img
              className="floorplan-stage__plan"
              src={assetUrl(FLOOR_PLAN_IMAGE)}
              alt="Typical floor plan"
              width="8000"
              height="5657"
              draggable={false}
              onLoad={() => setPlanLoaded(true)}
            />
            {planLoaded && (
              <>
                <button
                  type="button"
                  className="floorplan-stage__eye"
                  style={{ left: `${EYE_HOTSPOT.left}%`, bottom: `${EYE_HOTSPOT.bottom}%` }}
                  onClick={openView}
                  aria-label="Open the window view"
                >
                  <NavIcon name="eye" />
                </button>
              </>
            )}
          </div>
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
      <WindowView open={viewOpen} onClose={closeView} preload={planLoaded} />
    </main>
  )
}
