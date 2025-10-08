import React, { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children?: ReactNode;
  fallback?: ReactNode;
  onDOMError?: () => void; // Callback to trigger DOM reload/refresh
  elementId?: string; // For better debugging
  depth?: number; // Current rendering depth
  renderPath?: string[]; // Path through the rendering tree
}

class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  { hasError: boolean; error: any; errorInfo: any; autoRecovering: boolean }
> {
  private recoveryTimeout: NodeJS.Timeout | null = null;

  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      autoRecovering: false,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Enhanced error logging with depth and path information
    console.error('[ErrorBoundary] Caught error:', {
      error,
      errorInfo,
      elementId: this.props.elementId,
      depth: this.props.depth,
      renderPath: this.props.renderPath,
      componentStack: errorInfo.componentStack,
    });

    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // Check if this is a DOM manipulation error that we can recover from
    const isDOMError = this.isDOMManipulationError(error);
    const isDepthError = this.isDepthRelatedError(error);

    if (isDOMError) {
      this.attemptAutoRecovery();
    } else if (isDepthError) {
      console.warn('[ErrorBoundary] Depth-related error detected - rendering may have exceeded limits');
    }

    // If you have an error logging service, you could send the error there
    // logErrorToService(error, errorInfo);
  }

  isDepthRelatedError = (error) => {
    if (!error || !error.message) return false;

    const depthErrorPatterns = [
      /Maximum call stack size exceeded/i,
      /Too much recursion/i,
      /Maximum nesting depth/i,
      /Circular reference/i,
      /Stack overflow/i,
    ];

    return depthErrorPatterns.some((pattern) => pattern.test(error.message));
  };

  isDOMManipulationError = (error) => {
    if (!error || !error.message) return false;

    const domErrorPatterns = [
      /Failed to execute 'removeChild' on 'Node'/i,
      /The node to be removed is not a child of this node/i,
      /Failed to execute 'appendChild' on 'Node'/i,
      /Failed to execute 'insertBefore' on 'Node'/i,
      /Cannot read prop.*of null/i, // Common when DOM nodes become null
      /Cannot read properties of null/i,
    ];

    return domErrorPatterns.some((pattern) => pattern.test(error.message));
  };

  attemptAutoRecovery = () => {
    this.setState({ autoRecovering: true });

    // Clear any existing recovery timeout
    if (this.recoveryTimeout) {
      clearTimeout(this.recoveryTimeout);
    }

    // Try to recover after a short delay
    this.recoveryTimeout = setTimeout(() => {
      try {
        // Call the parent's DOM error handler if provided
        if (this.props.onDOMError && typeof this.props.onDOMError === 'function') {
          this.props.onDOMError();
        }

        // Clean up any problematic DOM elements
        this.cleanupProblematicDOMElements();

        // Reset error state to try rendering again
        this.setState({
          hasError: false,
          error: null,
          errorInfo: null,
          autoRecovering: false,
        });
      } catch (recoveryError) {
        this.setState({ autoRecovering: false });
      }
    }, 500); // Give DOM time to settle
  };

  cleanupProblematicDOMElements = () => {
    try {
      // Remove any orphaned elements that might be causing issues
      const orphanedElements = document.querySelectorAll('[data-sortable-orphan]');
      orphanedElements.forEach((el) => {
        try {
          el.remove();
        } catch (e) {}
      });

      // Clean up duplicate IDs that might cause conflicts
      const seenIds = new Set();
      const elementsWithIds = document.querySelectorAll('[id]');

      elementsWithIds.forEach((element) => {
        if (element.id && seenIds.has(element.id)) {
          try {
            // Mark for removal instead of removing immediately
            element.setAttribute('data-sortable-orphan', 'true');
            // Remove on next tick
            setTimeout(() => {
              try {
                if (element.parentNode) {
                  element.remove();
                }
              } catch (e) {}
            }, 0);
          } catch (e) {}
        } else if (element.id) {
          seenIds.add(element.id);
        }
      });

      // Force garbage collection if available (development only)
      if (window.gc && typeof window.gc === 'function') {
        setTimeout(() => window.gc(), 100);
      }
    } catch (cleanupError) {}
  };

  componentWillUnmount() {
    if (this.recoveryTimeout) {
      clearTimeout(this.recoveryTimeout);
    }
  }

  handleManualRetry = () => {
    this.attemptAutoRecovery();
  };

  render() {
    if (this.state.hasError) {
      const isDOMError = this.isDOMManipulationError(this.state.error);
      const isDepthError = this.isDepthRelatedError(this.state.error);

      // You can render any custom fallback UI
      return (
        <div className="error-boundary-fallback zoomed6">
          {this.state.autoRecovering ? (
            <div className="auto-recovering">
              <h5>🔄 Recovering...</h5>
              <p>Attempting to fix DOM synchronization issues...</p>
            </div>
          ) : (
            <>
              <h5>Something went wrong</h5>

              {/* Show element context if available */}
              {(this.props.elementId || this.props.depth !== undefined) && (
                <div className="error-context" style={{
                  backgroundColor: '#fff3cd',
                  padding: '8px',
                  marginBottom: '8px',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}>
                  {this.props.elementId && <div><strong>Element:</strong> {this.props.elementId}</div>}
                  {this.props.depth !== undefined && <div><strong>Nesting Depth:</strong> {this.props.depth}</div>}
                  {this.props.renderPath && this.props.renderPath.length > 0 && (
                    <details>
                      <summary style={{ cursor: 'pointer' }}>View render path</summary>
                      <pre style={{ fontSize: '10px', overflow: 'auto', maxHeight: '100px' }}>
                        {this.props.renderPath.join('\n → ')}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {isDepthError && (
                <div className="depth-error-info" style={{
                  backgroundColor: '#f8d7da',
                  padding: '12px',
                  marginBottom: '8px',
                  borderRadius: '4px',
                  border: '1px solid #f5c6cb'
                }}>
                  <p style={{ margin: 0, color: '#721c24', fontWeight: 'bold' }}>
                    🔁 Detected a depth or recursion error
                  </p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#721c24' }}>
                    This usually happens when views reference each other in a circular pattern.
                    Check your component view references for circular loops.
                  </p>
                </div>
              )}

              {isDOMError && (
                <div className="dom-error-info">
                  <p>
                    ⚠️ Detected a DOM synchronization error. This usually happens when drag-and-drop operations conflict with
                    React updates.
                  </p>
                  <button
                    className="retry-button"
                    style={{
                      padding: '8px 16px',
                      margin: '8px 0',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                    onClick={this.handleManualRetry}
                  >
                    🔄 Try Again
                  </button>
                </div>
              )}
              <details style={{ whiteSpace: 'pre-wrap' }}>
                <summary>See error details</summary>
                <p>{this.state.error && this.state.error.toString()}</p>
                <p>Component Stack Error Details:</p>
                <p>{this.state.errorInfo && this.state.errorInfo.componentStack}</p>
              </details>
              {this.props.fallback ? this.props.fallback : null}
            </>
          )}
        </div>
      );
    }

    // If there's no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
