import { preparePageTransition } from './pageTransition.js'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { NAV_MENU, SITE } from '../../data/site.js'
import NavIcon from './NavIcon.jsx'
import { assetUrl } from '../../lib/utils.js'
import PagePager from './PagePager.jsx'
import './SiteChrome.css'

// Floating site chrome, shared by every page:
//   - the brand pinned top-left (site-brand)
//   - the fixed bottom pill dock with the five menu items (site-dock)
// Nav content (label, route, icon) comes from NAV_MENU in data/site.js.
export default function SiteHeader() {
  const { pathname } = useLocation()
  return (
    <>
      <Link viewTransition onClick={(event) => preparePageTransition(event, pathname, '/')} className="site-brand" to="/" aria-label="67 Avenue home">
        <img src={assetUrl(SITE.logo)} alt="" />
      </Link>
      <nav className="site-dock" aria-label="Main navigation">
        <ul className="site-dock__list">
          {NAV_MENU.map((item) => (
            <li key={item.to}>
              <NavLink viewTransition
                to={item.to}
                onClick={(event) => preparePageTransition(event, pathname, item.to)}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `site-dock__item${isActive ? ' is-active' : ''}`
                }
              >
                <span className="site-dock__icon" aria-hidden="true" style={{ viewTransitionName: `menu-icon-${item.icon}` }}>
                  <NavIcon name={item.icon} />
                </span>
                <span className="site-dock__label">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <PagePager />
    </>
  )
}
