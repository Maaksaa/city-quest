// Тип для координат [долгота, широта]
export type LngLat = [number, number]

// Количество метров в одном градусе широты (приблизительно)
const METERS_PER_DEGREE = 111320

// Границы зоны тумана войны (покрывает Нови-Сад с запасом)
const BOUNDS = {
  west: 19.65,
  south: 45.18,
  east: 20.02,
  north: 45.36,
}

// Внешнее кольцо полигона, замкнутый прямоугольник
export const outerRing: LngLat[] = [
  [BOUNDS.west, BOUNDS.south],
  [BOUNDS.east, BOUNDS.south],
  [BOUNDS.east, BOUNDS.north],
  [BOUNDS.west, BOUNDS.north],
  [BOUNDS.west, BOUNDS.south],
]

// Создаёт квадратную область в тумане вокруг точки
export function createHole(center: LngLat, sizeMeters: number): LngLat[] {
  const offset = sizeMeters / METERS_PER_DEGREE

  return [
    [center[0] - offset, center[1] - offset],
    [center[0] + offset, center[1] - offset],
    [center[0] + offset, center[1] + offset],
    [center[0] - offset, center[1] + offset],
    [center[0] - offset, center[1] - offset],
  ]
}

// Расстояние между двумя точками в метрах (формула Haversine)
export function getDistance(a: LngLat, b: LngLat): number {
  const R = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b[1] - a[1])
  const dLng = toRad(b[0] - a[0])
  const sin1 = Math.sin(dLat / 2)
  const sin2 = Math.sin(dLng / 2)
  const h = sin1 * sin1 + Math.cos(toRad(a[1])) * Math.cos(toRad(b[1])) * sin2 * sin2
  return 2 * R * Math.asin(Math.sqrt(h))
}
