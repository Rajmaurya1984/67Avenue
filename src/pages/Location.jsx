import SiteHeader from '../components/site/SiteHeader.jsx'
import LandmarkPanorama from '../components/location-map/LandMark/LandMarkPanaroma.jsx'
import './Editorial.css'
import './Location.css'

// Set it to true when authoring landmark coordinates.
const landmark = false

export default function Location() {
  return (
    <main className="editorial-page editorial-page--panorama">
      <SiteHeader />
      <LandmarkPanorama placementMode={landmark} />
    </main>
  )
}
