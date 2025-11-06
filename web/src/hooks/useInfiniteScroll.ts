import { useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";

interface UseInfiniteScrollOptions {
  onLoadMore: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  threshold?: number;
  rootMargin?: string;
}

export const useInfiniteScroll = ({
  onLoadMore,
  hasNextPage,
  isFetchingNextPage,
  threshold = 0.1,
  rootMargin = "100px",
}: UseInfiniteScrollOptions) => {
  const { ref, inView } = useInView({
    threshold,
    rootMargin,
  });

  const previousInView = useRef(false);

  useEffect(() => {
    // Only trigger if transitioning from not in view to in view
    if (
      inView &&
      !previousInView.current &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      onLoadMore();
    }
    previousInView.current = inView;
  }, [inView, hasNextPage, isFetchingNextPage, onLoadMore]);

  return { ref };
};

// Alternative implementation with callback ref
export const useInfiniteScrollCallback = (
  callback: () => void,
  hasMore: boolean,
  isLoading: boolean,
) => {
  const observer = useRef<IntersectionObserver | null>(null);

  const lastElementRef = (node: HTMLElement | null) => {
    if (isLoading) return;

    if (observer.current) {
      observer.current.disconnect();
    }

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        callback();
      }
    });

    if (node) {
      observer.current.observe(node);
    }
  };

  return lastElementRef;
};

// Save and restore scroll position
export const useScrollPosition = (key: string) => {
  const scrollPositions = useRef<{ [key: string]: number }>({});

  const saveScrollPosition = () => {
    scrollPositions.current[key] = window.scrollY;
  };

  const restoreScrollPosition = () => {
    const savedPosition = scrollPositions.current[key];
    if (savedPosition !== undefined) {
      window.scrollTo(0, savedPosition);
    }
  };

  useEffect(() => {
    restoreScrollPosition();

    const handleScroll = () => {
      saveScrollPosition();
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      saveScrollPosition();
    };
  }, [key]);

  return { saveScrollPosition, restoreScrollPosition };
};
