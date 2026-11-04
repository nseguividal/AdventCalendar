export interface FindCaganerConfig {
  title?: string
  hint?: string
  caganerX?: number // percentage (0-100)
  caganerY?: number // percentage (0-100)
  toleranceRadius?: number // percentage radius for tap tolerance, default 8%
  scenePreset?: 'pessebre' | 'village' | 'snow'
}

