const allEventHandlers = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  //description: 'Comprehensive event handlers for all possible interactions in React',
  properties: {
    // Most Common Events - moved to top for easier access
    onClick: {
      type: 'string',
      title: 'On Click',
      //description: 'Triggered when an element is clicked',
      config: { uiType: 'eventHandler' },
    },
    onChange: {
      type: 'string',
      title: 'On Change',
      //description: 'Triggered when the value of an input element changes',
      config: { uiType: 'eventHandler' },
    },
    onSubmit: {
      type: 'string',
      title: 'On Submit',
      //description: 'Triggered when a form is submitted',
      config: { uiType: 'eventHandler' },
    },
    onFocus: {
      type: 'string',
      title: 'On Focus',
      //description: 'Fires when an element receives focus',
      config: { uiType: 'eventHandler' },
    },
    onBlur: {
      type: 'string',
      title: 'On Blur',
      //description: 'Triggered when an element loses focus',
      config: { uiType: 'eventHandler' },
    },

    // Mouse Events
    onDoubleClick: {
      type: 'string',
      title: 'On Double Click',
      //description: 'Triggered when an element is double-clicked',
      config: { uiType: 'eventHandler' },
    },
    onMouseDown: {
      type: 'string',
      title: 'On Mouse Down',
      //description: 'Fires when a mouse button is pressed down on an element',
      config: { uiType: 'eventHandler' },
    },
    onMouseUp: {
      type: 'string',
      title: 'On Mouse Up',
      //description: 'Triggered when a mouse button is released over an element',
      config: { uiType: 'eventHandler' },
    },
    onMouseMove: {
      type: 'string',
      title: 'On Mouse Move',
      //description: 'Fires continuously as the mouse moves within an element',
      config: { uiType: 'eventHandler' },
    },
    onMouseEnter: {
      type: 'string',
      title: 'On Mouse Enter',
      //description: 'Triggered when the mouse pointer enters the element',
      config: { uiType: 'eventHandler' },
    },
    onMouseLeave: {
      type: 'string',
      title: 'On Mouse Leave',
      //description: 'Fires when the mouse pointer leaves the element',
      config: { uiType: 'eventHandler' },
    },
    onMouseOver: {
      type: 'string',
      title: 'On Mouse Over',
      //description: 'Triggered when the mouse pointer enters an element and its children',
      config: { uiType: 'eventHandler' },
    },
    onMouseOut: {
      type: 'string',
      title: 'On Mouse Out',
      //description: 'Fires when the mouse pointer leaves an element and its children',
      config: { uiType: 'eventHandler' },
    },
    onContextMenu: {
      type: 'string',
      title: 'On Context Menu',
      //description: 'Triggered when right-click context menu is requested',
      config: { uiType: 'eventHandler' },
    },

    // Keyboard Events
    onKeyDown: {
      type: 'string',
      title: 'On Key Down',
      //description: 'Fires when a key is pressed down',
      config: { uiType: 'eventHandler' },
    },
    onKeyUp: {
      type: 'string',
      title: 'On Key Up',
      //description: 'Triggered when a key is released',
      config: { uiType: 'eventHandler' },
    },
    onKeyPress: {
      type: 'string',
      title: 'On Key Press',
      //description: 'Fires when a key is pressed and released',
      config: { uiType: 'eventHandler' },
    },

    // Form Events
    onInput: {
      type: 'string',
      title: 'On Input',
      //description: 'Fires immediately when an input value changes',
      config: { uiType: 'eventHandler' },
    },
    onReset: {
      type: 'string',
      title: 'On Reset',
      //description: 'Fires when a form is reset',
      config: { uiType: 'eventHandler' },
    },
    onInvalid: {
      type: 'string',
      title: 'On Invalid',
      //description: 'Triggered when an element fails validation',
      config: { uiType: 'eventHandler' },
    },
    onFormChange: {
      type: 'string',
      title: 'On Form Change',
      //description: 'Fires when any form field changes',
      config: { uiType: 'eventHandler' },
    },

    // Clipboard Events
    onCopy: {
      type: 'string',
      title: 'On Copy',
      //description: 'Fires when content is copied to the clipboard',
      config: { uiType: 'eventHandler' },
    },
    onCut: {
      type: 'string',
      title: 'On Cut',
      //description: 'Triggered when content is cut to the clipboard',
      config: { uiType: 'eventHandler' },
    },
    onPaste: {
      type: 'string',
      title: 'On Paste',
      //description: 'Fires when content is pasted from the clipboard',
      config: { uiType: 'eventHandler' },
    },

    // Composition Events
    onCompositionStart: {
      type: 'string',
      title: 'On Composition Start',
      //description: 'Triggered when an IME composition begins',
      config: { uiType: 'eventHandler' },
    },
    onCompositionUpdate: {
      type: 'string',
      title: 'On Composition Update',
      //description: 'Fires during an IME composition update',
      config: { uiType: 'eventHandler' },
    },
    onCompositionEnd: {
      type: 'string',
      title: 'On Composition End',
      //description: 'Triggered when an IME composition ends',
      config: { uiType: 'eventHandler' },
    },

    // Drag and Drop Events
    onDragStart: {
      type: 'string',
      title: 'On Drag Start',
      //description: 'Triggered when the user starts dragging an element',
      config: { uiType: 'eventHandler' },
    },
    onDrag: {
      type: 'string',
      title: 'On Drag',
      //description: 'Fires continuously while an element is being dragged',
      config: { uiType: 'eventHandler' },
    },
    onDragEnd: {
      type: 'string',
      title: 'On Drag End',
      //description: 'Triggered when dragging of an element ends',
      config: { uiType: 'eventHandler' },
    },
    onDragEnter: {
      type: 'string',
      title: 'On Drag Enter',
      //description: 'Fires when a dragged element enters a valid drop target',
      config: { uiType: 'eventHandler' },
    },
    onDragOver: {
      type: 'string',
      title: 'On Drag Over',
      //description: 'Triggered continuously when a dragged element is over a drop target',
      config: { uiType: 'eventHandler' },
    },
    onDragLeave: {
      type: 'string',
      title: 'On Drag Leave',
      //description: 'Fires when a dragged element leaves a drop target',
      config: { uiType: 'eventHandler' },
    },
    onDrop: {
      type: 'string',
      title: 'On Drop',
      //description: 'Triggered when a dragged element is dropped',
      config: { uiType: 'eventHandler' },
    },

    // Touch Events
    onTouchStart: {
      type: 'string',
      title: 'On Touch Start',
      //description: 'Fires when a touch point is placed on the touch surface',
      config: { uiType: 'eventHandler' },
    },
    onTouchMove: {
      type: 'string',
      title: 'On Touch Move',
      //description: 'Triggered continuously when a touch point moves',
      config: { uiType: 'eventHandler' },
    },
    onTouchEnd: {
      type: 'string',
      title: 'On Touch End',
      //description: 'Fires when a touch point is removed from the touch surface',
      config: { uiType: 'eventHandler' },
    },
    onTouchCancel: {
      type: 'string',
      title: 'On Touch Cancel',
      //description: 'Triggered when a touch point is disrupted',
      config: { uiType: 'eventHandler' },
    },

    // Pointer Events
    onPointerDown: {
      type: 'string',
      title: 'On Pointer Down',
      //description: 'Fires when a pointer becomes active',
      config: { uiType: 'eventHandler' },
    },
    onPointerMove: {
      type: 'string',
      title: 'On Pointer Move',
      //description: 'Triggered when a pointer changes coordinates',
      config: { uiType: 'eventHandler' },
    },
    onPointerUp: {
      type: 'string',
      title: 'On Pointer Up',
      //description: 'Fires when a pointer is no longer active',
      config: { uiType: 'eventHandler' },
    },
    onPointerCancel: {
      type: 'string',
      title: 'On Pointer Cancel',
      //description: 'Triggered when a pointer event is canceled',
      config: { uiType: 'eventHandler' },
    },
    onPointerEnter: {
      type: 'string',
      title: 'On Pointer Enter',
      //description: 'Fires when a pointer enters an element',
      config: { uiType: 'eventHandler' },
    },
    onPointerLeave: {
      type: 'string',
      title: 'On Pointer Leave',
      //description: 'Triggered when a pointer leaves an element',
      config: { uiType: 'eventHandler' },
    },
    onPointerOver: {
      type: 'string',
      title: 'On Pointer Over',
      //description: 'Fires when a pointer is moved into an element',
      config: { uiType: 'eventHandler' },
    },
    onPointerOut: {
      type: 'string',
      title: 'On Pointer Out',
      //description: 'Triggered when a pointer is moved out of an element',
      config: { uiType: 'eventHandler' },
    },

    // Wheel and Scroll Events
    onWheel: {
      type: 'string',
      title: 'On Wheel',
      //description: 'Fires when the mouse wheel is rotated',
      config: { uiType: 'eventHandler' },
    },
    onScroll: {
      type: 'string',
      title: 'On Scroll',
      //description: 'Triggered when an elements scrollbar is being scrolled',
      config: { uiType: 'eventHandler' },
    },

    // Media Events
    onPlay: {
      type: 'string',
      title: 'On Play',
      //description: 'Fires when media begins to play',
      config: { uiType: 'eventHandler' },
    },
    onPause: {
      type: 'string',
      title: 'On Pause',
      //description: 'Triggered when media is paused',
      config: { uiType: 'eventHandler' },
    },
    onEnded: {
      type: 'string',
      title: 'On Ended',
      //description: 'Fires when media playback has finished',
      config: { uiType: 'eventHandler' },
    },
    onTimeUpdate: {
      type: 'string',
      title: 'On Time Update',
      //description: 'Triggered when media time is updated',
      config: { uiType: 'eventHandler' },
    },
    onVolumeChange: {
      type: 'string',
      title: 'On Volume Change',
      //description: 'Fires when media volume changes',
      config: { uiType: 'eventHandler' },
    },
    onLoadStart: {
      type: 'string',
      title: 'On Load Start',
      //description: 'Triggered when media loading begins',
      config: { uiType: 'eventHandler' },
    },
    onLoadedData: {
      type: 'string',
      title: 'On Loaded Data',
      //description: 'Fires when media data is loaded',
      config: { uiType: 'eventHandler' },
    },
    onLoadedMetadata: {
      type: 'string',
      title: 'On Loaded Metadata',
      //description: 'Triggered when media metadata is loaded',
      config: { uiType: 'eventHandler' },
    },
    onProgress: {
      type: 'string',
      title: 'On Progress',
      //description: 'Fires during media loading progress',
      config: { uiType: 'eventHandler' },
    },
    onDurationChange: {
      type: 'string',
      title: 'On Duration Change',
      //description: 'Triggered when media duration changes',
      config: { uiType: 'eventHandler' },
    },
    onRateChange: {
      type: 'string',
      title: 'On Rate Change',
      //description: 'Fires when media playback rate changes',
      config: { uiType: 'eventHandler' },
    },
    onSeeked: {
      type: 'string',
      title: 'On Seeked',
      //description: 'Triggered when media seeking completes',
      config: { uiType: 'eventHandler' },
    },
    onSeeking: {
      type: 'string',
      title: 'On Seeking',
      //description: 'Fires when media seeking begins',
      config: { uiType: 'eventHandler' },
    },
    onStalled: {
      type: 'string',
      title: 'On Stalled',
      //description: 'Triggered when media loading stalls',
      config: { uiType: 'eventHandler' },
    },
    onSuspend: {
      type: 'string',
      title: 'On Suspend',
      //description: 'Fires when media loading is suspended',
      config: { uiType: 'eventHandler' },
    },
    onWaiting: {
      type: 'string',
      title: 'On Waiting',
      //description: 'Triggered when media is waiting for data',
      config: { uiType: 'eventHandler' },
    },

    // Image Events
    onLoad: {
      type: 'string',
      title: 'On Load',
      //description: 'Triggered when an element has finished loading',
      config: { uiType: 'eventHandler' },
    },
    onError: {
      type: 'string',
      title: 'On Error',
      //description: 'Fires when an error occurs during loading',
      config: { uiType: 'eventHandler' },
    },

    // Animation and Transition Events
    onAnimationStart: {
      type: 'string',
      title: 'On Animation Start',
      //description: 'Triggered when a CSS animation begins',
      config: { uiType: 'eventHandler' },
    },
    onAnimationEnd: {
      type: 'string',
      title: 'On Animation End',
      //description: 'Fires when a CSS animation completes',
      config: { uiType: 'eventHandler' },
    },
    onAnimationIteration: {
      type: 'string',
      title: 'On Animation Iteration',
      //description: 'Triggered when a CSS animation iteration completes',
      config: { uiType: 'eventHandler' },
    },
    onTransitionEnd: {
      type: 'string',
      title: 'On Transition End',
      //description: 'Fires when a CSS transition completes',
      config: { uiType: 'eventHandler' },
    },

    // Additional UI Events
    onResize: {
      type: 'string',
      title: 'On Resize',
      //description: 'Triggered when the document view is resized',
      config: { uiType: 'eventHandler' },
    },

    // Selection Events
    onSelect: {
      type: 'string',
      title: 'On Select',
      //description: 'Fires when text is selected in an input or textarea',
      config: { uiType: 'eventHandler' },
    },
    onSelectionChange: {
      type: 'string',
      title: 'On Selection Change',
      //description: 'Triggered when the selection changes',
      config: { uiType: 'eventHandler' },
    },

    // Form Validation Events
    onBeforeInput: {
      type: 'string',
      title: 'On Before Input',
      //description: 'Fires before input data is entered',
      config: { uiType: 'eventHandler' },
    },
    onFormData: {
      type: 'string',
      title: 'On Form Data',
      //description: 'Triggered when form data is being processed',
      config: { uiType: 'eventHandler' },
    },

    // Toggle Events
    onToggle: {
      type: 'string',
      title: 'On Toggle',
      //description: 'Fires when a details element is opened or closed',
      config: { uiType: 'eventHandler' },
    },

    // Fullscreen Events
    onFullscreenChange: {
      type: 'string',
      title: 'On Fullscreen Change',
      //description: 'Triggered when fullscreen mode changes',
      config: { uiType: 'eventHandler' },
    },
    onFullscreenError: {
      type: 'string',
      title: 'On Fullscreen Error',
      //description: 'Fires when entering fullscreen mode fails',
      config: { uiType: 'eventHandler' },
    },

    // Visibility Events
    onVisibilityChange: {
      type: 'string',
      title: 'On Visibility Change',
      //description: 'Triggered when page visibility changes',
      config: { uiType: 'eventHandler' },
    },

    // Connection Events
    onOnline: {
      type: 'string',
      title: 'On Online',
      //description: 'Fires when the browser goes online',
      config: { uiType: 'eventHandler' },
    },
    onOffline: {
      type: 'string',
      title: 'On Offline',
      //description: 'Triggered when the browser goes offline',
      config: { uiType: 'eventHandler' },
    },

    // Storage Events
    onStorage: {
      type: 'string',
      title: 'On Storage',
      //description: 'Fires when localStorage or sessionStorage changes',
      config: { uiType: 'eventHandler' },
    },

    // Device Events
    onDeviceMotion: {
      type: 'string',
      title: 'On Device Motion',
      //description: 'Triggered when device motion is detected',
      config: { uiType: 'eventHandler' },
    },
    onDeviceOrientation: {
      type: 'string',
      title: 'On Device Orientation',
      //description: 'Fires when device orientation changes',
      config: { uiType: 'eventHandler' },
    },

    // Custom Application Events
    onMount: {
      type: 'string',
      title: 'On Mount',
      //description: 'Custom event fired when component mounts',
      config: { uiType: 'eventHandler' },
    },
    onUnmount: {
      type: 'string',
      title: 'On Unmount',
      //description: 'Custom event fired when component unmounts',
      config: { uiType: 'eventHandler' },
    },
    onRefresh: {
      type: 'string',
      title: 'On Refresh',
      //description: 'Custom event for refresh actions',
      config: { uiType: 'eventHandler' },
    },
    onUpdate: {
      type: 'string',
      title: 'On Update',
      //description: 'Custom event for update actions',
      config: { uiType: 'eventHandler' },
    },
    onCancel: {
      type: 'string',
      title: 'On Cancel',
      //description: 'Custom event for cancel actions',
      config: { uiType: 'eventHandler' },
    },
    onConfirm: {
      type: 'string',
      title: 'On Confirm',
      //description: 'Custom event for confirmation actions',
      config: { uiType: 'eventHandler' },
    },
    onDelete: {
      type: 'string',
      title: 'On Delete',
      //description: 'Custom event for delete actions',
      config: { uiType: 'eventHandler' },
    },
    onCreate: {
      type: 'string',
      title: 'On Create',
      //description: 'Custom event for create actions',
      config: { uiType: 'eventHandler' },
    },
    onSave: {
      type: 'string',
      title: 'On Save',
      //description: 'Custom event for save actions',
      config: { uiType: 'eventHandler' },
    },
    onSearch: {
      type: 'string',
      title: 'On Search',
      //description: 'Custom event for search actions',
      config: { uiType: 'eventHandler' },
    },
    onFilter: {
      type: 'string',
      title: 'On Filter',
      //description: 'Custom event for filter actions',
      config: { uiType: 'eventHandler' },
    },
    onSort: {
      type: 'string',
      title: 'On Sort',
      //description: 'Custom event for sort actions',
      config: { uiType: 'eventHandler' },
    },
  },
  additionalProperties: false,
};

// Get the first 5 most common event handlers
const getTopEventHandlers = () => {
  const topEventKeys = ['onClick', 'onChange', 'onSubmit', 'onFocus', 'onBlur'];
  const topProperties = {};

  topEventKeys.forEach(key => {
    if (allEventHandlers.properties[key]) {
      topProperties[key] = allEventHandlers.properties[key];
    }
  });

  return {
    ...allEventHandlers,
    properties: topProperties
  };
};

// Export both versions
export const genericEventHandlers = allEventHandlers;
export const topEventHandlers = getTopEventHandlers();

// Function to get event handlers based on showAll flag
export const getEventHandlers = (showAll = false) => {
  return showAll ? genericEventHandlers : topEventHandlers;
};
