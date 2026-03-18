<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

const container = ref<HTMLElement>()
let map: maplibregl.Map | null = null

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
})

onUnmounted(() => {
  map?.remove()
})
</script>

<template>
  <div ref="container" style="width: 100vw; height: 100vh" />
</template>
