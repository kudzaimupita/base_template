import React, { useState, useRef } from 'react';
import { Activity, MousePointer, Zap } from 'lucide-react';

const DebugWrapper = ({
    children,
    eventHandlers = [],
    configuration = null,
    effectCount = 0,
    label = "Component",
    showDetails = true,
    enabled = true
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const containerRef = useRef(null);

    // Auto-detect event handlers from configuration object
    const detectedHandlers = configuration
        ? Object.keys(configuration).filter(key => key.toLowerCase().startsWith('on'))
        : [];

    const allHandlers = [...new Set([...eventHandlers, ...detectedHandlers])];
    const hasEventHandlers = allHandlers.length > 0;
    const hasEffects = effectCount > 0;

    if (!enabled || (!hasEventHandlers && !hasEffects)) {
        return children;
    }

    return (
        <div
            ref={containerRef}
            className="relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Render children as-is */}
            {children}

            {/* Debug indicators - positioned absolutely within this container */}
            {(hasEventHandlers || hasEffects) && (
                <>
                    {/* Corner activity indicator */}
                    <div
                        className="absolute top-0 right-0 z-40 pointer-events-none"
                        style={{ transform: 'translate(50%, -50%)' }}
                    >
                        <Activity
                            size={12}
                            className="text-green-400 animate-pulse drop-shadow-sm"
                        />
                    </div>

                    {/* Badges */}
                    <div className="absolute -top-2 -right-2 z-50 flex gap-1 pointer-events-none">
                        {hasEventHandlers && (
                            <div className="bg-blue-500 text-white px-1.5 py-0.5 rounded-full text-xs font-medium shadow-lg flex items-center gap-1">
                                <MousePointer size={10} />
                                {allHandlers.length}
                            </div>
                        )}

                        {hasEffects && (
                            <div className="bg-purple-500 text-white px-1.5 py-0.5 rounded-full text-xs font-medium shadow-lg flex items-center gap-1">
                                <Zap size={10} />
                                {effectCount}
                            </div>
                        )}
                    </div>

                    {/* Hover tooltip */}
                    {isHovered && showDetails && (
                        <div className="absolute -top-24 right-0 bg-gray-900 text-white p-3 rounded-lg shadow-xl border border-gray-700 min-w-48 pointer-events-none z-50">
                            <div className="text-sm font-semibold mb-2 text-blue-300">{label}</div>

                            {hasEventHandlers && (
                                <div className="mb-2">
                                    <div className="flex items-center gap-1 text-blue-400 text-xs font-medium mb-1">
                                        <MousePointer size={10} />
                                        Event Handlers
                                    </div>
                                    <div className="text-xs text-gray-300 flex flex-wrap gap-1">
                                        {allHandlers.map((handler, i) => (
                                            <span key={i} className="bg-blue-600 px-1 py-0.5 rounded text-xs">
                                                {handler}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {hasEffects && (
                                <div>
                                    <div className="flex items-center gap-1 text-purple-400 text-xs font-medium mb-1">
                                        <Zap size={10} />
                                        Effects
                                    </div>
                                    <div className="text-xs text-gray-300">
                                        {effectCount} active effect{effectCount !== 1 ? 's' : ''}
                                    </div>
                                </div>
                            )}

                            {/* Tooltip arrow */}
                            <div className="absolute top-full right-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default DebugWrapper;
