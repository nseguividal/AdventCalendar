import { supabase } from './supabase'

/**
 * Extreu la ruta relativa del fitxer dins del bucket a partir d'una URL pública de Supabase Storage.
 * Retorna null si la URL no pertany a aquest bucket o no és vàlida.
 */
export function extractStoragePath(
  url: string | null | undefined,
  bucket = 'calendar-media'
): string | null {
  if (!url || typeof url !== 'string') return null

  // Identificar el segment del bucket dins de la URL de Supabase (ex: /calendar-media/)
  const bucketMarker = `/${bucket}/`
  const index = url.indexOf(bucketMarker)
  if (index === -1) return null

  const rawPath = url.slice(index + bucketMarker.length)
  // Eliminar paràmetres de query o fragments (?t=... o #...)
  const cleanPath = rawPath.split('?')[0].split('#')[0]

  if (!cleanPath) return null

  try {
    return decodeURIComponent(cleanPath)
  } catch {
    return cleanPath
  }
}

/**
 * Elimina un fitxer de Supabase Storage si pertany al bucket especificat.
 * Retorna true si s'ha eliminat o si no calia eliminar-lo (ex: imatges externes d'Unsplash).
 */
export async function deleteStorageFile(
  url: string | null | undefined,
  bucket = 'calendar-media'
): Promise<boolean> {
  if (!url) return true

  const filePath = extractStoragePath(url, bucket)
  if (!filePath) {
    // La imatge no prové de Supabase Storage (ex: Unsplash o URL externa local), no fem res
    return true
  }

  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath])

    if (error) {
      console.warn(`[Storage] No s'ha pogut eliminar ${filePath} de '${bucket}':`, error.message)
      return false
    }

    return true
  } catch (err) {
    console.warn('[Storage] Error inesperat en eliminar el fitxer de storage:', err)
    return false
  }
}

/**
 * Elimina tots els fitxers de la carpeta d'un calendari (ex: en esborrar el calendari complet del dashboard).
 */
export async function deleteCalendarStorageFolder(
  calendarId: string,
  bucket = 'calendar-media'
): Promise<boolean> {
  if (!calendarId) return true

  try {
    const { data: files, error: listError } = await supabase.storage
      .from(bucket)
      .list(calendarId)

    if (listError || !files || files.length === 0) {
      return true
    }

    const pathsToRemove = files.map((f) => `${calendarId}/${f.name}`)
    const { error: removeError } = await supabase.storage
      .from(bucket)
      .remove(pathsToRemove)

    if (removeError) {
      console.warn(`[Storage] Error eliminant fitxers de la carpeta ${calendarId}:`, removeError.message)
      return false
    }

    return true
  } catch (err) {
    console.warn('[Storage] Error en eliminar la carpeta del calendari:', err)
    return false
  }
}

