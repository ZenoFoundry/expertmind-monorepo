import { useState, useEffect, useCallback, useRef } from 'react';

interface UseScrollManagerOptions {
  threshold?: number;
  debounceMs?: number;
}

interface ScrollState {
  isAtTop: boolean;
  isAtBottom: boolean;
  scrollPercentage: number;
  isScrolling: boolean;
}

export const useScrollManager = (
  containerRef: React.RefObject<HTMLElement>,
  options: UseScrollManagerOptions = {}
) => {
  const { threshold = 100, debounceMs = 150 } = options;
  
  const [scrollState, setScrollState] = useState<ScrollState>({
    isAtTop: true,
    isAtBottom: true,
    scrollPercentage: 0,
    isScrolling: false
  });

  const debounceTimerRef = useRef<NodeJS.Timeout>();
  const isScrollingTimerRef = useRef<NodeJS.Timeout>();

  const updateScrollState = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const maxScroll = scrollHeight - clientHeight;
    
    if (maxScroll <= 0) {
      // No scroll needed
      setScrollState({
        isAtTop: true,
        isAtBottom: true,
        scrollPercentage: 100,
        isScrolling: false
      });
      return;
    }

    const isAtTop = scrollTop <= threshold;
    const isAtBottom = scrollTop >= maxScroll - threshold;
    const scrollPercentage = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;

    setScrollState(prev => ({
      ...prev,
      isAtTop,
      isAtBottom,
      scrollPercentage: Math.min(100, Math.max(0, scrollPercentage))
    }));
  }, [containerRef, threshold]);

  const debouncedUpdateScrollState = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(updateScrollState, debounceMs);
  }, [updateScrollState, debounceMs]);

  const handleScroll = useCallback(() => {
    // Mark as scrolling immediately
    setScrollState(prev => ({ ...prev, isScrolling: true }));
    
    // Clear existing timer
    if (isScrollingTimerRef.current) {
      clearTimeout(isScrollingTimerRef.current);
    }
    
    // Update scroll state
    updateScrollState();
    
    // Mark as not scrolling after delay
    isScrollingTimerRef.current = setTimeout(() => {
      setScrollState(prev => ({ ...prev, isScrolling: false }));
    }, 150);
  }, [updateScrollState]);

  const scrollTo = useCallback((position: 'top' | 'bottom' | number, smooth = true) => {
    const container = containerRef.current;
    if (!container) return;

    let scrollTop: number;
    
    if (position === 'top') {
      scrollTop = 0;
    } else if (position === 'bottom') {
      scrollTop = container.scrollHeight - container.clientHeight;
    } else {
      scrollTop = position;
    }

    container.scrollTo({
      top: scrollTop,
      behavior: smooth ? 'smooth' : 'auto'
    });
  }, [containerRef]);

  const scrollBy = useCallback((delta: number, smooth = true) => {
    const container = containerRef.current;
    if (!container) return;

    container.scrollBy({
      top: delta,
      behavior: smooth ? 'smooth' : 'auto'
    });
  }, [containerRef]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial state
    updateScrollState();

    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (isScrollingTimerRef.current) {
        clearTimeout(isScrollingTimerRef.current);
      }
    };
  }, [containerRef, handleScroll, updateScrollState]);

  return {
    scrollState,
    scrollTo,
    scrollBy,
    updateScrollState
  };
};