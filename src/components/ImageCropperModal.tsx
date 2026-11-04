'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { X, ZoomIn, ZoomOut, Check, Grid, Move } from 'lucide-react'

interface ImageCropperModalProps {
  isOpen: boolean
  imageFile: File | null
  aspectRatio?: number // default 1.5 (3:2 per a la quadrícula de 6x4)
  onClose: () => void
  onCropComplete: (croppedBlob: Blob) => void
}

export function ImageCropperModal({
  isOpen,
  imageFile,
  aspectRatio = 1.5, // 6 columnes / 4 files = 1.5 (3:2)
  onClose,
  onCropComplete,
}: ImageCropperModalProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  })

  // Estat d'enquadrament
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [showGrid, setShowGrid] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  // Carregar la imatge quan canvia imageFile
  useEffect(() => {
    if (!imageFile) {
      setImageSrc(null)
      return
    }

    const objectUrl = URL.createObjectURL(imageFile)
    setImageSrc(objectUrl)
    setZoom(1)
    setPan({ x: 0, y: 0 })

    const img = new Image()
    img.src = objectUrl
    img.onload = () => {
      setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight })
    }

    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [imageFile])

  // Gestió d'arrossegar amb ratolí o pantalla tàctil
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    setIsDragging(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return
    e.preventDefault()
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handlePointerUp = () => {
    setIsDragging(false)
  }

  // Generar la imatge retallada final via Canvas
  const handleConfirmCrop = useCallback(() => {
    if (!imageRef.current || !containerRef.current) return
    setIsProcessing(true)

    const container = containerRef.current.getBoundingClientRect()
    const imgEl = imageRef.current.getBoundingClientRect()

    // Dimensions del canvas de sortida (alta resolució 1200 x 800 per a 3:2)
    const targetWidth = 1200
    const targetHeight = Math.round(targetWidth / aspectRatio)

    const canvas = document.createElement('canvas')
    canvas.width = targetWidth
    canvas.height = targetHeight
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      setIsProcessing(false)
      return
    }

    // Calcular la proporció entre la mida visible i la mida del canvas
    const scaleToCanvas = targetWidth / container.width

    // Posició de la imatge respecte al marc retallador
    const relX = (imgEl.left - container.left) * scaleToCanvas
    const relY = (imgEl.top - container.top) * scaleToCanvas
    const relWidth = imgEl.width * scaleToCanvas
    const relHeight = imgEl.height * scaleToCanvas

    // Suavitzat d'imatge d'alta qualitat
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    // Dibuixar fons net
    ctx.fillStyle = '#f4ede3'
    ctx.fillRect(0, 0, targetWidth, targetHeight)

    // Dibuixar la imatge a la posició i escala calculades
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.src = imageRef.current.src
    image.onload = () => {
      ctx.drawImage(image, relX, relY, relWidth, relHeight)

      canvas.toBlob(
        (blob) => {
          setIsProcessing(false)
          if (blob) {
            onCropComplete(blob)
          }
        },
        'image/jpeg',
        0.92
      )
    }
  }, [aspectRatio, onCropComplete])

  if (!isOpen || !imageSrc) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#0a2c22]/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-[#e8dfd3] bg-[#fdfbf7] p-5 sm:p-6 text-[#2c2825] shadow-2xl flex flex-col max-h-[92vh]">
        {/* Capçalera */}
        <div className="flex items-center justify-between pb-3 border-b border-[#f0e8dc] mb-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#0f4437] flex items-center gap-2">
              <span>🧩</span>
              <span>Enquadrar la foto del Trencaclosques</span>
            </h3>
            <p className="text-xs text-[#6e6358] mt-0.5">
              Ajusta el zoom i arrossega la foto perquè es vegi perfecta a les 24 caselles
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-[#f4ede3] p-1.5 text-[#6e6358] hover:bg-[#eae0d2] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Zona de retall / enquadrament (Aspect Ratio exacte 3:2 = 6 columnes x 4 files) */}
        <div className="relative w-full flex-1 flex items-center justify-center bg-[#1a2e28] rounded-2xl overflow-hidden p-2">
          <div
            ref={containerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className="relative w-full aspect-[3/2] max-h-[50vh] overflow-hidden rounded-xl border-2 border-white/60 shadow-2xl cursor-grab active:cursor-grabbing select-none bg-black/40 touch-none"
          >
            {/* Imatge interactiva */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: 'center center',
              }}
            >
              <img
                ref={imageRef}
                src={imageSrc}
                alt="Foto per retallar"
                className="max-w-none select-none pointer-events-none"
                style={{
                  width: naturalSize.width >= naturalSize.height ? '100%' : 'auto',
                  height: naturalSize.height > naturalSize.width ? '100%' : 'auto',
                }}
                draggable={false}
              />
            </div>

            {/* Quadrícula de 6x4 per previsualitzar les 24 peces del trencaclosques */}
            {showGrid && (
              <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 pointer-events-none border border-white/40">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div
                    key={i}
                    className="border border-white/25 flex items-center justify-center"
                  >
                    <span className="text-[10px] text-white/50 font-bold select-none drop-shadow-xs">
                      {i + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Indicador d'ajuda flotant */}
            <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-white/90 text-[10px] font-medium flex items-center gap-1.5 pointer-events-none">
              <Move className="w-3 h-3" />
              <span>Arrossega per moure</span>
            </div>
          </div>
        </div>

        {/* Controls: Zoom i commutador de quadrícula */}
        <div className="pt-3 pb-2 space-y-2.5">
          <div className="flex items-center justify-between gap-3 text-xs">
            {/* Control de Zoom */}
            <div className="flex items-center gap-2 flex-1">
              <ZoomOut className="w-4 h-4 text-[#6e6358]" />
              <input
                type="range"
                min="0.8"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full accent-[#0f4437] h-1.5 bg-[#e8dfd3] rounded-lg cursor-pointer"
              />
              <ZoomIn className="w-4 h-4 text-[#0f4437]" />
              <span className="w-10 text-[11px] font-mono text-[#6e6358] text-right">
                {Math.round(zoom * 100)}%
              </span>
            </div>

            {/* Botó per alternar la quadrícula de 24 caselles */}
            <button
              type="button"
              onClick={() => setShowGrid(!showGrid)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                showGrid
                  ? 'bg-[#0f4437]/10 border-[#0f4437]/30 text-[#0f4437]'
                  : 'bg-white border-[#d8cdbf] text-[#6e6358]'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Caselles 6×4</span>
            </button>
          </div>

          <p className="text-[11px] text-[#7e7368] text-center">
            📐 La imatge es retallarà en format <strong>3:2 (6 columnes × 4 files)</strong> per garantir que es vegi <strong>100% sencera</strong> tant d'alçada com d'amplada al joc del calendari, sense retallar-se mai.
          </p>
        </div>

        {/* Botons d'acció */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#f0e8dc]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#6e6358] hover:text-[#2c2825] transition rounded-xl"
          >
            Cancel·lar
          </button>
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleConfirmCrop}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0f4437] hover:bg-[#145647] text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50 active:scale-[0.98]"
          >
            {isProcessing ? (
              <span>Processant retall...</span>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Retallar i desar fotografia</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

