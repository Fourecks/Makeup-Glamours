
import { useRef, useEffect, useCallback } from 'react';

type Position = { x: number; y: number };

export const useDraggable = (
  elementRef: React.RefObject<HTMLElement>,
  containerRef: React.RefObject<HTMLElement>,
  onDragEnd: (pos: Position) => void,
  isAdmin: boolean
) => {
  const isDraggingRef = useRef(false);
  const offsetRef = useRef<Position>({ x: 0, y: 0 });

  const onMouseDown = useCallback((e: MouseEvent) => {
    if (!elementRef.current || !containerRef.current || e.button !== 0) return;
    
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || (e.target as HTMLElement).closest('button')) {
        return;
    }

    isDraggingRef.current = true;
    const rect = elementRef.current.getBoundingClientRect();
    
    offsetRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  }, [elementRef, containerRef]);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current || !elementRef.current || !containerRef.current) return;
    e.preventDefault();

    const containerRect = containerRef.current.getBoundingClientRect();
    
    let x = e.clientX - containerRect.left - offsetRef.current.x;
    let y = e.clientY - containerRect.top - offsetRef.current.y;

    x = Math.max(0, Math.min(x, containerRect.width - elementRef.current.offsetWidth));
    y = Math.max(0, Math.min(y, containerRect.height - elementRef.current.offsetHeight));

    elementRef.current.style.left = `${x}px`;
    elementRef.current.style.top = `${y}px`;
    elementRef.current.style.transform = 'translate(0, 0)';
  }, [elementRef, containerRef]);

  const onMouseUp = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current || !elementRef.current || !containerRef.current) return;

    isDraggingRef.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const elementRect = elementRef.current.getBoundingClientRect();

    const centerX = (elementRect.left - containerRect.left) + (elementRect.width / 2);
    const centerY = (elementRect.top - containerRect.top) + (elementRect.height / 2);

    const newXPercent = (centerX / containerRect.width) * 100;
    const newYPercent = (centerY / containerRect.height) * 100;

    onDragEnd({ x: newXPercent, y: newYPercent });
    
    elementRef.current.style.left = '';
    elementRef.current.style.top = '';
    elementRef.current.style.transform = '';

  }, [elementRef, containerRef, onDragEnd]);

  useEffect(() => {
    const element = elementRef.current;
    if (element && isAdmin) {
      element.addEventListener('mousedown', onMouseDown);
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);

      return () => {
        element.removeEventListener('mousedown', onMouseDown);
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [elementRef, onMouseDown, onMouseMove, onMouseUp, isAdmin]);
};
