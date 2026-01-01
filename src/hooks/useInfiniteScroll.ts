import { useState, useCallback, useEffect, useRef } from 'react';
import { FilterParams, PaginatedResponse } from '@/types';

interface UseInfiniteScrollOptions<T> {
  fetchFn: (params: FilterParams) => Promise<PaginatedResponse<T>>;
  pageSize?: number;
}

// Place this at the top of the file
const DEFAULT_FILTERS: FilterParams = {
  page: 1,
  pageSize: 20,
  search: '',
  startDate: undefined,
  endDate: undefined,
};

export function useInfiniteScroll<T>({ fetchFn, pageSize = 20 }: UseInfiniteScrollOptions<T>) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [filters, setFilters] = useState<FilterParams>({ ...DEFAULT_FILTERS, pageSize });
  const filtersRef = useRef<FilterParams>({ ...DEFAULT_FILTERS, pageSize });


  const fetchData = useCallback(async (params: FilterParams, append = false) => {
    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }

    try {
      const response = await fetchFn(params);
      if (append) {
        setData(prev => [...prev, ...response.data]);
      } else {
        setData(response.data);
      }
      setTotal(response.total);
      // const totalPages = Math.ceil(response.total / params.pageSize);

      setHasMore(response.page < response.totalPages);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [fetchFn]);

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;

    const nextPage = filtersRef.current.page + 1;
    const updatedFilters = { ...filtersRef.current, page: nextPage };

    filtersRef.current = updatedFilters;
    setFilters(updatedFilters);
    fetchData(updatedFilters, true);
  }, [isLoadingMore, hasMore, fetchData]);


  const updateFilters = useCallback((newFilters: FilterParams) => {
    const updatedFilters = {
      ...filtersRef.current, // keep current filters
      ...newFilters,         // overwrite changed filters
      page: 1,               // reset to first page
    };

    filtersRef.current = updatedFilters; // update ref for fetchFn
    setFilters(updatedFilters);          // update state for UI

    fetchData(updatedFilters, false);    // fetch with updated filters
  }, [fetchData]);



  const refresh = useCallback(() => {
    const resetFilters = { ...filtersRef.current, page: 1 };
    filtersRef.current = resetFilters;
    setFilters(resetFilters);
    fetchData(resetFilters, false);
  }, [fetchData]);


  // Initial fetch
  useEffect(() => {
      fetchData(filters, false);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Intersection observer for infinite scroll
    useEffect(() => {
      if (!loadMoreRef.current) return;

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !isLoadingMore && !isLoading) {
            loadMore();
          }
        },
        { threshold: 0.1 }
      );

      observer.observe(loadMoreRef.current);

      return () => observer.disconnect();
    }, [hasMore, isLoading, isLoadingMore, loadMore]);



  return {
    data,
    filters,
    isLoading,
    isLoadingMore,
    hasMore,
    total,
    loadMoreRef,
    loadMore,
    updateFilters,
    refresh,
    setData,
  };
}
