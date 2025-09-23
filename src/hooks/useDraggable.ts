
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
    
    // Prevent dragging if the click is on an input/textarea inside the element
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
    }

    isDraggingRef.current = true;
    const rect = elementRef.current.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();

    offsetRef.current = {
      x: e.clientX - rect.left + containerRect.left,
      y: e.clientY - rect.top + containerRect.top,
    };
    
    document.body.style.userSelect = 'none';
  }, [elementRef, containerRef]);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current || !elementRef.current || !containerRef.current) return;
    e.preventDefault();

    const containerRect = containerRef.current.getBoundingClientRect();
    
    let x = e.clientX - offsetRef.current.x;
    let y = e.clientY - offsetRef.current.y;

    // Clamp position within the container
    x = Math.max(0, Math.min(x, containerRect.width - elementRef.current.offsetWidth));
    y = Math.max(0, Math.min(y, containerRect.height - elementRef.current.offsetHeight));

    elementRef.current.style.left = `${x}px`;
    elementRef.current.style.top = `${y}px`;
    elementRef.current.style.transform = 'translate(0, 0)'; // Override percentage transform while dragging
  }, [elementRef, containerRef]);

  const onMouseUp = useCallback(() => {
    if (!isDraggingRef.current || !elementRef.current || !containerRef.current) return;

    isDraggingRef.current = false;
    document.body.style.userSelect = '';
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const elementRect = elementRef.current.getBoundingClientRect();

    // Calculate center of element relative to container
    const newX = elementRect.left - containerRect.left + elementRect.width / 2;
    const newY = elementRect.top - containerRect.top + elementRect.height / 2;

    // Convert to percentage
    const newXPercent = (newX / containerRect.width) * 100;
    const newYPercent = (newY / containerRect.height) * 100;

    // Call callback with new percentage position
    onDragEnd({ x: newXPercent, y: newYPercent });
    
    // Reset style to allow percentage-based positioning to take over
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
      };
    }
  }, [elementRef, onMouseDown, onMouseMove, onMouseUp, isAdmin]);
};
