export const genericEventHandlers = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  description: 'Comprehensive event handlers for all possible interactions in React',
  properties: {
    // Mouse Events
    onClick: {
      type: 'string',
      title: 'On Click',
      description: 'Triggered when an element is clicked',
      config: { uiType: 'eventHandler' },
    },
    onDoubleClick: {
      type: 'string',
      title: 'On Double Click',
      description: 'Triggered when an element is double-clicked',
      config: { uiType: 'eventHandler' },
    },
    onMouseDown: {
      type: 'string',
      title: 'On Mouse Down',
      description: 'Fires when a mouse button is pressed down on an element',
      config: { uiType: 'eventHandler' },
    },
    onMouseUp: {
      type: 'string',
      title: 'On Mouse Up',
      description: 'Triggered when a mouse button is released over an element',
      config: { uiType: 'eventHandler' },
    },
    onMouseMove: {
      type: 'string',
      title: 'On Mouse Move',
      description: 'Fires continuously as the mouse moves within an element',
      config: { uiType: 'eventHandler' },
    },
    onMouseEnter: {
      type: 'string',
      title: 'On Mouse Enter',
      description: 'Triggered when the mouse pointer enters the element',
      config: { uiType: 'eventHandler' },
    },
    onMouseLeave: {
      type: 'string',
      title: 'On Mouse Leave',
      description: 'Fires when the mouse pointer leaves the element',
      config: { uiType: 'eventHandler' },
    },
    onMouseOver: {
      type: 'string',
      title: 'On Mouse Over',
      description: 'Triggered when the mouse pointer enters an element and its children',
      config: { uiType: 'eventHandler' },
    },
    onMouseOut: {
      type: 'string',
      title: 'On Mouse Out',
      description: 'Fires when the mouse pointer leaves an element and its children',
      config: { uiType: 'eventHandler' },
    },
    onContextMenu: {
      type: 'string',
      title: 'On Context Menu',
      description: 'Triggered when right-click context menu is requested',
      config: { uiType: 'eventHandler' },
    },

    // Keyboard Events
    onKeyDown: {
      type: 'string',
      title: 'On Key Down',
      description: 'Fires when a key is pressed down',
      config: { uiType: 'eventHandler' },
    },
    onKeyUp: {
      type: 'string',
      title: 'On Key Up',
      description: 'Triggered when a key is released',
      config: { uiType: 'eventHandler' },
    },
    onKeyPress: {
      type: 'string',
      title: 'On Key Press',
      description: 'Fires when a key is pressed and released',
      config: { uiType: 'eventHandler' },
    },

    // Form Events
    onChange: {
      type: 'string',
      title: 'On Change',
      description: 'Triggered when the value of an input element changes',
      config: { uiType: 'eventHandler' },
    },
    onInput: {
      type: 'string',
      title: 'On Input',
      description: 'Fires immediately when an input value changes',
      config: { uiType: 'eventHandler' },
    },
    onSubmit: {
      type: 'string',
      title: 'On Submit',
      description: 'Triggered when a form is submitted',
      config: { uiType: 'eventHandler' },
    },
    onFocus: {
      type: 'string',
      title: 'On Focus',
      description: 'Fires when an element receives focus',
      config: { uiType: 'eventHandler' },
    },
    onBlur: {
      type: 'string',
      title: 'On Blur',
      description: 'Triggered when an element loses focus',
      config: { uiType: 'eventHandler' },
    },
    onReset: {
      type: 'string',
      title: 'On Reset',
      description: 'Fires when a form is reset',
      config: { uiType: 'eventHandler' },
    },
    onInvalid: {
      type: 'string',
      title: 'On Invalid',
      description: 'Triggered when an element fails validation',
      config: { uiType: 'eventHandler' },
    },

    // Clipboard Events
    onCopy: {
      type: 'string',
      title: 'On Copy',
      description: 'Fires when content is copied to the clipboard',
      config: { uiType: 'eventHandler' },
    },
    onCut: {
      type: 'string',
      title: 'On Cut',
      description: 'Triggered when content is cut to the clipboard',
      config: { uiType: 'eventHandler' },
    },
    onPaste: {
      type: 'string',
      title: 'On Paste',
      description: 'Fires when content is pasted from the clipboard',
      config: { uiType: 'eventHandler' },
    },

    // Composition Events
    onCompositionStart: {
      type: 'string',
      title: 'On Composition Start',
      description: 'Triggered when an IME composition begins',
      config: { uiType: 'eventHandler' },
    },
    onCompositionUpdate: {
      type: 'string',
      title: 'On Composition Update',
      description: 'Fires during an IME composition update',
      config: { uiType: 'eventHandler' },
    },
    onCompositionEnd: {
      type: 'string',
      title: 'On Composition End',
      description: 'Triggered when an IME composition ends',
      config: { uiType: 'eventHandler' },
    },

    // Drag and Drop Events
    onDragStart: {
      type: 'string',
      title: 'On Drag Start',
      description: 'Triggered when the user starts dragging an element',
      config: { uiType: 'eventHandler' },
    },
    onDrag: {
      type: 'string',
      title: 'On Drag',
      description: 'Fires continuously while an element is being dragged',
      config: { uiType: 'eventHandler' },
    },
    onDragEnd: {
      type: 'string',
      title: 'On Drag End',
      description: 'Triggered when dragging of an element ends',
      config: { uiType: 'eventHandler' },
    },
    onDragEnter: {
      type: 'string',
      title: 'On Drag Enter',
      description: 'Fires when a dragged element enters a valid drop target',
      config: { uiType: 'eventHandler' },
    },
    onDragOver: {
      type: 'string',
      title: 'On Drag Over',
      description: 'Triggered continuously when a dragged element is over a drop target',
      config: { uiType: 'eventHandler' },
    },
    onDragLeave: {
      type: 'string',
      title: 'On Drag Leave',
      description: 'Fires when a dragged element leaves a drop target',
      config: { uiType: 'eventHandler' },
    },
    onDrop: {
      type: 'string',
      title: 'On Drop',
      description: 'Triggered when a dragged element is dropped',
      config: { uiType: 'eventHandler' },
    },

    // Touch Events
    onTouchStart: {
      type: 'string',
      title: 'On Touch Start',
      description: 'Fires when a touch point is placed on the touch surface',
      config: { uiType: 'eventHandler' },
    },
    onTouchMove: {
      type: 'string',
      title: 'On Touch Move',
      description: 'Triggered continuously when a touch point moves',
      config: { uiType: 'eventHandler' },
    },
    onTouchEnd: {
      type: 'string',
      title: 'On Touch End',
      description: 'Fires when a touch point is removed from the touch surface',
      config: { uiType: 'eventHandler' },
    },
    onTouchCancel: {
      type: 'string',
      title: 'On Touch Cancel',
      description: 'Triggered when a touch point is disrupted',
      config: { uiType: 'eventHandler' },
    },

    // Pointer Events
    onPointerDown: {
      type: 'string',
      title: 'On Pointer Down',
      description: 'Fires when a pointer becomes active',
      config: { uiType: 'eventHandler' },
    },
    onPointerMove: {
      type: 'string',
      title: 'On Pointer Move',
      description: 'Triggered when a pointer changes coordinates',
      config: { uiType: 'eventHandler' },
    },
    onPointerUp: {
      type: 'string',
      title: 'On Pointer Up',
      description: 'Fires when a pointer is no longer active',
      config: { uiType: 'eventHandler' },
    },
    onPointerCancel: {
      type: 'string',
      title: 'On Pointer Cancel',
      description: 'Triggered when a pointer event is canceled',
      config: { uiType: 'eventHandler' },
    },
    onPointerEnter: {
      type: 'string',
      title: 'On Pointer Enter',
      description: 'Fires when a pointer enters an element',
      config: { uiType: 'eventHandler' },
    },
    onPointerLeave: {
      type: 'string',
      title: 'On Pointer Leave',
      description: 'Triggered when a pointer leaves an element',
      config: { uiType: 'eventHandler' },
    },
    onPointerOver: {
      type: 'string',
      title: 'On Pointer Over',
      description: 'Fires when a pointer is moved into an element',
      config: { uiType: 'eventHandler' },
    },
    onPointerOut: {
      type: 'string',
      title: 'On Pointer Out',
      description: 'Triggered when a pointer is moved out of an element',
      config: { uiType: 'eventHandler' },
    },

    // Wheel and Scroll Events
    onWheel: {
      type: 'string',
      title: 'On Wheel',
      description: 'Fires when the mouse wheel is rotated',
      config: { uiType: 'eventHandler' },
    },
    onScroll: {
      type: 'string',
      title: 'On Scroll',
      description: 'Triggered when an elements scrollbar is being scrolled',
      config: { uiType: 'eventHandler' },
    },

    // Media Events
    onPlay: {
      type: 'string',
      title: 'On Play',
      description: 'Fires when media begins to play',
      config: { uiType: 'eventHandler' },
    },
    onPause: {
      type: 'string',
      title: 'On Pause',
      description: 'Triggered when media is paused',
      config: { uiType: 'eventHandler' },
    },
    onEnded: {
      type: 'string',
      title: 'On Ended',
      description: 'Fires when media playback has finished',
      config: { uiType: 'eventHandler' },
    },
    onTimeUpdate: {
      type: 'string',
      title: 'On Time Update',
      description: 'Triggered when media time is updated',
      config: { uiType: 'eventHandler' },
    },
    onVolumeChange: {
      type: 'string',
      title: 'On Volume Change',
      description: 'Fires when media volume changes',
      config: { uiType: 'eventHandler' },
    },

    // Image Events
    onLoad: {
      type: 'string',
      title: 'On Load',
      description: 'Triggered when an element has finished loading',
      config: { uiType: 'eventHandler' },
    },
    onError: {
      type: 'string',
      title: 'On Error',
      description: 'Fires when an error occurs during loading',
      config: { uiType: 'eventHandler' },
    },

    // Animation and Transition Events
    onAnimationStart: {
      type: 'string',
      title: 'On Animation Start',
      description: 'Triggered when a CSS animation begins',
      config: { uiType: 'eventHandler' },
    },
    onAnimationEnd: {
      type: 'string',
      title: 'On Animation End',
      description: 'Fires when a CSS animation completes',
      config: { uiType: 'eventHandler' },
    },
    onAnimationIteration: {
      type: 'string',
      title: 'On Animation Iteration',
      description: 'Triggered when a CSS animation iteration completes',
      config: { uiType: 'eventHandler' },
    },
    onTransitionEnd: {
      type: 'string',
      title: 'On Transition End',
      description: 'Fires when a CSS transition completes',
      config: { uiType: 'eventHandler' },
    },

    // Additional UI Events
    onResize: {
      type: 'string',
      title: 'On Resize',
      description: 'Triggered when the document view is resized',
      config: { uiType: 'eventHandler' },
    },
  },
  additionalProperties: false,
};
