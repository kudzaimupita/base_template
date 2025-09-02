import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface UseSortableElementProps {
  elementId: string;
  disabled?: boolean;
}

export const useSortableElement = ({ elementId, disabled = false }: UseSortableElementProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: elementId,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    outline: isDragging ? '2px solid #4a90e2' : undefined,
  };

  return {
    sortableProps: {
      ref: setNodeRef,
      style,
      ...attributes,
      ...listeners,
    },
    isDragging,
  };
};