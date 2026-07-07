'use client'

import { useRef, useState } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import { useFocusTrap } from '@/lib/use-focus-trap'
import { getCroppedImageBlob } from '@/lib/admin/crop-image'

interface ImageCropModalProps {
  imageSrc: string
  mimeType: string
  aspect: number
  cropShape: 'rect' | 'round'
  onCancel: () => void
  onConfirm: (blob: Blob) => void
}

export default function ImageCropModal({ imageSrc, mimeType, aspect, cropShape, onCancel, onConfirm }: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [processing, setProcessing] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useFocusTrap(panelRef, true, onCancel)

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return
    setProcessing(true)
    try {
      const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels, mimeType)
      onConfirm(blob)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4" onClick={(e) => { e.stopPropagation(); onCancel() }}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="crop-modal-title"
        className="flex w-full max-w-lg flex-col rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="crop-modal-title" className="mb-1 font-heading text-sm font-semibold text-gray-800">
          Adjust Image
        </h3>
        <p className="mb-4 font-body text-xs text-gray-400">
          Drag to reposition, use the slider to zoom — the highlighted area is exactly what will be shown.
        </p>

        <div className="relative h-80 w-full overflow-hidden rounded-xl bg-gray-900">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            cropShape={cropShape}
            showGrid={cropShape === 'rect'}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_area, areaPixels) => setCroppedAreaPixels(areaPixels)}
          />
        </div>

        <div className="mt-4 flex items-center gap-3">
          <span className="font-body text-xs text-gray-400">Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-primary"
            aria-label="Zoom"
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={processing}
            className="rounded-xl border border-gray-200 px-4 py-2 font-heading text-sm font-semibold text-gray-600 transition-colors hover:border-gray-300 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={processing || !croppedAreaPixels}
            className="rounded-xl bg-primary px-5 py-2 font-heading text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
          >
            {processing ? 'Applying…' : 'Apply & Upload'}
          </button>
        </div>
      </div>
    </div>
  )
}
