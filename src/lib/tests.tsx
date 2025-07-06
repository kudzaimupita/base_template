import React, { useEffect, useState, useRef } from 'react';
import {
    Copy, ChevronDown, ChevronRight, Layout, Type, Palette,
    Move, Zap, Plus, X, Eye, EyeOff, Monitor, Smartphone, MousePointer
} from 'lucide-react';

const FigmaTailwindEditor = ({ value = '', onChange }) => {
    const [collapsedSections, setCollapsedSections] = useState({});
    const [activeStateTab, setActiveStateTab] = useState('base');
    const [copied, setCopied] = useState(false);
    const [customClass, setCustomClass] = useState('');

    // Track all classes that aren't controlled by UI inputs
    const [preservedClasses, setPreservedClasses] = useState([]);

    // Comprehensive controlled properties
    const [controlledProperties, setControlledProperties] = useState({
        // Layout
        display: '',
        position: '',
        float: '',
        clear: '',
        isolation: '',
        objectFit: '',
        objectPosition: '',
        overflow: '',
        overflowX: '',
        overflowY: '',
        overscrollBehavior: '',

        // Flexbox & Grid
        flexDirection: '',
        flexWrap: '',
        flex: '',
        flexGrow: '',
        flexShrink: '',
        order: '',
        gridTemplateColumns: '',
        gridColumn: '',
        gridTemplateRows: '',
        gridRow: '',
        justifyContent: '',
        justifyItems: '',
        justifySelf: '',
        alignContent: '',
        alignItems: '',
        alignSelf: '',
        placeContent: '',
        placeItems: '',
        placeSelf: '',
        gap: '',

        // Spacing
        padding: '',
        paddingX: '',
        paddingY: '',
        paddingTop: '',
        paddingRight: '',
        paddingBottom: '',
        paddingLeft: '',
        margin: '',
        marginX: '',
        marginY: '',
        marginTop: '',
        marginRight: '',
        marginBottom: '',
        marginLeft: '',
        space: '',

        // Sizing
        width: '',
        minWidth: '',
        maxWidth: '',
        height: '',
        minHeight: '',
        maxHeight: '',

        // Typography
        fontFamily: '',
        fontSize: '',
        fontWeight: '',
        letterSpacing: '',
        lineHeight: '',
        listStyleType: '',
        listStylePosition: '',
        textAlign: '',
        textColor: '',
        textDecoration: '',
        textDecorationColor: '',
        textDecorationStyle: '',
        textDecorationThickness: '',
        textUnderlineOffset: '',
        textTransform: '',
        textOverflow: '',
        textIndent: '',
        verticalAlign: '',
        whitespace: '',
        wordBreak: '',

        // Backgrounds
        backgroundColor: '',
        backgroundOpacity: '',
        backgroundImage: '',
        backgroundSize: '',
        backgroundPosition: '',
        backgroundRepeat: '',
        backgroundAttachment: '',
        backgroundClip: '',
        backgroundOrigin: '',

        // Borders
        borderWidth: '',
        borderColor: '',
        borderOpacity: '',
        borderStyle: '',
        borderRadius: '',
        borderTopWidth: '',
        borderRightWidth: '',
        borderBottomWidth: '',
        borderLeftWidth: '',
        divideWidth: '',
        divideColor: '',
        divideOpacity: '',
        divideStyle: '',
        outlineWidth: '',
        outlineColor: '',
        outlineStyle: '',
        outlineOffset: '',
        ringWidth: '',
        ringColor: '',
        ringOpacity: '',
        ringOffsetWidth: '',
        ringOffsetColor: '',

        // Effects
        boxShadow: '',
        boxShadowColor: '',
        opacity: '',
        mixBlendMode: '',
        backgroundBlendMode: '',

        // Filters
        blur: '',
        brightness: '',
        contrast: '',
        dropShadow: '',
        grayscale: '',
        hueRotate: '',
        invert: '',
        saturate: '',
        sepia: '',
        backdropBlur: '',
        backdropBrightness: '',
        backdropContrast: '',
        backdropGrayscale: '',
        backdropHueRotate: '',
        backdropInvert: '',
        backdropOpacity: '',
        backdropSaturate: '',
        backdropSepia: '',

        // Tables
        borderCollapse: '',
        borderSpacing: '',
        tableLayout: '',

        // Transitions & Animation
        transitionProperty: '',
        transitionDuration: '',
        transitionTimingFunction: '',
        transitionDelay: '',
        animation: '',

        // Transforms
        scale: '',
        rotate: '',
        translate: '',
        skew: '',
        transformOrigin: '',

        // Interactivity
        accentColor: '',
        appearance: '',
        cursor: '',
        caretColor: '',
        pointerEvents: '',
        resize: '',
        scrollBehavior: '',
        scrollMargin: '',
        scrollPadding: '',
        scrollSnapAlign: '',
        scrollSnapStop: '',
        scrollSnapType: '',
        touchAction: '',
        userSelect: '',
        willChange: '',

        // SVG
        fill: '',
        stroke: '',
        strokeWidth: '',

        // Accessibility
        srOnly: '',

        // Interactive states
        hover: {},
        focus: {},
        active: {},
        disabled: {},
        visited: {},
        first: {},
        last: {},
        odd: {},
        even: {},
        group: {}
    });

    const isInitializing = useRef(false);
    const lastGeneratedValue = useRef('');

    useEffect(() => {
        if (value && typeof value === 'string' && value !== lastGeneratedValue.current) {
            isInitializing.current = true;
            parseExistingClasses(value);
            setTimeout(() => {
                isInitializing.current = false;
            }, 0);
        }
    }, [value]);

    const parseExistingClasses = (className) => {
        if (!className) return;

        const classes = className.split(' ').filter(cls => cls.trim());
        const newControlledProperties = JSON.parse(JSON.stringify(controlledProperties));
        const newPreservedClasses = [];

        // Reset controlled properties
        Object.keys(newControlledProperties).forEach(key => {
            if (typeof newControlledProperties[key] === 'object') {
                newControlledProperties[key] = {};
            } else {
                newControlledProperties[key] = '';
            }
        });

        classes.forEach(cls => {
            const stateMatch = cls.match(/^(hover|focus|active|disabled|visited|first|last|odd|even|group):(.+)$/);
            if (stateMatch) {
                const [, state, baseClass] = stateMatch;
                if (isControlledClass(baseClass)) {
                    assignControlledClass(baseClass, newControlledProperties, state);
                } else {
                    newPreservedClasses.push(cls);
                }
            } else {
                if (isControlledClass(cls)) {
                    assignControlledClass(cls, newControlledProperties, 'base');
                } else {
                    newPreservedClasses.push(cls);
                }
            }
        });

        setControlledProperties(newControlledProperties);
        setPreservedClasses(newPreservedClasses);
    };

    const isControlledClass = (cls) => {
        // Comprehensive pattern matching for all Tailwind classes
        const patterns = [
            // Layout
            /^(block|inline-block|inline|flex|inline-flex|table|inline-table|table-caption|table-cell|table-column|table-column-group|table-footer-group|table-header-group|table-row-group|table-row|flow-root|grid|inline-grid|contents|list-item|hidden)$/,
            /^(static|fixed|absolute|relative|sticky)$/,
            /^(inset|top|right|bottom|left)-/,
            /^(visible|invisible|collapse)$/,
            /^z-/,

            // Flexbox & Grid
            /^(flex-row|flex-row-reverse|flex-col|flex-col-reverse)$/,
            /^(flex-wrap|flex-wrap-reverse|flex-nowrap)$/,
            /^(flex-1|flex-auto|flex-initial|flex-none)$/,
            /^(grow|grow-0|shrink|shrink-0)$/,
            /^order-/,
            /^(grid-cols|col-span|col-start|col-end)-/,
            /^(grid-rows|row-span|row-start|row-end)-/,
            /^(justify-normal|justify-start|justify-end|justify-center|justify-between|justify-around|justify-evenly|justify-stretch)$/,
            /^(justify-items-start|justify-items-end|justify-items-center|justify-items-stretch)$/,
            /^(justify-self-auto|justify-self-start|justify-self-end|justify-self-center|justify-self-stretch)$/,
            /^(content-normal|content-center|content-start|content-end|content-between|content-around|content-evenly|content-baseline|content-stretch)$/,
            /^(items-start|items-end|items-center|items-baseline|items-stretch)$/,
            /^(self-auto|self-start|self-end|self-center|self-stretch|self-baseline)$/,
            /^(place-content|place-items|place-self)-/,
            /^gap-/,

            // Spacing
            /^[pm][xytrbl]?-/,
            /^space-[xy]-/,

            // Sizing
            /^(w|min-w|max-w|h|min-h|max-h)-/,

            // Typography
            /^font-/,
            /^text-/,
            /^(leading|tracking)-/,
            /^(list-none|list-disc|list-decimal)$/,
            /^(list-inside|list-outside)$/,
            /^(underline|overline|line-through|no-underline)$/,
            /^(uppercase|lowercase|capitalize|normal-case)$/,
            /^(truncate|text-ellipsis|text-clip)$/,
            /^(align-baseline|align-top|align-middle|align-bottom|align-text-top|align-text-bottom|align-super|align-sub)$/,
            /^(whitespace-normal|whitespace-nowrap|whitespace-pre|whitespace-pre-line|whitespace-pre-wrap)$/,
            /^(break-normal|break-words|break-all|break-keep)$/,

            // Backgrounds
            /^bg-/,

            // Borders
            /^(border|divide|outline|ring)-/,
            /^rounded/,

            // Effects
            /^(shadow|opacity|mix-blend|bg-blend)-/,

            // Filters
            /^(blur|brightness|contrast|drop-shadow|grayscale|hue-rotate|invert|saturate|sepia|backdrop)-/,

            // Tables
            /^(border-collapse|border-separate|border-spacing|table-auto|table-fixed)$/,

            // Transitions & Animation
            /^(transition|duration|ease|delay|animate)-/,

            // Transforms
            /^(scale|rotate|translate|skew|transform|origin)-/,

            // Interactivity
            /^(accent|appearance|cursor|caret|pointer-events|resize|scroll|select|snap|touch|will-change)-/,

            // SVG
            /^(fill|stroke)-/,

            // Accessibility
            /^sr-only$/
        ];

        return patterns.some(pattern => pattern.test(cls));
    };

    const assignControlledClass = (cls, props, state = 'base') => {
        // Mapping logic for all the different class types
        let propertyKey = null;

        // Layout
        if (/^(block|inline-block|inline|flex|inline-flex|table|inline-table|table-caption|table-cell|table-column|table-column-group|table-footer-group|table-header-group|table-row-group|table-row|flow-root|grid|inline-grid|contents|list-item|hidden)$/.test(cls)) {
            propertyKey = 'display';
        } else if (/^(static|fixed|absolute|relative|sticky)$/.test(cls)) {
            propertyKey = 'position';
        } else if (/^z-/.test(cls)) {
            propertyKey = 'zIndex';
        }
        // Flexbox & Grid
        else if (/^(flex-row|flex-row-reverse|flex-col|flex-col-reverse)$/.test(cls)) {
            propertyKey = 'flexDirection';
        } else if (/^(flex-wrap|flex-wrap-reverse|flex-nowrap)$/.test(cls)) {
            propertyKey = 'flexWrap';
        } else if (/^(flex-1|flex-auto|flex-initial|flex-none)$/.test(cls)) {
            propertyKey = 'flex';
        } else if (/^(grow|grow-0)$/.test(cls)) {
            propertyKey = 'flexGrow';
        } else if (/^(shrink|shrink-0)$/.test(cls)) {
            propertyKey = 'flexShrink';
        } else if (cls.startsWith('order-')) {
            propertyKey = 'order';
        } else if (cls.startsWith('grid-cols-')) {
            propertyKey = 'gridTemplateColumns';
        } else if (cls.startsWith('col-')) {
            propertyKey = 'gridColumn';
        } else if (cls.startsWith('grid-rows-')) {
            propertyKey = 'gridTemplateRows';
        } else if (cls.startsWith('row-')) {
            propertyKey = 'gridRow';
        } else if (/^(justify-normal|justify-start|justify-end|justify-center|justify-between|justify-around|justify-evenly|justify-stretch)$/.test(cls)) {
            propertyKey = 'justifyContent';
        } else if (/^justify-items-/.test(cls)) {
            propertyKey = 'justifyItems';
        } else if (/^justify-self-/.test(cls)) {
            propertyKey = 'justifySelf';
        } else if (/^content-/.test(cls)) {
            propertyKey = 'alignContent';
        } else if (/^(items-start|items-end|items-center|items-baseline|items-stretch)$/.test(cls)) {
            propertyKey = 'alignItems';
        } else if (/^self-/.test(cls)) {
            propertyKey = 'alignSelf';
        } else if (cls.startsWith('gap-')) {
            propertyKey = 'gap';
        }
        // Spacing
        else if (/^p[xytrbl]?-/.test(cls)) {
            if (cls.startsWith('px-')) propertyKey = 'paddingX';
            else if (cls.startsWith('py-')) propertyKey = 'paddingY';
            else if (cls.startsWith('pt-')) propertyKey = 'paddingTop';
            else if (cls.startsWith('pr-')) propertyKey = 'paddingRight';
            else if (cls.startsWith('pb-')) propertyKey = 'paddingBottom';
            else if (cls.startsWith('pl-')) propertyKey = 'paddingLeft';
            else if (cls.startsWith('p-')) propertyKey = 'padding';
        } else if (/^m[xytrbl]?-/.test(cls)) {
            if (cls.startsWith('mx-')) propertyKey = 'marginX';
            else if (cls.startsWith('my-')) propertyKey = 'marginY';
            else if (cls.startsWith('mt-')) propertyKey = 'marginTop';
            else if (cls.startsWith('mr-')) propertyKey = 'marginRight';
            else if (cls.startsWith('mb-')) propertyKey = 'marginBottom';
            else if (cls.startsWith('ml-')) propertyKey = 'marginLeft';
            else if (cls.startsWith('m-')) propertyKey = 'margin';
        } else if (cls.startsWith('space-')) {
            propertyKey = 'space';
        }
        // Sizing
        else if (cls.startsWith('w-')) {
            propertyKey = 'width';
        } else if (cls.startsWith('min-w-')) {
            propertyKey = 'minWidth';
        } else if (cls.startsWith('max-w-')) {
            propertyKey = 'maxWidth';
        } else if (cls.startsWith('h-')) {
            propertyKey = 'height';
        } else if (cls.startsWith('min-h-')) {
            propertyKey = 'minHeight';
        } else if (cls.startsWith('max-h-')) {
            propertyKey = 'maxHeight';
        }
        // Typography
        else if (cls.startsWith('font-')) {
            if (/^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/.test(cls)) {
                propertyKey = 'fontWeight';
            } else {
                propertyKey = 'fontFamily';
            }
        } else if (cls.startsWith('text-')) {
            if (/^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)$/.test(cls)) {
                propertyKey = 'fontSize';
            } else if (/^text-(left|center|right|justify|start|end)$/.test(cls)) {
                propertyKey = 'textAlign';
            } else {
                propertyKey = 'textColor';
            }
        } else if (cls.startsWith('leading-')) {
            propertyKey = 'lineHeight';
        } else if (cls.startsWith('tracking-')) {
            propertyKey = 'letterSpacing';
        } else if (/^(underline|overline|line-through|no-underline)$/.test(cls)) {
            propertyKey = 'textDecoration';
        } else if (/^(uppercase|lowercase|capitalize|normal-case)$/.test(cls)) {
            propertyKey = 'textTransform';
        }
        // Backgrounds
        else if (cls.startsWith('bg-')) {
            propertyKey = 'backgroundColor';
        }
        // Effects
        else if (cls.startsWith('shadow')) {
            propertyKey = 'boxShadow';
        } else if (cls.startsWith('opacity-')) {
            propertyKey = 'opacity';
        }
        // Transforms
        else if (cls.startsWith('scale-')) {
            propertyKey = 'scale';
        } else if (cls.startsWith('rotate-')) {
            propertyKey = 'rotate';
        } else if (cls.startsWith('translate-')) {
            propertyKey = 'translate';
        }
        // Borders
        else if (cls.startsWith('border')) {
            if (cls.startsWith('border-') && !cls.includes('color') && !cls.includes('opacity')) {
                propertyKey = 'borderWidth';
            } else {
                propertyKey = 'borderColor';
            }
        } else if (cls.startsWith('rounded')) {
            propertyKey = 'borderRadius';
        }

        if (propertyKey) {
            if (state === 'base') {
                props[propertyKey] = cls;
            } else {
                if (!props[state]) props[state] = {};
                props[state][propertyKey] = cls;
            }
        }
    };

    const updateProperty = (key, value, state = 'base') => {
        if (state === 'base') {
            setControlledProperties(prev => ({ ...prev, [key]: value }));
        } else {
            setControlledProperties(prev => ({
                ...prev,
                [state]: { ...prev[state], [key]: value }
            }));
        }
    };

    const generateClassName = () => {
        const controlledClasses = [];
        const stateClasses = [];

        // Add controlled base classes
        Object.entries(controlledProperties).forEach(([key, value]) => {
            if (typeof value === 'string' && value.trim()) {
                controlledClasses.push(value);
            }
        });

        // Add controlled state classes
        ['hover', 'focus', 'active', 'disabled', 'visited', 'first', 'last', 'odd', 'even', 'group'].forEach(state => {
            Object.entries(controlledProperties[state] || {}).forEach(([key, value]) => {
                if (value && value.trim()) {
                    stateClasses.push(`${state}:${value}`);
                }
            });
        });

        // Combine all classes
        const preservedClassesList = preservedClasses.filter(cls => cls.trim());

        return [
            ...preservedClassesList,
            ...controlledClasses,
            ...stateClasses
        ].filter(cls => cls.trim()).join(' ');
    };

    const copyToClipboard = () => {
        const className = generateClassName();
        if (className) {
            navigator.clipboard.writeText(className);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const addCustomClass = () => {
        if (customClass.trim()) {
            setPreservedClasses(prev => [...prev, customClass.trim()]);
            setCustomClass('');
        }
    };

    const removePreservedClass = (index) => {
        setPreservedClasses(prev => prev.filter((_, i) => i !== index));
    };

    useEffect(() => {
        if (!isInitializing.current) {
            const newClassName = generateClassName();
            if (onChange && newClassName !== lastGeneratedValue.current) {
                onChange(newClassName);
                lastGeneratedValue.current = newClassName;
            }
        }
    }, [controlledProperties, preservedClasses]);

    const toggleSection = (section) => {
        setCollapsedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const Section = ({ title, icon: Icon, children, sectionKey }) => (
        <div className="border-b border-neutral-800" >
            <button
                onClick={() => toggleSection(sectionKey)}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-neutral-900 text-neutral-300"
            >
                <div className="flex items-center gap-2">
                    <Icon size={14} />
                    <span className="text-xs font-medium">{title}</span>
                </div>
                {collapsedSections[sectionKey] ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
            </button>
            {!collapsedSections[sectionKey] && (
                <div className="p-3">
                    {children}
                </div>
            )}
        </div>
    );

    const Select = ({ value, onChange, options, placeholder = "Select..." }) => (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-xs text-neutral-300 focus:outline-none focus:border-blue-500"
        >
            <option value="">{placeholder}</option>
            {options.map(option => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );

    const Input = ({ value, onChange, placeholder, type = "text" }) => (
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-xs text-neutral-300 focus:outline-none focus:border-blue-500"
        />
    );

    const StateTab = ({ state, label, isActive, onClick }) => (
        <button
            onClick={onClick}
            className={`px-2 py-1 text-xs rounded ${isActive
                ? 'bg-blue-600 text-white'
                : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-700'
                }`}
        >
            {label}
        </button>
    );

    const currentState = activeStateTab === 'base' ? controlledProperties : controlledProperties[activeStateTab] || {};

    return (
        <div className="w-full bg-neutral-950 text-neutral-300 h-screen overflow-y-auto border-l border-neutral-800">
            {/* Header */}
            <div className="p-3 border-b border-neutral-800">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-white">Properties</h2>
                    <button
                        onClick={copyToClipboard}
                        className={`p-1.5 rounded text-xs transition-colors ${copied
                            ? 'bg-green-600 text-white'
                            : 'bg-neutral-900 hover:bg-neutral-700 text-neutral-300'
                            }`}
                    >
                        <Copy size={12} />
                    </button>
                </div>

                {/* Class Preview */}
                <div className="bg-neutral-900 rounded p-2 text-xs font-mono text-neutral-400 break-all">
                    {generateClassName() || 'No classes'}
                </div>
            </div>

            {/* State Tabs */}
            <div className="p-3 border-b border-neutral-800">
                <div className="flex gap-1 mb-2">
                    <StateTab
                        state="base"
                        label="Base"
                        isActive={activeStateTab === 'base'}
                        onClick={() => setActiveStateTab('base')}
                    />
                    <StateTab
                        state="hover"
                        label="Hover"
                        isActive={activeStateTab === 'hover'}
                        onClick={() => setActiveStateTab('hover')}
                    />
                    <StateTab
                        state="focus"
                        label="Focus"
                        isActive={activeStateTab === 'focus'}
                        onClick={() => setActiveStateTab('focus')}
                    />
                    <StateTab
                        state="active"
                        label="Active"
                        isActive={activeStateTab === 'active'}
                        onClick={() => setActiveStateTab('active')}
                    />
                </div>
            </div>

            {/* Layout Section */}
            <Section title="Layout" icon={Layout} sectionKey="layout">
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-xs text-neutral-400 mb-1">Display</label>
                        <Select
                            value={currentState.display || ''}
                            onChange={(value) => updateProperty('display', value, activeStateTab)}
                            options={[
                                { value: 'block', label: 'Block' },
                                { value: 'inline-block', label: 'Inline Block' },
                                { value: 'inline', label: 'Inline' },
                                { value: 'flex', label: 'Flex' },
                                { value: 'inline-flex', label: 'Inline Flex' },
                                { value: 'grid', label: 'Grid' },
                                { value: 'inline-grid', label: 'Inline Grid' },
                                { value: 'hidden', label: 'Hidden' }
                            ]}
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-neutral-400 mb-1">Position</label>
                        <Select
                            value={currentState.position || ''}
                            onChange={(value) => updateProperty('position', value, activeStateTab)}
                            options={[
                                { value: 'static', label: 'Static' },
                                { value: 'relative', label: 'Relative' },
                                { value: 'absolute', label: 'Absolute' },
                                { value: 'fixed', label: 'Fixed' },
                                { value: 'sticky', label: 'Sticky' }
                            ]}
                        />
                    </div>

                    {(currentState.display === 'flex' || currentState.display === 'inline-flex') && (
                        <>
                            <div>
                                <label className="block text-xs text-neutral-400 mb-1">Direction</label>
                                <Select
                                    value={currentState.flexDirection || ''}
                                    onChange={(value) => updateProperty('flexDirection', value, activeStateTab)}
                                    options={[
                                        { value: 'flex-row', label: 'Row' },
                                        { value: 'flex-col', label: 'Column' },
                                        { value: 'flex-row-reverse', label: 'Row Reverse' },
                                        { value: 'flex-col-reverse', label: 'Column Reverse' }
                                    ]}
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-neutral-400 mb-1">Justify</label>
                                <Select
                                    value={currentState.justifyContent || ''}
                                    onChange={(value) => updateProperty('justifyContent', value, activeStateTab)}
                                    options={[
                                        { value: 'justify-start', label: 'Start' },
                                        { value: 'justify-center', label: 'Center' },
                                        { value: 'justify-end', label: 'End' },
                                        { value: 'justify-between', label: 'Between' },
                                        { value: 'justify-around', label: 'Around' },
                                        { value: 'justify-evenly', label: 'Evenly' }
                                    ]}
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-neutral-400 mb-1">Align</label>
                                <Select
                                    value={currentState.alignItems || ''}
                                    onChange={(value) => updateProperty('alignItems', value, activeStateTab)}
                                    options={[
                                        { value: 'items-start', label: 'Start' },
                                        { value: 'items-center', label: 'Center' },
                                        { value: 'items-end', label: 'End' },
                                        { value: 'items-stretch', label: 'Stretch' },
                                        { value: 'items-baseline', label: 'Baseline' }
                                    ]}
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-neutral-400 mb-1">Gap</label>
                                <Select
                                    value={currentState.gap || ''}
                                    onChange={(value) => updateProperty('gap', value, activeStateTab)}
                                    options={[
                                        { value: 'gap-0', label: '0' },
                                        { value: 'gap-1', label: '4px' },
                                        { value: 'gap-2', label: '8px' },
                                        { value: 'gap-3', label: '12px' },
                                        { value: 'gap-4', label: '16px' },
                                        { value: 'gap-6', label: '24px' },
                                        { value: 'gap-8', label: '32px' }
                                    ]}
                                />
                            </div>
                        </>
                    )}
                </div>
            </Section>

            {/* Sizing Section */}
            <Section title="Size" icon={Monitor} sectionKey="sizing">
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-xs text-neutral-400 mb-1">Width</label>
                        <Select
                            value={currentState.width || ''}
                            onChange={(value) => updateProperty('width', value, activeStateTab)}
                            options={[
                                { value: 'w-auto', label: 'Auto' },
                                { value: 'w-full', label: '100%' },
                                { value: 'w-screen', label: '100vw' },
                                { value: 'w-fit', label: 'Fit Content' },
                                { value: 'w-0', label: '0' },
                                { value: 'w-1', label: '4px' },
                                { value: 'w-2', label: '8px' },
                                { value: 'w-4', label: '16px' },
                                { value: 'w-8', label: '32px' },
                                { value: 'w-16', label: '64px' },
                                { value: 'w-32', label: '128px' },
                                { value: 'w-64', label: '256px' },
                                { value: 'w-1/2', label: '50%' },
                                { value: 'w-1/3', label: '33.33%' },
                                { value: 'w-2/3', label: '66.67%' },
                                { value: 'w-1/4', label: '25%' },
                                { value: 'w-3/4', label: '75%' }
                            ]}
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-neutral-400 mb-1">Height</label>
                        <Select
                            value={currentState.height || ''}
                            onChange={(value) => updateProperty('height', value, activeStateTab)}
                            options={[
                                { value: 'h-auto', label: 'Auto' },
                                { value: 'h-full', label: '100%' },
                                { value: 'h-screen', label: '100vh' },
                                { value: 'h-fit', label: 'Fit Content' },
                                { value: 'h-0', label: '0' },
                                { value: 'h-1', label: '4px' },
                                { value: 'h-2', label: '8px' },
                                { value: 'h-4', label: '16px' },
                                { value: 'h-8', label: '32px' },
                                { value: 'h-16', label: '64px' },
                                { value: 'h-32', label: '128px' },
                                { value: 'h-64', label: '256px' }
                            ]}
                        />
                    </div>
                </div>
            </Section>

            {/* Spacing Section */}
            <Section title="Spacing" icon={Move} sectionKey="spacing">
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-xs text-neutral-400 mb-1">Padding</label>
                        <Select
                            value={currentState.padding || ''}
                            onChange={(value) => updateProperty('padding', value, activeStateTab)}
                            options={[
                                { value: 'p-0', label: '0' },
                                { value: 'p-1', label: '4px' },
                                { value: 'p-2', label: '8px' },
                                { value: 'p-3', label: '12px' },
                                { value: 'p-4', label: '16px' },
                                { value: 'p-6', label: '24px' },
                                { value: 'p-8', label: '32px' },
                                { value: 'p-12', label: '48px' }
                            ]}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-xs text-neutral-400 mb-1">Padding X</label>
                            <Select
                                value={currentState.paddingX || ''}
                                onChange={(value) => updateProperty('paddingX', value, activeStateTab)}
                                options={[
                                    { value: 'px-0', label: '0' },
                                    { value: 'px-1', label: '4px' },
                                    { value: 'px-2', label: '8px' },
                                    { value: 'px-3', label: '12px' },
                                    { value: 'px-4', label: '16px' },
                                    { value: 'px-6', label: '24px' },
                                    { value: 'px-8', label: '32px' }
                                ]}
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-neutral-400 mb-1">Padding Y</label>
                            <Select
                                value={currentState.paddingY || ''}
                                onChange={(value) => updateProperty('paddingY', value, activeStateTab)}
                                options={[
                                    { value: 'py-0', label: '0' },
                                    { value: 'py-1', label: '4px' },
                                    { value: 'py-2', label: '8px' },
                                    { value: 'py-3', label: '12px' },
                                    { value: 'py-4', label: '16px' },
                                    { value: 'py-6', label: '24px' },
                                    { value: 'py-8', label: '32px' }
                                ]}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs text-neutral-400 mb-1">Margin</label>
                        <Select
                            value={currentState.margin || ''}
                            onChange={(value) => updateProperty('margin', value, activeStateTab)}
                            options={[
                                { value: 'm-0', label: '0' },
                                { value: 'm-1', label: '4px' },
                                { value: 'm-2', label: '8px' },
                                { value: 'm-3', label: '12px' },
                                { value: 'm-4', label: '16px' },
                                { value: 'm-6', label: '24px' },
                                { value: 'm-8', label: '32px' },
                                { value: 'm-auto', label: 'Auto' }
                            ]}
                        />
                    </div>
                </div>
            </Section>

            {/* Typography Section */}
            <Section title="Typography" icon={Type} sectionKey="typography">
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-xs text-neutral-400 mb-1">Font Size</label>
                        <Select
                            value={currentState.fontSize || ''}
                            onChange={(value) => updateProperty('fontSize', value, activeStateTab)}
                            options={[
                                { value: 'text-xs', label: 'Extra Small' },
                                { value: 'text-sm', label: 'Small' },
                                { value: 'text-base', label: 'Base' },
                                { value: 'text-lg', label: 'Large' },
                                { value: 'text-xl', label: 'Extra Large' },
                                { value: 'text-2xl', label: '2XL' },
                                { value: 'text-3xl', label: '3XL' },
                                { value: 'text-4xl', label: '4XL' },
                                { value: 'text-5xl', label: '5XL' },
                                { value: 'text-6xl', label: '6XL' }
                            ]}
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-neutral-400 mb-1">Font Weight</label>
                        <Select
                            value={currentState.fontWeight || ''}
                            onChange={(value) => updateProperty('fontWeight', value, activeStateTab)}
                            options={[
                                { value: 'font-thin', label: 'Thin' },
                                { value: 'font-light', label: 'Light' },
                                { value: 'font-normal', label: 'Normal' },
                                { value: 'font-medium', label: 'Medium' },
                                { value: 'font-semibold', label: 'Semibold' },
                                { value: 'font-bold', label: 'Bold' },
                                { value: 'font-extrabold', label: 'Extra Bold' },
                                { value: 'font-black', label: 'Black' }
                            ]}
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-neutral-400 mb-1">Text Align</label>
                        <Select
                            value={currentState.textAlign || ''}
                            onChange={(value) => updateProperty('textAlign', value, activeStateTab)}
                            options={[
                                { value: 'text-left', label: 'Left' },
                                { value: 'text-center', label: 'Center' },
                                { value: 'text-right', label: 'Right' },
                                { value: 'text-justify', label: 'Justify' }
                            ]}
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-neutral-400 mb-1">Text Color</label>
                        <Select
                            value={currentState.textColor || ''}
                            onChange={(value) => updateProperty('textColor', value, activeStateTab)}
                            options={[
                                { value: 'text-black', label: 'Black' },
                                { value: 'text-white', label: 'White' },
                                { value: 'text-gray-50', label: 'Gray 50' },
                                { value: 'text-gray-100', label: 'Gray 100' },
                                { value: 'text-gray-200', label: 'Gray 200' },
                                { value: 'text-gray-300', label: 'Gray 300' },
                                { value: 'text-gray-400', label: 'Gray 400' },
                                { value: 'text-gray-500', label: 'Gray 500' },
                                { value: 'text-gray-600', label: 'Gray 600' },
                                { value: 'text-gray-700', label: 'Gray 700' },
                                { value: 'text-gray-800', label: 'Gray 800' },
                                { value: 'text-gray-900', label: 'Gray 900' },
                                { value: 'text-red-500', label: 'Red' },
                                { value: 'text-blue-500', label: 'Blue' },
                                { value: 'text-green-500', label: 'Green' },
                                { value: 'text-yellow-500', label: 'Yellow' },
                                { value: 'text-purple-500', label: 'Purple' },
                                { value: 'text-pink-500', label: 'Pink' }
                            ]}
                        />
                    </div>
                </div>
            </Section>

            {/* Background Section */}
            <Section title="Background" icon={Palette} sectionKey="background">
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-xs text-neutral-400 mb-1">Background Color</label>
                        <Select
                            value={currentState.backgroundColor || ''}
                            onChange={(value) => updateProperty('backgroundColor', value, activeStateTab)}
                            options={[
                                { value: 'bg-transparent', label: 'Transparent' },
                                { value: 'bg-black', label: 'Black' },
                                { value: 'bg-white', label: 'White' },
                                { value: 'bg-gray-50', label: 'Gray 50' },
                                { value: 'bg-gray-100', label: 'Gray 100' },
                                { value: 'bg-gray-200', label: 'Gray 200' },
                                { value: 'bg-gray-300', label: 'Gray 300' },
                                { value: 'bg-gray-400', label: 'Gray 400' },
                                { value: 'bg-gray-500', label: 'Gray 500' },
                                { value: 'bg-gray-600', label: 'Gray 600' },
                                { value: 'bg-gray-700', label: 'Gray 700' },
                                { value: 'bg-gray-800', label: 'Gray 800' },
                                { value: 'bg-gray-900', label: 'Gray 900' },
                                { value: 'bg-red-500', label: 'Red' },
                                { value: 'bg-blue-500', label: 'Blue' },
                                { value: 'bg-green-500', label: 'Green' },
                                { value: 'bg-yellow-500', label: 'Yellow' },
                                { value: 'bg-purple-500', label: 'Purple' },
                                { value: 'bg-pink-500', label: 'Pink' }
                            ]}
                        />
                    </div>
                </div>
            </Section>

            {/* Effects Section */}
            <Section title="Effects" icon={Zap} sectionKey="effects">
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-xs text-neutral-400 mb-1">Box Shadow</label>
                        <Select
                            value={currentState.boxShadow || ''}
                            onChange={(value) => updateProperty('boxShadow', value, activeStateTab)}
                            options={[
                                { value: 'shadow-none', label: 'None' },
                                { value: 'shadow-sm', label: 'Small' },
                                { value: 'shadow', label: 'Default' },
                                { value: 'shadow-md', label: 'Medium' },
                                { value: 'shadow-lg', label: 'Large' },
                                { value: 'shadow-xl', label: 'Extra Large' },
                                { value: 'shadow-2xl', label: '2XL' },
                                { value: 'shadow-inner', label: 'Inner' }
                            ]}
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-neutral-400 mb-1">Opacity</label>
                        <Select
                            value={currentState.opacity || ''}
                            onChange={(value) => updateProperty('opacity', value, activeStateTab)}
                            options={[
                                { value: 'opacity-0', label: '0%' },
                                { value: 'opacity-25', label: '25%' },
                                { value: 'opacity-50', label: '50%' },
                                { value: 'opacity-75', label: '75%' },
                                { value: 'opacity-100', label: '100%' }
                            ]}
                        />
                    </div>
                </div>
            </Section>

            {/* Borders Section */}
            <Section title="Borders" icon={Smartphone} sectionKey="borders">
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-xs text-neutral-400 mb-1">Border Width</label>
                        <Select
                            value={currentState.borderWidth || ''}
                            onChange={(value) => updateProperty('borderWidth', value, activeStateTab)}
                            options={[
                                { value: 'border-0', label: 'None' },
                                { value: 'border', label: '1px' },
                                { value: 'border-2', label: '2px' },
                                { value: 'border-4', label: '4px' },
                                { value: 'border-8', label: '8px' }
                            ]}
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-neutral-400 mb-1">Border Radius</label>
                        <Select
                            value={currentState.borderRadius || ''}
                            onChange={(value) => updateProperty('borderRadius', value, activeStateTab)}
                            options={[
                                { value: 'rounded-none', label: 'None' },
                                { value: 'rounded-sm', label: 'Small' },
                                { value: 'rounded', label: 'Default' },
                                { value: 'rounded-md', label: 'Medium' },
                                { value: 'rounded-lg', label: 'Large' },
                                { value: 'rounded-xl', label: 'Extra Large' },
                                { value: 'rounded-2xl', label: '2XL' },
                                { value: 'rounded-3xl', label: '3XL' },
                                { value: 'rounded-full', label: 'Full' }
                            ]}
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-neutral-400 mb-1">Border Color</label>
                        <Select
                            value={currentState.borderColor || ''}
                            onChange={(value) => updateProperty('borderColor', value, activeStateTab)}
                            options={[
                                { value: 'border-transparent', label: 'Transparent' },
                                { value: 'border-black', label: 'Black' },
                                { value: 'border-white', label: 'White' },
                                { value: 'border-gray-200', label: 'Gray 200' },
                                { value: 'border-gray-300', label: 'Gray 300' },
                                { value: 'border-gray-400', label: 'Gray 400' },
                                { value: 'border-gray-500', label: 'Gray 500' },
                                { value: 'border-red-500', label: 'Red' },
                                { value: 'border-blue-500', label: 'Blue' },
                                { value: 'border-green-500', label: 'Green' }
                            ]}
                        />
                    </div>
                </div>
            </Section>

            {/* Transform Section */}
            <Section title="Transform" icon={MousePointer} sectionKey="transform">
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-xs text-neutral-400 mb-1">Scale</label>
                        <Select
                            value={currentState.scale || ''}
                            onChange={(value) => updateProperty('scale', value, activeStateTab)}
                            options={[
                                { value: 'scale-0', label: '0%' },
                                { value: 'scale-50', label: '50%' },
                                { value: 'scale-75', label: '75%' },
                                { value: 'scale-90', label: '90%' },
                                { value: 'scale-95', label: '95%' },
                                { value: 'scale-100', label: '100%' },
                                { value: 'scale-105', label: '105%' },
                                { value: 'scale-110', label: '110%' },
                                { value: 'scale-125', label: '125%' },
                                { value: 'scale-150', label: '150%' }
                            ]}
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-neutral-400 mb-1">Rotate</label>
                        <Select
                            value={currentState.rotate || ''}
                            onChange={(value) => updateProperty('rotate', value, activeStateTab)}
                            options={[
                                { value: 'rotate-0', label: '0°' },
                                { value: 'rotate-1', label: '1°' },
                                { value: 'rotate-2', label: '2°' },
                                { value: 'rotate-3', label: '3°' },
                                { value: 'rotate-6', label: '6°' },
                                { value: 'rotate-12', label: '12°' },
                                { value: 'rotate-45', label: '45°' },
                                { value: 'rotate-90', label: '90°' },
                                { value: 'rotate-180', label: '180°' },
                                { value: '-rotate-180', label: '-180°' },
                                { value: '-rotate-90', label: '-90°' },
                                { value: '-rotate-45', label: '-45°' }
                            ]}
                        />
                    </div>
                </div>
            </Section>

            {/* Custom Classes Section */}
            <Section title="Custom Classes" icon={Plus} sectionKey="custom">
                <div className="grid grid-cols-2 gap-2">
                    <div className="flex gap-1">
                        <Input
                            value={customClass}
                            onChange={setCustomClass}
                            placeholder="Add custom class..."
                        />
                        <button
                            onClick={addCustomClass}
                            disabled={!customClass.trim()}
                            className="px-2 py-1 bg-blue-600 text-white rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
                        >
                            <Plus size={12} />
                        </button>
                    </div>

                    {preservedClasses.length > 0 && (
                        <div className="space-y-1">
                            <label className="block text-xs text-neutral-400">Current Custom Classes:</label>
                            {preservedClasses.map((cls, index) => (
                                <div key={index} className="flex items-center justify-between bg-neutral-900 rounded px-2 py-1">
                                    <span className="text-xs font-mono text-neutral-300">{cls}</span>
                                    <button
                                        onClick={() => removePreservedClass(index)}
                                        className="p-0.5 text-neutral-400 hover:text-red-400"
                                    >
                                        <X size={10} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Section>
        </div>
    );
};

export default FigmaTailwindEditor;