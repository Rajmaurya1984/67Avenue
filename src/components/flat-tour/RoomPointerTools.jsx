/* eslint-disable react-refresh/only-export-components */
import { useEffect, useState } from 'react'
import { FLAT_THREE_ROOMS } from '../../data/flatThree.js'
import { PlacementPanel } from '../landmarks/index.js'
const KEY = '67avenue-flat03-room-pointers-v1'
export function useRoomPointers(sourceScene) {
  const [destination, setDestination] = useState('')
  const [copied, setCopied] = useState(false)
  const [json, setJson] = useState('')
  const [message, setMessage] = useState('')
  const [markers, setMarkers] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || '[]')
      return Array.isArray(saved) ? saved.filter(m => typeof m.id === 'string'
        && FLAT_THREE_ROOMS.some(r => r.id === m.sourceScene) && FLAT_THREE_ROOMS.some(r => r.id === m.category)
        && Array.isArray(m.position) && m.position.length === 3 && m.position.every(Number.isFinite)) : []
    } catch { return [] }
  })
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(markers)) } catch { /* JSON export remains available. */ }
  }, [markers])
  const categories = FLAT_THREE_ROOMS.filter(r => r.id !== sourceScene).map(r => ({ id: r.id, label: r.name }))
  const target = categories.some(c => c.id === destination) ? destination : categories[0].id
  const current = markers.filter(m => m.sourceScene === sourceScene)
  const place = position => {
    setCopied(false)
    setMarkers(list => [...list, { id: crypto.randomUUID(), sourceScene,
      category: target, title: FLAT_THREE_ROOMS.find(r => r.id === target).name, description: '', position }])
  }
  const undo = () => { const last = current.at(-1)?.id; setMarkers(list => list.filter(m => m.id !== last)); setCopied(false) }
  const clear = () => { setMarkers(list => list.filter(m => m.sourceScene !== sourceScene)); setCopied(false) }
  const copy = async () => {
    const text = JSON.stringify(markers.map(({ sourceScene, title, category, description, position }) => ({ sourceScene, title, category, description, position })), null, 2)
    setJson(text)
    try { await navigator.clipboard.writeText(text); setCopied(true); setMessage('Copied all room pointers. Paste the JSON into the chat.') }
    catch { setMessage('Select and copy the JSON below.') }
  }
  return { categories, target, setDestination, current, markers, place, undo, clear, copy, copied, json, message }
}
export function RoomPointerPanel({ tools, name }) {
  return <aside className="flat-pointer-tools" aria-label="Room pointer placement">
    <PlacementPanel categories={tools.categories} placementCategory={tools.target} onPlacementCategory={tools.setDestination}
      instructions={`In ${name}: choose the destination room, then double-click its doorway or location. Undo/Clear affect this room; Copy exports every room.`}
      onUndo={tools.undo} onClear={tools.clear} onCopy={tools.copy} canEdit={tools.current.length > 0} didCopy={tools.copied} />
    <p>{tools.current.length} pointers here · {tools.markers.length} total</p>
    {!tools.current.length && tools.markers.length > 0 && <button type="button" onClick={tools.copy}>Copy all rooms</button>}
    {tools.message && <p role="status">{tools.message}</p>}
    {tools.json && <textarea aria-label="Room pointer JSON" value={tools.json} readOnly onFocus={e => e.target.select()} />}
  </aside>
}