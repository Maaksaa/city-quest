import type { LngLat } from './geo'

const STORAGE_KEY = 'city-quest-visited'

export function savePoints(points: LngLat[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(points))
}

export function loadPoints(): LngLat[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}
