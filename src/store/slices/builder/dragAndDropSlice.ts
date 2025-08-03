import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MediaExtension, MediaType, ServlyBuilderTypes } from './TYPES_SUPPORTED';

export interface DragAndDropState {
    currentId: ServlyBuilderTypes | null;
    instanceId: string | null;
    instanceName: string | null;
    width: number | null;
    height: number | null;
    isCursorInteractive: boolean | null;
    isItemMedia?: boolean | null;
    mediaType?: MediaType | null;
    mediaExtension?: MediaExtension | null;
}

const initialState: DragAndDropState = {
    currentId: null,
    instanceId: null,
    instanceName: null,
    width: null,
    height: null,
    isCursorInteractive: null,
    isItemMedia: null,
    mediaType: null,
    mediaExtension: null
};

interface NewDroppedItemPayload {
    currentId?: ServlyBuilderTypes;
    instanceId?: string;
    instanceName?: string;
    width?: number;
    height?: number;
    isCursorInteractive?: boolean;
    isItemMedia?: boolean;
    mediaType?: MediaType;
    mediaExtension?: MediaExtension;
}

const dragAndDropSlice = createSlice({
    name: 'dragAndDrop',
    initialState,
    reducers: {
        setDroppedItem(state, action: PayloadAction<NewDroppedItemPayload>) {
            const {
                currentId,
                instanceId,
                instanceName,
                width,
                height,
                isCursorInteractive,
                isItemMedia,
                mediaType,
                mediaExtension
            } = action.payload;

            state.currentId = currentId;
            state.instanceId = instanceId;
            state.instanceName = instanceName;
            state.width = width;
            state.height = height;
            state.isCursorInteractive = isCursorInteractive;
            state.isItemMedia = isItemMedia ?? null;
            state.mediaType = mediaType ?? null;
            state.mediaExtension = mediaExtension ?? null;
      
        },
        resetDragAndDrop() {
            return initialState;
        }
    },
});

export const { setDroppedItem, resetDragAndDrop } = dragAndDropSlice.actions;
export default dragAndDropSlice.reducer;