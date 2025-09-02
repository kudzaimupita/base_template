import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useMemo } from 'react';

interface UseSortableOptimizedProps {
  elementId: string;
  disabled?: boolean;
  isContainer?: boolean;
}

export const useSortableOptimized = ({ 
  elementId, 
  disabled = false,
  isContainer = false 
}: UseSortableOptimizedProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({ 
    id: elementId,
    disabled,
    data: {
      isContainer,
    }
  });

  // Memoize style to prevent re-renders
  const style = useMemo(() => {
    const baseStyle: React.CSSProperties = {
      transform: CSS.Transform.toString(transform),
      transition: transition || undefined,
    };

    if (isDragging) {
      return {
        ...baseStyle,
        opacity: 0.3,
        cursor: 'grabbing',
      };
    }

    if (isOver && isContainer) {
      return {
        ...baseStyle,
        backgroundColor: 'rgba(74, 144, 226, 0.05)',
        outline: '2px dashed #4a90e2',
        outlineOffset: '-2px',
      };
    }

    return baseStyle;
  }, [transform, transition, isDragging, isOver, isContainer]);

  // Memoize props object to prevent re-renders
  const sortableProps = useMemo(() => ({
    ref: setNodeRef,
    style,
    ...attributes,
    ...listeners,
    'data-sortable-id': elementId,
    'data-is-container': isContainer,
    'data-sortable-dragging': isDragging,
    'data-sortable-over': isOver,
  }), [setNodeRef, style, attributes, listeners, elementId, isContainer, isDragging, isOver]);

  return {
    sortableProps,
    isDragging,
    isOver,
  };
};