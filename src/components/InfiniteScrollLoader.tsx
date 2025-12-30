import { Loader2 } from 'lucide-react';

interface InfiniteScrollLoaderProps {
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => void;
}

export default function InfiniteScrollLoader({
  isLoading,
  hasMore,
  loadMore,
}: InfiniteScrollLoaderProps) {
  if (!hasMore && !isLoading) return null;

  return (
    <div className="flex justify-center py-4">
      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading more...</span>
        </div>
      ) : hasMore ? (
        <button
          onClick={loadMore}
          className="text-sm text-primary hover:text-primary/80 transition-colors"
        >
          Load more
        </button>
      ) : null}
    </div>
  );
}
