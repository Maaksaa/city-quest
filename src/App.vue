<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

const container = ref<HTMLElement>()
let map: maplibregl.Map | null = null

const visitedPoints: [number, number][] = loadPoints()

// координаты слоя над городом
const BOUNDS = {
  west: 19.65,
  south: 45.18,
  east: 20.02,
  north: 45.36,
}

const outerRing: [number, number][] = [
  [BOUNDS.west, BOUNDS.south],
  [BOUNDS.east, BOUNDS.south],
  [BOUNDS.east, BOUNDS.north],
  [BOUNDS.west, BOUNDS.north],
  [BOUNDS.west, BOUNDS.south],
]
// пока для простоты буду вырезать квадрат, потом поменяю на круги или гексы или сетку или ещё что-то
function createHole(center: [number, number], sizeMeters: number): [number, number][] {
  const offset = sizeMeters / 111320

  return [
    [center[0] - offset, center[1] - offset],
    [center[0] + offset, center[1] - offset],
    [center[0] + offset, center[1] + offset],
    [center[0] - offset, center[1] + offset],
    [center[0] - offset, center[1] - offset],
  ]
}
// стандартная формула Haversine для расчёта между двумя точками
// на выходе получаем расстояние в метрах
function getDistance(a: [number, number], b: [number, number]): number {
  const R = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b[1] - a[1])
  const dLng = toRad(b[0] - a[0])
  const sin1 = Math.sin(dLat / 2)
  const sin2 = Math.sin(dLng / 2)
  const h = sin1 * sin1 + Math.cos(toRad(a[1])) * Math.cos(toRad(b[1])) * sin2 * sin2
  return 2 * R * Math.asin(Math.sqrt(h))
}

const STORAGE_KEY = 'city-quest-visited'

function savePoints() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(visitedPoints))
}

function loadPoints(): [number, number][] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

onMounted(() => {
  map = new maplibregl.Map({
    container: container.value!,
    style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${import.meta.env.VITE_MAPTILER_KEY}`,
    center: [19.8335, 45.2671],
    zoom: 13,
  })

  // кнопка и определение гео
  const geolocate = new maplibregl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true,
    },
    trackUserLocation: true,
  })

  map.addControl(geolocate)

  // доп слой поверх карты
  map.on('load', () => {
    map!.addSource('fog', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [outerRing],
        },
      },
    })

    map!.addLayer({
      id: 'fog-layer',
      type: 'fill',
      source: 'fog',
      paint: {
        'fill-color': '#000000',
        'fill-opacity': 0.6,
      },
    })

    if (visitedPoints.length > 0) {
      const source = map!.getSource('fog') as maplibregl.GeoJSONSource
      source.setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [outerRing, ...visitedPoints.map((p) => createHole(p, 50))],
        },
      })
    }

    // смотрим гео и вырезаем область
    geolocate.on('geolocate', (e: GeolocationPosition) => {
      const point: [number, number] = [e.coords.longitude, e.coords.latitude]

      const tooClose = visitedPoints.some((p) => getDistance(p, point) < 20)
      if (tooClose) return

      visitedPoints.push(point)
      savePoints()

      const source = map!.getSource('fog') as maplibregl.GeoJSONSource
      source.setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [outerRing, ...visitedPoints.map((p) => createHole(p, 50))],
        },
      })
    })
  })
})

onUnmounted(() => {
  map?.remove()
})
</script>

<template>
  <div ref="container" style="width: 100vw; height: 100vh" />
</template>
