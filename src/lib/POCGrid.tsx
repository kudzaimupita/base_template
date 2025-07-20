import React, { useState, useRef, useEffect } from 'react';
import Moveable from 'react-moveable';

const ResponsiveGridLayout = () => {
    // Grid configuration for different breakpoints
    const [breakpoint, setBreakpoint] = useState('lg');
    const [gridConfig, setGridConfig] = useState({
        lg: { cols: 12, rowHeight: 80, margin: [10, 10] },
        md: { cols: 10, rowHeight: 70, margin: [10, 10] },
        sm: { cols: 6, rowHeight: 60, margin: [8, 8] },
        xs: { cols: 4, rowHeight: 50, margin: [5, 5] }
    });

    const [elements, setElements] = useState([
        {
            id: 1,
            x: 0, y: 0, w: 3, h: 2,
            content: 'Dashboard Widget',
            color: 'from-blue-500 to-blue-700'
        },
        {
            id: 2,
            x: 4, y: 0, w: 4, h: 3,
            content: 'Analytics Chart',
            color: 'from-green-500 to-green-700'
        },
        {
            id: 3,
            x: 8, y: 0, w: 4, h: 2,
            content: 'User Stats',
            color: 'from-purple-500 to-purple-700'
        },
        {
            id: 4,
            x: 0, y: 2, w: 2, h: 2,
            content: 'Quick Actions',
            color: 'from-red-500 to-red-700'
        },
        {
            id: 5,
            x: 2, y: 2, w: 2, h: 1,
            content: 'Notifications',
            color: 'from-yellow-500 to-yellow-700'
        }
    ]);

    const [selectedElement, setSelectedElement] = useState(null);
    const containerRef = useRef(null);
    const targetRefs = useRef({});

    // Determine breakpoint based on screen width
    useEffect(() => {
        const updateBreakpoint = () => {
            const width = window.innerWidth;
            if (width >= 1200) setBreakpoint('lg');
            else if (width >= 996) setBreakpoint('md');
            else if (width >= 768) setBreakpoint('sm');
            else setBreakpoint('xs');
        };

        updateBreakpoint();
        window.addEventListener('resize', updateBreakpoint);
        return () => window.removeEventListener('resize', updateBreakpoint);
    }, []);

    // Check for collisions
    const checkCollision = (item, otherItem) => {
        if (item.id === otherItem.id) return false;

        return !(
            item.x >= otherItem.x + otherItem.w ||
            otherItem.x >= item.x + item.w ||
            item.y >= otherItem.y + otherItem.h ||
            otherItem.y >= item.y + item.h
        );
    };

    // Find available position without collision
    const findAvailablePosition = (item, allItems, cols) => {
        const others = allItems.filter(el => el.id !== item.id);

        for (let y = 0; y < 50; y++) {
            for (let x = 0; x <= cols - item.w; x++) {
                const testItem = { ...item, x, y };
                const hasCollision = others.some(other => checkCollision(testItem, other));

                if (!hasCollision) {
                    return { x, y };
                }
            }
        }

        return { x: 0, y: 0 };
    };

    // Compact layout by moving items up
    const compactLayout = (items, cols) => {
        const sortedItems = [...items].sort((a, b) => a.y - b.y || a.x - b.x);

        return sortedItems.map(item => {
            const others = sortedItems.filter(el => el.id !== item.id);

            for (let y = 0; y < item.y; y++) {
                const testItem = { ...item, y };
                const hasCollision = others.some(other => checkCollision(testItem, other));

                if (!hasCollision) {
                    return { ...item, y };
                }
            }

            return item;
        });
    };

    // Convert grid position to CSS
    const getElementStyle = (element) => {
        const config = gridConfig[breakpoint];
        const containerWidth = containerRef.current?.clientWidth || 1200;
        const colWidth = (containerWidth - (config.cols + 1) * config.margin[0]) / config.cols;

        return {
            position: 'absolute',
            left: element.x * (colWidth + config.margin[0]) + config.margin[0],
            top: element.y * (config.rowHeight + config.margin[1]) + config.margin[1],
            width: element.w * colWidth + (element.w - 1) * config.margin[0],
            height: element.h * config.rowHeight + (element.h - 1) * config.margin[1],
            transition: selectedElement === element.id ? 'none' : 'all 0.2s ease-in-out'
        };
    };

    // Handle drag
    const handleDrag = (elementId, { left, top }) => {
        const config = gridConfig[breakpoint];
        const containerWidth = containerRef.current?.clientWidth || 1200;
        const colWidth = (containerWidth - (config.cols + 1) * config.margin[0]) / config.cols;

        // Convert pixel position to grid position
        const gridX = Math.round((left - config.margin[0]) / (colWidth + config.margin[0]));
        const gridY = Math.round((top - config.margin[1]) / (config.rowHeight + config.margin[1]));

        // Constrain to grid bounds
        const element = elements.find(el => el.id === elementId);
        const constrainedX = Math.max(0, Math.min(gridX, config.cols - element.w));
        const constrainedY = Math.max(0, gridY);

        // Check for collisions
        const testElement = { ...element, x: constrainedX, y: constrainedY };
        const hasCollision = elements
            .filter(el => el.id !== elementId)
            .some(other => checkCollision(testElement, other));

        if (!hasCollision) {
            setElements(prevElements => {
                const newElements = prevElements.map(el =>
                    el.id === elementId
                        ? { ...el, x: constrainedX, y: constrainedY }
                        : el
                );

                // Compact layout after move
                return compactLayout(newElements, config.cols);
            });
        }
    };

    // Handle resize
    const handleResize = (elementId, { width, height, drag }) => {
        const config = gridConfig[breakpoint];
        const containerWidth = containerRef.current?.clientWidth || 1200;
        const colWidth = (containerWidth - (config.cols + 1) * config.margin[0]) / config.cols;

        // Convert pixel size to grid size
        const gridW = Math.max(1, Math.round(width / (colWidth + config.margin[0])));
        const gridH = Math.max(1, Math.round(height / (config.rowHeight + config.margin[1])));

        const element = elements.find(el => el.id === elementId);
        const constrainedW = Math.min(gridW, config.cols - element.x);

        // Check for collisions with new size
        const testElement = { ...element, w: constrainedW, h: gridH };
        const hasCollision = elements
            .filter(el => el.id !== elementId)
            .some(other => checkCollision(testElement, other));

        if (!hasCollision) {
            setElements(prevElements =>
                prevElements.map(el =>
                    el.id === elementId
                        ? { ...el, w: constrainedW, h: gridH }
                        : el
                )
            );
        }

        // Handle drag during resize
        if (drag) {
            handleDrag(elementId, drag);
        }
    };

    // Add new element
    const addElement = () => {
        const newElement = {
            id: Date.now(),
            x: 0,
            y: 0,
            w: 2,
            h: 2,
            content: `New Widget ${elements.length + 1}`,
            color: 'from-indigo-500 to-indigo-700'
        };

        const config = gridConfig[breakpoint];
        const position = findAvailablePosition(newElement, elements, config.cols);

        setElements(prev => [...prev, { ...newElement, ...position }]);
    };

    // Remove element
    const removeElement = (id) => {
        setElements(prev => {
            const filtered = prev.filter(el => el.id !== id);
            return compactLayout(filtered, gridConfig[breakpoint].cols);
        });
        setSelectedElement(null);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            {}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-800">
                    Responsive Grid Layout
                </h1>

                <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600">
                        Breakpoint: <span className="font-semibold uppercase">{breakpoint}</span>
                    </div>

                    <button
                        onClick={addElement}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                    >
                        Add Widget
                    </button>

                    {selectedElement && (
                        <button
                            onClick={() => removeElement(selectedElement)}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        >
                            Remove Selected
                        </button>
                    )}
                </div>
            </div>

            {}
            <div
                ref={containerRef}
                className="relative bg-white rounded-lg shadow-sm border min-h-96"
                style={{
                    paddingBottom: '20px',
                    backgroundImage: `
            linear-gradient(to right, #f0f0f0 1px, transparent 1px),
            linear-gradient(to bottom, #f0f0f0 1px, transparent 1px)
          `,
                    backgroundSize: `${100 / gridConfig[breakpoint].cols}% ${gridConfig[breakpoint].rowHeight + gridConfig[breakpoint].margin[1]}px`
                }}
                onClick={() => setSelectedElement(null)}
            >
                {elements.map(element => (
                    <div
                        key={element.id}
                        ref={el => targetRefs.current[element.id] = el}
                        className={`bg-gradient-to-br ${element.color} rounded-lg shadow-lg cursor-pointer select-none overflow-hidden ${selectedElement === element.id ? 'ring-2 ring-blue-400 ring-offset-2' : ''
                            }`}
                        style={getElementStyle(element)}
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedElement(element.id);
                        }}
                    >
                        <div className="p-4 h-full flex flex-col">
                            <div className="text-white font-semibold text-sm mb-2">
                                {element.content}
                            </div>

                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-white text-opacity-75 text-xs text-center">
                                    <div>Grid: {element.x},{element.y}</div>
                                    <div>Size: {element.w}×{element.h}</div>
                                    <div className="mt-2">Click to select</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {selectedElement && (
                    <Moveable
                        target={targetRefs.current[selectedElement]}
                        draggable={true}
                        resizable={true}
                        keepRatio={false}
                        throttleDrag={10}
                        throttleResize={10}
                        onDrag={({ left, top }) => handleDrag(selectedElement, { left, top })}
                        onResize={({ width, height, drag }) => handleResize(selectedElement, { width, height, drag })}
                        renderDirections={['nw', 'ne', 'sw', 'se', 'e', 's']}
                        edge={false}
                        snappable={true}
                        snapContainer={containerRef.current}
                        snapThreshold={5}
                    />
                )}
            </div>

            {}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="font-semibold text-gray-800 mb-2">Current Layout</h3>
                    <div className="text-sm text-gray-600">
                        <div>Columns: {gridConfig[breakpoint].cols}</div>
                        <div>Row Height: {gridConfig[breakpoint].rowHeight}px</div>
                        <div>Elements: {elements.length}</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="font-semibold text-gray-800 mb-2">Features</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Collision prevention</li>
                        <li>• Auto-compacting</li>
                        <li>• Responsive breakpoints</li>
                        <li>• Grid snapping</li>
                    </ul>
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="font-semibold text-gray-800 mb-2">Controls</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Click to select elements</li>
                        <li>• Drag to reposition</li>
                        <li>• Resize with handles</li>
                        <li>• Add/remove widgets</li>
                    </ul>
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="font-semibold text-gray-800 mb-2">Breakpoints</h3>
                    <div className="text-sm text-gray-600">
                        <div>XS: &lt;768px (4 cols)</div>
                        <div>SM: 768px+ (6 cols)</div>
                        <div>MD: 996px+ (10 cols)</div>
                        <div>LG: 1200px+ (12 cols)</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResponsiveGridLayout;