import { useEffect, useRef } from 'react'

export default function RotateDeviceOverlay() {
  const dialogRef = useRef(null)

  useEffect(() => {
    const portrait = window.matchMedia('(max-width: 767px) and (orientation: portrait)')
    const dialog = dialogRef.current
    const syncOrientation = () => {
      if (portrait.matches && !dialog.open) dialog.showModal()
      if (!portrait.matches && dialog.open) dialog.close()
    }
    syncOrientation()
    portrait.addEventListener('change', syncOrientation)
    return () => {
      portrait.removeEventListener('change', syncOrientation)
      if (dialog.open) dialog.close()
    }
  }, [])

  return (
    <dialog ref={dialogRef} className="rotate-device-overlay"
      aria-labelledby="rotate-device-title" aria-describedby="rotate-device-description"
      onCancel={event => event.preventDefault()}>
      <div className="rotate-content">
        <svg className="phone-icon" width="48" height="72" viewBox="0 0 48 72" fill="none" aria-hidden="true">
          <rect x="7" y="3" width="34" height="66" rx="6" stroke="currentColor" strokeWidth="2" />
          <path d="M19 9h10M21 62h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <h2 id="rotate-device-title">Rotate your device</h2>
        <p id="rotate-device-description">For the best view of 67 Avenue,<br />please turn your phone to landscape.</p>
      </div>
    </dialog>
  )
}
