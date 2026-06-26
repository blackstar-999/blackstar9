import { useInfiniteQuery } from '@tanstack/react-query'
import { Image } from 'lucide-react'
import { galleryApi } from '@/api/gallery'
import { GalleryGrid } from '@/components/features/gallery/GalleryGrid'
import { Button } from '@/components/ui/Button'

export default function PublicGalleryPage() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['gallery', 'public'],
    queryFn:  ({ pageParam = 1 }) => galleryApi.list(pageParam, 24),
    getNextPageParam: (last) => {
      const meta = last.data.meta
      return meta.current_page < meta.last_page ? meta.current_page + 1 : undefined
    },
    initialPageParam: 1,
  })

  const allItems = data?.pages.flatMap(p => p.data.data) ?? []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-10">
        <Image size={40} className="mx-auto text-brand-500 mb-4" />
        <h1 className="text-3xl font-bold text-surface-900 dark:text-white">Photo Gallery</h1>
        <p className="text-surface-500 mt-2">Memories from school life</p>
      </div>

      <GalleryGrid items={allItems} isLoading={isLoading} canLike={false} />

      {hasNextPage && (
        <div className="mt-8 flex justify-center">
          <Button variant="secondary" onClick={() => fetchNextPage()} loading={isFetchingNextPage}>
            Load more
          </Button>
        </div>
      )}
    </div>
  )
}
