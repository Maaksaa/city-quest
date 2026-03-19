<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useFogOfWar } from '@/composables/useFogOfWar'
import type { LngLat } from '@/utils/geo'

const container = ref<HTMLElement>()
let map: maplibregl.Map | null = null

const { exploredPercent, buildFogGeoJSON, addPoint } = useFogOfWar()

function updateFog() {
  const source = map?.getSource('fog') as maplibregl.GeoJSONSource | undefined
  source?.setData(buildFogGeoJSON())
}

onMounted(() => {
  map = new maplibregl.Map({
    container: container.value!,
    style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${import.meta.env.VITE_MAPTILER_KEY}`,
    center: [19.8335, 45.2671],
    zoom: 13,
  })

  const geolocate = new maplibregl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true,
    },
    trackUserLocation: true,
  })

  map.addControl(geolocate)

  map.on('load', () => {
    map!.addSource('fog', {
      type: 'geojson',
      data: buildFogGeoJSON(),
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

    geolocate.on('geolocate', (e: GeolocationPosition) => {
      const point: LngLat = [e.coords.longitude, e.coords.latitude]
      if (addPoint(point)) {
        updateFog()
      }
    })
  })
})

onUnmounted(() => {
  map?.remove()
})
</script>

<template>
  <div class="stats">{{ exploredPercent }}% explored</div>
  <div ref="container" class="map-container" />
</template>

<style scoped>
.map-container {
  width: 100vw;
  height: 100vh;
}

.stats {
  position: absolute;
  top: 16px;
  left: 16px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  z-index: 1;
}
</style>
