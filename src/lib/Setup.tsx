import { CustomDragSetup } from './CustomDragSetup';

// Interface for component props
interface SortableContainerSetupProps {
  elementss: any[];
  setElements: (elements: any[] | ((currentElements: any[]) => any[])) => void;
  setSortableOperationState?: (active: boolean) => void;
  isSortableCurrentlyActive?: () => boolean;
  setIsDragging?: (isDragging: boolean) => void;
  setSelectedTargets?: (targets: any[]) => void;
}

export const SortableContainerSetup = ({ 
  elementss, 
  setElements, 
  setSortableOperationState,
  isSortableCurrentlyActive,
  setIsDragging,
  setSelectedTargets
}: SortableContainerSetupProps) => {
  return (
    <CustomDragSetup 
      elements={elementss}
      setElements={setElements}
      setSortableOperationState={setSortableOperationState}
      isSortableCurrentlyActive={isSortableCurrentlyActive}
      setIsDragging={setIsDragging}
      setSelectedTargets={setSelectedTargets}
    />
  );
};