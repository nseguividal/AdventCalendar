'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { deleteStorageFile } from '@/lib/storage'
import { Upload, X, Image as ImageIcon, Loader2, Link2, Check, Crop } from 'lucide-react'
import { ImageCropperModal } from './ImageCropperModal'

interface ImageUploaderProps {
  value: string
  onChange: (url: string) => void
  calendarId?: string
  label?: string
  sublabel?: string
  compact?: boolean
  aspectRatio?: 'square' | 'wide' | 'auto'
  enableCropper?: boolean
  cropAspectRatio?: number // default 1.5 (3:2)
}

export function ImageUploader({
  value,
  onChange,
  calendarId,
  label,
  sublabel,
  compact = false,
  aspectRatio = 'square',
  enableCropper = false,
  cropAspectRatio = 1.5,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [manualUrl, setManualUrl] = useState(value || '')

  // Estat del retallador d'imatges
  const [isCropperOpen, setIsCropperOpen] = useState(false)
  const [cropperFile, setCropperFile] = useState<File | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipus de fitxer
    if (!file.type.startsWith('image/')) {
      setError('Si us plau, selecciona un fitxer d\'imatge vàlid (JPG, PNG, WebP, etc.).')
      return
    }

    // Validar mida màxima (15MB)
    if (file.size > 15 * 1024 * 1024) {
      setError('La imatge supera el límit màxim de 15MB.')
      return
    }

    if (enableCropper) {
      // Obrir el modal de retallador interactiu amb previsualització
      setCropperFile(file)
      setIsCropperOpen(true)
    } else {
      await uploadBlob(file, file.name)
    }
  }

  const uploadBlob = async (blob: Blob | File, originalName: string) => {
    setError(null)
    setUploading(true)

    try {
      const fileExt = originalName.split('.').pop()?.toLowerCase() || 'jpg'
      const cleanFileName = originalName
        .replace(/\.[^/.]+$/, '')
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .substring(0, 25)

      const folder = calendarId || 'general'
      const filePath = `${folder}/${Date.now()}_${cleanFileName}.${fileExt === 'blob' ? 'jpg' : fileExt}`

      // Pujada a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('calendar-media')
        .upload(filePath, blob, {
          contentType: blob.type || 'image/jpeg',
          cacheControl: '3600',
          upsert: true,
        })

      if (uploadError) {
        console.error('Error pujant a Supabase Storage:', uploadError)
        setError(
          uploadError.message.includes('bucket not found')
            ? "No s'ha trobat el bucket 'calendar-media'. Comprova que estigui creat a Supabase Storage."
            : `Error en pujar la imatge: ${uploadError.message}`
        )
        setUploading(false)
        return
      }

      // Obtenir la URL pública
      const { data: urlData } = supabase.storage
        .from('calendar-media')
        .getPublicUrl(filePath)

      const publicUrl = urlData.publicUrl

      // Si ja hi havia una imatge anterior a Supabase, l'eliminem per estalviar espai
      const previousUrl = value
      if (previousUrl && previousUrl !== publicUrl) {
        deleteStorageFile(previousUrl).catch(() => {})
      }

      onChange(publicUrl)
      setManualUrl(publicUrl)
    } catch (err: any) {
      console.error('Error inesperat:', err)
      setError("S'ha produït un error en pujar la imatge.")
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleCropComplete = async (croppedBlob: Blob) => {
    setIsCropperOpen(false)
    const name = cropperFile ? cropperFile.name : 'puzzle-photo.jpg'
    await uploadBlob(croppedBlob, name)
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    const file = e.dataTransfer.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError("Si us plau, arrossega un fitxer d'imatge vàlid.")
        return
      }
      if (enableCropper) {
        setCropperFile(file)
        setIsCropperOpen(true)
      } else {
        await uploadBlob(file, file.name)
      }
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleApplyManualUrl = () => {
    const trimmed = manualUrl.trim()
    const previousUrl = value
    onChange(trimmed)
    setShowUrlInput(false)

    if (previousUrl && previousUrl !== trimmed) {
      deleteStorageFile(previousUrl).catch(() => {})
    }
  }

  const handleClear = () => {
    const previousUrl = value
    onChange('')
    setManualUrl('')
    setError(null)

    if (previousUrl) {
      deleteStorageFile(previousUrl).catch(() => {})
    }
  }

  const aspectClass =
    aspectRatio === 'square'
      ? 'aspect-square'
      : aspectRatio === 'wide'
      ? 'aspect-[3/2]'
      : 'min-h-[140px]'

  if (compact) {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-[10px] font-semibold text-[#7e7368] uppercase tracking-wider">
            {label}
          </label>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex items-center gap-2">
          {value ? (
            <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-[#d8cdbf] shrink-0 bg-[#f4ede3] group">
              <img
                src={value}
                alt="Vista prèvia"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={handleClear}
                className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                title="Eliminar imatge"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="w-12 h-12 rounded-xl border border-dashed border-[#d8cdbf] bg-[#f8f4ed] flex items-center justify-center text-[#7e7368] shrink-0">
              <ImageIcon className="w-5 h-5 text-[#9c9184]" />
            </div>
          )}

          <div className="flex-1 flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0f4437] hover:bg-[#145647] text-white text-xs font-bold rounded-xl transition shadow-xs disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Pujant...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>{value ? 'Canviar foto' : 'Pujar foto'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="inline-flex items-center gap-1 text-[11px] text-[#6e6358] hover:text-[#0f4437] hover:underline px-1 py-1 font-medium"
            >
              <Link2 className="w-3 h-3" />
              <span>URL</span>
            </button>
          </div>
        </div>

        {showUrlInput && (
          <div className="flex gap-1.5 pt-1 animate-in fade-in">
            <input
              type="text"
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              placeholder="https://... o /doors/1.png"
              className="flex-1 px-2.5 py-1 text-xs bg-white border border-[#d8cdbf] rounded-lg text-[#2c2825] focus:outline-none focus:ring-1 focus:ring-[#0f4437]"
            />
            <button
              type="button"
              onClick={handleApplyManualUrl}
              className="px-2.5 py-1 bg-[#f4ede3] hover:bg-[#eae0d2] text-[#0f4437] text-xs font-bold rounded-lg transition"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {error && (
          <p className="text-[11px] text-red-600 font-medium">
            ⚠️ {error}
          </p>
        )}

        {/* Modal de retallar */}
        {enableCropper && (
          <ImageCropperModal
            isOpen={isCropperOpen}
            imageFile={cropperFile}
            aspectRatio={cropAspectRatio}
            onClose={() => setIsCropperOpen(false)}
            onCropComplete={handleCropComplete}
          />
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2.5">
      {label && (
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-xs font-bold text-[#0f4437]">
              {label}
            </label>
            {sublabel && (
              <p className="text-[11px] text-[#7e7368]">
                {sublabel}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-[11px] text-[#248896] hover:underline flex items-center gap-1 font-semibold"
          >
            <Link2 className="w-3 h-3" />
            <span>{showUrlInput ? 'Amagar URL' : 'O enganxar URL'}</span>
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {value ? (
        <div className="relative group rounded-2xl overflow-hidden border-2 border-[#e8dfd3] shadow-sm bg-[#f4ede3]">
          <div className={`w-full ${aspectClass} relative`}>
            <img
              src={value}
              alt="Foto seleccionada"
              className="w-full h-full object-cover"
            />

            {/* Si és el trencaclosques, mostrem una subtil quadrícula 6x4 d'orientació */}
            {enableCropper && (
              <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div key={i} className="border border-white/20" />
                ))}
              </div>
            )}
          </div>

          <div className="absolute inset-0 bg-[#0a2c22]/65 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2.5 p-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 bg-white hover:bg-[#faf6f2] text-[#0f4437] text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" /> Canviar i re-enquadrar
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="px-3.5 py-2 bg-[#b91c1c] hover:bg-[#a11818] text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" /> Eliminar
            </button>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer rounded-2xl border-2 border-dashed border-[#d8cdbf] hover:border-[#0f4437] bg-[#fbf8f3] hover:bg-[#f6efe4] transition p-5 text-center flex flex-col items-center justify-center gap-2.5 ${aspectClass}`}
        >
          {uploading ? (
            <div className="space-y-2">
              <Loader2 className="w-8 h-8 text-[#0f4437] animate-spin mx-auto" />
              <p className="text-xs font-bold text-[#0f4437]">
                Pujant imatge a Supabase...
              </p>
              <p className="text-[10px] text-[#7e7368]">
                S'està desant al núvol amb format òptim
              </p>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-2xl bg-[#0f4437]/10 text-[#0f4437] flex items-center justify-center">
                {enableCropper ? <Crop className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
              </div>
              <div>
                <p className="text-xs font-bold text-[#0f4437]">
                  {enableCropper
                    ? 'Clica per seleccionar i enquadrar la foto (3:2)'
                    : 'Clica per pujar o arrossega la imatge aquí'}
                </p>
                <p className="text-[11px] text-[#7e7368] mt-0.5">
                  {enableCropper
                    ? 'Podràs fer zoom i arrossegar-la per veure exactament les 24 peces'
                    : 'JPG, PNG, WebP o HEIC (màx. 15MB)'}
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {showUrlInput && (
        <div className="flex gap-2 pt-1 animate-in fade-in">
          <input
            type="text"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            placeholder="https://... o /puzzle.png"
            className="flex-1 px-3 py-1.5 text-xs bg-white border border-[#d8cdbf] rounded-xl text-[#2c2825] focus:outline-none focus:ring-2 focus:ring-[#0f4437]/15 focus:border-[#0f4437]"
          />
          <button
            type="button"
            onClick={handleApplyManualUrl}
            className="px-3 py-1.5 bg-[#0f4437] hover:bg-[#145647] text-white text-xs font-bold rounded-xl transition"
          >
            Aplicar
          </button>
        </div>
      )}

      {error && (
        <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
          ⚠️ {error}
        </div>
      )}

      {/* Modal de retallar */}
      {enableCropper && (
        <ImageCropperModal
          isOpen={isCropperOpen}
          imageFile={cropperFile}
          aspectRatio={cropAspectRatio}
          onClose={() => setIsCropperOpen(false)}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  )
}
