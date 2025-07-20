import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Input, Tag, AutoComplete, Space } from 'antd';
import { SearchOutlined, CloseOutlined } from '@ant-design/icons';

const TailwindClassInput = ({ value = '', onChange, placeholder = 'Search Tailwind classes...' }) => {
    const [inputValue, setInputValue] = useState('');
    const [focused, setFocused] = useState(false);

    // Parse selected classes from value prop
    const selectedClasses = useMemo(() => {
        return value ? value.split(' ').filter(Boolean) : [];
    }, [value]);

    // Comprehensive Tailwind classes (condensed for compactness)
    const tailwindClasses = {
        layout: ['block', 'inline-block', 'inline', 'flex', 'inline-flex', 'grid', 'inline-grid', 'contents', 'hidden'],
        flexbox: ['flex-row', 'flex-col', 'flex-wrap', 'flex-nowrap', 'flex-1', 'flex-auto', 'flex-initial', 'flex-none', 'justify-start', 'justify-end', 'justify-center', 'justify-between', 'justify-around', 'justify-evenly', 'items-start', 'items-end', 'items-center', 'items-baseline', 'items-stretch'],
        grid: ['grid-cols-1', 'grid-cols-2', 'grid-cols-3', 'grid-cols-4', 'grid-cols-5', 'grid-cols-6', 'grid-cols-12', 'col-span-1', 'col-span-2', 'col-span-3', 'col-span-4', 'col-span-6', 'col-span-12', 'col-span-full', 'gap-1', 'gap-2', 'gap-4', 'gap-6', 'gap-8'],
        spacing: ['m-0', 'm-1', 'm-2', 'm-3', 'm-4', 'm-6', 'm-8', 'm-12', 'm-16', 'm-auto', 'mx-auto', 'my-auto', 'p-0', 'p-1', 'p-2', 'p-3', 'p-4', 'p-6', 'p-8', 'p-12', 'px-2', 'px-4', 'px-6', 'px-8', 'py-2', 'py-4', 'py-6', 'py-8'],
        sizing: ['w-full', 'w-auto', 'w-1/2', 'w-1/3', 'w-2/3', 'w-1/4', 'w-3/4', 'w-fit', 'w-screen', 'h-full', 'h-auto', 'h-screen', 'h-fit', 'min-w-0', 'min-w-full', 'max-w-none', 'max-w-xs', 'max-w-sm', 'max-w-md', 'max-w-lg', 'max-w-xl', 'max-w-2xl', 'max-w-4xl', 'max-w-6xl', 'max-w-full'],
        typography: ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'font-light', 'font-normal', 'font-medium', 'font-semibold', 'font-bold', 'italic', 'uppercase', 'lowercase', 'capitalize', 'underline', 'line-through', 'no-underline', 'text-left', 'text-center', 'text-right', 'leading-tight', 'leading-normal', 'leading-relaxed'],
        colors: ['text-white', 'text-black', 'text-gray-100', 'text-gray-200', 'text-gray-300', 'text-gray-400', 'text-gray-500', 'text-gray-600', 'text-gray-700', 'text-gray-800', 'text-gray-900', 'text-red-500', 'text-blue-500', 'text-green-500', 'text-yellow-500', 'text-purple-500', 'text-pink-500', 'bg-white', 'bg-black', 'bg-transparent', 'bg-gray-50', 'bg-gray-100', 'bg-gray-200', 'bg-gray-800', 'bg-gray-900', 'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'],
        borders: ['border', 'border-0', 'border-2', 'border-4', 'border-t', 'border-r', 'border-b', 'border-l', 'rounded', 'rounded-sm', 'rounded-lg', 'rounded-lg', 'rounded-xl', 'rounded-full', 'border-solid', 'border-dashed', 'border-dotted', 'border-gray-200', 'border-gray-300', 'border-gray-400', 'border-gray-600'],
        effects: ['shadow', 'shadow-sm', 'shadow-md', 'shadow-lg', 'shadow-xl', 'shadow-none', 'opacity-0', 'opacity-25', 'opacity-50', 'opacity-75', 'opacity-100', 'hover:shadow-lg', 'transition-all', 'duration-200', 'duration-300', 'ease-in-out'],
        positioning: ['relative', 'absolute', 'fixed', 'sticky', 'static', 'top-0', 'right-0', 'bottom-0', 'left-0', 'inset-0', 'z-10', 'z-20', 'z-30', 'z-40', 'z-50'],
        interactivity: ['cursor-pointer', 'cursor-default', 'cursor-not-allowed', 'select-none', 'select-all', 'pointer-events-none', 'hover:bg-gray-100', 'hover:bg-gray-800', 'focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500']
    };

    const allClasses = Object.values(tailwindClasses).flat();

    const getCategoryForClass = (className) => {
        for (const [category, classes] of Object.entries(tailwindClasses)) {
            if (classes.includes(className)) {
                return category.charAt(0).toUpperCase() + category.slice(1);
            }
        }
        return 'Other';
    };

    // Filter classes based on input
    const filteredOptions = useMemo(() => {
        if (!inputValue.trim()) return [];

        const query = inputValue.toLowerCase().trim();
        return allClasses
            .filter(cls =>
                cls.toLowerCase().includes(query) &&
                !selectedClasses.includes(cls)
            )
            .slice(0, 8)
            .map(cls => ({
                value: cls,
                label: (
                    <div className="flex items-center justify-between py-1">
                        <span className="font-mono text-sm">{cls}</span>
                        <span className="text-xs px-2 py-0.5 bg-blue-600 text-white rounded">
                            {getCategoryForClass(cls)}
                        </span>
                    </div>
                )
            }));
    }, [inputValue, selectedClasses]);

    const getCategoryColor = (category) => {
        const colors = {
            layout: '#3b82f6',
            flexbox: '#8b5cf6',
            grid: '#6366f1',
            spacing: '#10b981',
            sizing: '#f59e0b',
            typography: '#ef4444',
            colors: '#ec4899',
            borders: '#f97316',
            effects: '#14b8a6',
            positioning: '#06b6d4',
            interactivity: '#6b7280'
        };
        return colors[category.toLowerCase()] || colors.interactivity;
    };

    const addClassToSelection = (className) => {
        if (!selectedClasses.includes(className)) {
            const newClasses = [...selectedClasses, className];
            onChange?.(newClasses.join(' '));
            setInputValue('');
        }
    };

    const removeClassFromSelection = (className) => {
        const newClasses = selectedClasses.filter(cls => cls !== className);
        onChange?.(newClasses.join(' '));
    };

    const handleInputChange = (val) => {
        setInputValue(val);
    };

    const handleSelect = (val) => {
        addClassToSelection(val);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Backspace' && !inputValue && selectedClasses.length > 0) {
            removeClassFromSelection(selectedClasses[selectedClasses.length - 1]);
        }
    };

    return (
        <div className="w-full">
            {}
            {selectedClasses.length > 0 && (
                <div className="mb-2 p-2  rounded border border-gray-700">
                    <Space size={[4, 4]} wrap>
                        {selectedClasses.map((className) => {
                            const category = getCategoryForClass(className).toLowerCase();
                            return (
                                <Tag
                                    key={className}
                                    closable
                                    onClose={() => removeClassFromSelection(className)}
                                    color={getCategoryColor(category)}
                                    className="text-xs font-mono m-0"
                                    style={{
                                        backgroundColor: getCategoryColor(category) + '20',
                                        borderColor: getCategoryColor(category),
                                        color: getCategoryColor(category)
                                    }}
                                >
                                    {className}
                                </Tag>
                            );
                        })}
                    </Space>
                </div>
            )}

            {}
            <AutoComplete
                value={inputValue}
                options={filteredOptions}
                onSelect={handleSelect}
                onChange={handleInputChange}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder={placeholder}
                allowClear
                className="w-full"
                popupClassName="dark-mode-autocomplete"
                style={{ width: '100%' }}
            >
                <Input
                    // prefix={<SearchOutlined className="text-gray-400" />}
                    onKeyDown={handleKeyDown}
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 hover:border-gray-500 focus:border-blue-500"
                    style={{
                        backgroundColor: '#1f2937',
                        borderColor: focused ? '#3b82f6' : '#4b5563',
                        color: '#fff'
                    }}
                />
            </AutoComplete>

            {}
            {selectedClasses.length > 0 && (
                <div className="mt-1 text-xs text-gray-400">
                    {selectedClasses.length} class{selectedClasses.length !== 1 ? 'es' : ''} selected
                </div>
            )}

            {}
            <style jsx global>{`

      `}</style>
        </div>
    );
};

export default TailwindClassInput;