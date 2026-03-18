<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

const container = ref<HTMLElement>()
let map: maplibregl.Map | null = null

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

onMounted(() => {
  map = new maplibregl.Map({
    container: container.value!,
    style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${import.meta.env.VITE_MAPTILER_KEY}`,
    center: [19.8335, 45.2671],
    zoom: 13,
  })

  // кнопка и определение гео
  map.addControl(
    new maplibregl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
    }),
  )

  // доп слой поверх карты
  map.on('load', () => {
    map!.addSource('fog', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [outerRing, createHole([19.8335, 45.2671], 50)],
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
  })
})

onUnmounted(() => {
  map?.remove()
})
</script>

<template>
  <div ref="container" style="width: 100vw; height: 100vh" />
</template>
