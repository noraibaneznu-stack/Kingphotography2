'use client'

import { useState } from 'react'
import { Lock, Download, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Photo {
  id: string
  url: string
  thumbnail?: string
  name: string
}

interface PhotoGalleryProps {
  photos: Photo[]
  isLocked: boolean
  projectPassword?: string
}

export default function PhotoGallery({ photos, isLocked, projectPassword }: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number>(0)

  const openLightbox = (photo: Photo, index: number) => {
    if (!isLocked) {
      setSelectedPhoto(photo)
      setSelectedIndex(index)
    }
  }

  const closeLightbox = () => {
    setSelectedPhoto(null)
  }

  const navigatePhoto = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' 
      ? (selectedIndex - 1 + photos.length) % photos.length
      : (selectedIndex + 1) % photos.length
    
    setSelectedPhoto(photos[newIndex])
    setSelectedIndex(newIndex)
  }

  const downloadPhoto = (photo: Photo) => {
    // Simulate download
    console.log('Downloading photo:', photo.name)
    const link = document.createElement('a')
    link.href = photo.url
    link.download = photo.name
    link.click()
  }

  const downloadAll = () => {
    console.log('Downloading all photos...')
    // Simulate bulk download
    photos.forEach((photo, index) => {
      setTimeout(() => downloadPhoto(photo), index * 500)
    })
  }

  // Generate placeholder images for demo
  const demoPhotos = photos.length > 0 ? photos : Array.from({ length: 12 }, (_, i) => ({
    id: `photo-${i}`,
    url: `https://picsum.photos/seed/${i}/800/600`,
    thumbnail: `https://picsum.photos/seed/${i}/300/200`,
    name: `photo-${i + 1}.jpg`,
  }))

  return (
    <div className="space-y-4">
      {/* Download All Button */}
      {!isLocked && (
        <div className="flex justify-end">
          <Button onClick={downloadAll} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download All ({demoPhotos.length})
          </Button>
        </div>
      )}

      {/* Photo Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {demoPhotos.map((photo, index) => (
          <div
            key={photo.id}
            className={cn(
              'relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 cursor-pointer group',
              isLocked ? 'cursor-not-allowed' : 'hover:shadow-lg transition-shadow'
            )}
            onClick={() => openLightbox(photo, index)}
          >
            <img
              src={photo.thumbnail || photo.url}
              alt={photo.name}
              className={cn(
                'w-full h-full object-cover',
                isLocked && 'blur-lg'
              )}
            />
            
            {/* Lock Overlay */}
            {isLocked && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-center text-white">
                  <Lock className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm font-medium">Payment Required</p>
                </div>
              </div>
            )}

            {/* Hover Overlay */}
            {!isLocked && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <Download 
                  className="h-8 w-8 text-white cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    downloadPhoto(photo)
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && !isLocked && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigatePhoto('prev')}
            className="absolute left-4 text-white hover:bg-white/20"
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigatePhoto('next')}
            className="absolute right-4 text-white hover:bg-white/20"
          >
            <ChevronRight className="h-8 w-8" />
          </Button>

          <div className="max-w-5xl max-h-full">
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.name}
              className="max-w-full max-h-[90vh] object-contain"
            />
            <div className="text-center mt-4 space-y-2">
              <p className="text-white text-sm">{selectedPhoto.name}</p>
              <Button
                onClick={() => downloadPhoto(selectedPhoto)}
                variant="outline"
                className="bg-white/10 text-white hover:bg-white/20 border-white/30"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
