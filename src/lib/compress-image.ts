const MAX_EDGE = 960
const JPEG_QUALITY = 0.68
const MAX_BYTES = 350_000

export async function compressNoteImage(file: File): Promise<Blob> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Envie um arquivo de imagem.')
  }

  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) {
    bitmap.close()
    throw new Error('Não foi possível processar a imagem.')
  }

  context.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY)
  })

  if (!blob) {
    throw new Error('Não foi possível compactar a imagem.')
  }

  if (blob.size > MAX_BYTES) {
    throw new Error('A imagem ainda ficou grande. Tente outra mais simples.')
  }

  return blob
}
