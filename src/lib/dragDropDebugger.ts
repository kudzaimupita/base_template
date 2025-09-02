// Drag and Drop Debugging Module
// This module provides comprehensive debugging for the drag-and-drop functionality

interface DebugEvent {
  timestamp: number;
  type: 'drag_start' | 'drag_end' | 'state_update' | 'dom_error' | 'recovery' | 'sortable_active' | 'sortable_inactive';
  details: any;
  elementId?: string;
  parentId?: string;
  error?: Error;
}

class DragDropDebugger {
  private events: DebugEvent[] = [];
  private maxEvents = 100;
  private isEnabled = true;
  private errorCount = 0;
  private lastError: Error | null = null;
  private listeners: Set<(event: DebugEvent) => void> = new Set();

  constructor() {
    // Enable debugging in development mode
    this.isEnabled = process.env.NODE_ENV === 'development';
    
    // Listen for DOM errors
    if (this.isEnabled) {
      this.setupErrorListeners();
    }
  }

  private setupErrorListeners() {
    // Override console.error to catch removeChild errors
    const originalError = console.error;
    let isLoggingError = false; // Prevent infinite recursion
    
    console.error = (...args) => {
      if (!isLoggingError) {
        const errorString = args.join(' ');
        if (errorString.includes('removeChild') || errorString.includes('Failed to execute')) {
          isLoggingError = true;
          this.logError(new Error(errorString), 'DOM_MANIPULATION_ERROR');
          isLoggingError = false;
        }
      }
      originalError.apply(console, args);
    };

    // Listen for unhandled errors
    window.addEventListener('error', (event) => {
      if (event.error && event.error.message) {
        const message = event.error.message;
        if (message.includes('removeChild') || message.includes('Failed to execute')) {
          this.logError(event.error, 'UNHANDLED_DOM_ERROR');
        }
      }
    });
  }

  logEvent(type: DebugEvent['type'], details: any, elementId?: string, parentId?: string) {
    if (!this.isEnabled) return;

    const event: DebugEvent = {
      timestamp: Date.now(),
      type,
      details,
      elementId,
      parentId,
    };

    this.events.push(event);
    
    // Keep only last N events
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }

    // Notify listeners
    this.listeners.forEach(listener => listener(event));

    // Log to console with color coding
    const color = this.getColorForEventType(type);

  }

  logError(error: Error, context: string) {
    if (!this.isEnabled) return;

    this.errorCount++;
    this.lastError = error;

    const event: DebugEvent = {
      timestamp: Date.now(),
      type: 'dom_error',
      details: {
        context,
        message: error.message,
        stack: error.stack,
        errorCount: this.errorCount,
      },
      error,
    };

    this.events.push(event);

    console.error(
      '%c[DragDrop ERROR]',
      'color: red; font-weight: bold; font-size: 14px',
      context,
      error
    );

    // Show user-friendly notification after multiple errors
    if (this.errorCount > 3) {
      console.warn(
        '%c[DragDrop] Multiple errors detected. The drag-drop system may need a refresh.',
        'color: orange; font-weight: bold'
      );
    }
  }

  logRecovery(details: any) {
    this.logEvent('recovery', details);

  }

  private getColorForEventType(type: DebugEvent['type']): string {
    switch (type) {
      case 'drag_start': return '#4CAF50';
      case 'drag_end': return '#2196F3';
      case 'state_update': return '#FF9800';
      case 'dom_error': return '#F44336';
      case 'recovery': return '#8BC34A';
      case 'sortable_active': return '#9C27B0';
      case 'sortable_inactive': return '#607D8B';
      default: return '#000000';
    }
  }

  getEvents(): DebugEvent[] {
    return [...this.events];
  }

  getErrorCount(): number {
    return this.errorCount;
  }

  getLastError(): Error | null {
    return this.lastError;
  }

  clearEvents() {
    this.events = [];
    this.errorCount = 0;
    this.lastError = null;
  }

  subscribe(listener: (event: DebugEvent) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Analyze patterns in events to detect issues
  analyzePatterns(): {
    hasRaceCondition: boolean;
    hasDOMConflict: boolean;
    recommendations: string[];
  } {
    const recentEvents = this.events.slice(-20);
    
    // Check for rapid state updates during drag
    let rapidUpdates = 0;
    let lastUpdateTime = 0;
    
    recentEvents.forEach(event => {
      if (event.type === 'state_update') {
        if (lastUpdateTime && event.timestamp - lastUpdateTime < 50) {
          rapidUpdates++;
        }
        lastUpdateTime = event.timestamp;
      }
    });

    // Check for DOM errors
    const domErrors = recentEvents.filter(e => e.type === 'dom_error');
    
    const hasRaceCondition = rapidUpdates > 3;
    const hasDOMConflict = domErrors.length > 0;
    
    const recommendations: string[] = [];
    
    if (hasRaceCondition) {
      recommendations.push('Detected rapid state updates. Consider debouncing or batching updates.');
    }
    
    if (hasDOMConflict) {
      recommendations.push('DOM conflicts detected. Ensure React and SortableJS are properly synchronized.');
    }
    
    if (this.errorCount > 5) {
      recommendations.push('Multiple errors detected. Consider refreshing the page or checking element structure.');
    }

    return {
      hasRaceCondition,
      hasDOMConflict,
      recommendations,
    };
  }

  // Export debug report
  exportReport(): string {
    const analysis = this.analyzePatterns();
    
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      errorCount: this.errorCount,
      lastError: this.lastError?.message,
      events: this.events,
      analysis,
    }, null, 2);
  }
}

// Create singleton instance
const dragDropDebugger = new DragDropDebugger();

// Export for use in components
export default dragDropDebugger;

// Convenience functions
export const logDragStart = (elementId: string, parentId?: string) => {
  dragDropDebugger.logEvent('drag_start', { elementId, parentId }, elementId, parentId);
};

export const logDragEnd = (elementId: string, newParentId?: string, oldParentId?: string) => {
  dragDropDebugger.logEvent('drag_end', { elementId, newParentId, oldParentId }, elementId, newParentId);
};

export const logStateUpdate = (details: any) => {
  dragDropDebugger.logEvent('state_update', details);
};

export const logDOMError = (error: Error, context: string) => {
  dragDropDebugger.logError(error, context);
};

export const logRecovery = (details: any) => {
  dragDropDebugger.logRecovery(details);
};

export const logSortableActive = () => {
  dragDropDebugger.logEvent('sortable_active', { active: true });
};

export const logSortableInactive = () => {
  dragDropDebugger.logEvent('sortable_inactive', { active: false });
};

// Export analysis function
export const analyzeDragDropIssues = () => {
  const analysis = dragDropDebugger.analyzePatterns();
  return analysis;
};

// Export report function
export const exportDragDropReport = () => {
  const report = dragDropDebugger.exportReport();
  return report;
};

// Attach to window for debugging in console
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).dragDropDebugger = {
    debugger: dragDropDebugger,
    logDragStart,
    logDragEnd,
    logStateUpdate,
    logDOMError,
    logRecovery,
    analyzeDragDropIssues,
    exportDragDropReport,
    getEvents: () => dragDropDebugger.getEvents(),
    clearEvents: () => dragDropDebugger.clearEvents(),
  };
}