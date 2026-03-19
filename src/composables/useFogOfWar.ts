import { computed, ref } from 'vue'
import type { LngLat } from '@/utils/geo'
import { createHole, getDistance, outerRing } from '@/utils/geo'
import { loadPoints, savePoints } from '@/utils/storage'

const HOLE_SIZE = 50
const HOLE_AREA = (HOLE_SIZE * 2) ** 2
const CITY_AREA = 4_000_000
const MIN_DISTANCE = 20

export function useFogOfWar() {
  const visitedPoints = ref<LngLat[]>(loadPoints())

  const exploredPercent = computed(() => {
    const explored = visitedPoints.value.length * HOLE_AREA
    const percent = (explored / CITY_AREA) * 100
    return Math.min(percent, 100).toFixed(1)
  })

  function buildFogGeoJSON() {
    const holes = visitedPoints.value.map((p) => createHole(p, HOLE_SIZE))
    return {
      type: 'Feature' as const,
      properties: {},
      geometry: {
        type: 'Polygon' as const,
        coordinates: [outerRing, ...holes],
      },
    }
  }

  function addPoint(point: LngLat): boolean {
    const tooClose = visitedPoints.value.some((p) => getDistance(p, point) < MIN_DISTANCE)
    if (tooClose) return false

    visitedPoints.value.push(point)
    savePoints(visitedPoints.value)
    return true
  }

  return {
    visitedPoints,
    exploredPercent,
    buildFogGeoJSON,
    addPoint,
  }
}
