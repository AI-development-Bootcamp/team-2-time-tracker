/**
 * @fileoverview Tabs component using Radix Tabs
 * @module ui/Tabs
 */

import React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import './Tabs.css';

export interface Tab {
    /** Tab value (unique identifier) */
    value: string;
    /** Tab label text */
    label: string;
    /** Tab content */
    content: React.ReactNode;
    /** Whether tab is disabled */
    disabled?: boolean;
}

interface TabsProps {
    /** Available tabs */
    tabs: Tab[];
    /** Currently active tab value */
    value?: string;
    /** Default active tab value */
    defaultValue?: string;
    /** Callback when active tab changes */
    onValueChange?: (value: string) => void;
    /** Custom class name */
    className?: string;
}

/**
 * Tabs component
 * @description A tabbed interface component with RTL support
 * @param props - Tabs properties
 * @returns Tabs element
 * @example
 * <Tabs
 *   defaultValue="work"
 *   tabs={[
 *     { value: 'work', label: 'דיווח עבודה', content: <WorkForm /> },
 *     { value: 'absence', label: 'דיווח העדרות', content: <AbsenceForm /> },
 *   ]}
 *   onValueChange={(value) => console.log(value)}
 * />
 */
export function Tabs({
    tabs,
    value,
    defaultValue,
    onValueChange,
    className = '',
}: TabsProps) {
    const classNames = ['tabs', className].filter(Boolean).join(' ');

    return (
        <TabsPrimitive.Root
            className={classNames}
            value={value}
            defaultValue={defaultValue || tabs[0]?.value}
            onValueChange={onValueChange}
        >
            <TabsPrimitive.List className="tabs__list" aria-label="בחר סוג דיווח">
                {tabs.map((tab) => (
                    <TabsPrimitive.Trigger
                        key={tab.value}
                        value={tab.value}
                        disabled={tab.disabled}
                        className="tabs__trigger"
                    >
                        {tab.label}
                    </TabsPrimitive.Trigger>
                ))}
            </TabsPrimitive.List>
            {tabs.map((tab) => (
                <TabsPrimitive.Content
                    key={tab.value}
                    value={tab.value}
                    className="tabs__content"
                >
                    {tab.content}
                </TabsPrimitive.Content>
            ))}
        </TabsPrimitive.Root>
    );
}

/** Standalone tab list for use in custom layouts */
interface TabListProps {
    /** Available tabs */
    tabs: { value: string; label: string; disabled?: boolean }[];
    /** Currently active tab value */
    value: string;
    /** Callback when tab changes */
    onChange: (value: string) => void;
    /** Custom class name */
    className?: string;
}

/**
 * TabList component
 * @description A standalone tab list for custom layouts
 * @param props - TabList properties
 * @returns TabList element
 */
export function TabList({ tabs, value, onChange, className = '' }: TabListProps) {
    const classNames = ['tabs__list', 'tabs__list--standalone', className]
        .filter(Boolean)
        .join(' ');

    return (
        <div className={classNames} role="tablist" aria-label="בחר סוג דיווח">
            {tabs.map((tab) => (
                <button
                    key={tab.value}
                    type="button"
                    role="tab"
                    aria-selected={value === tab.value}
                    aria-disabled={tab.disabled}
                    disabled={tab.disabled}
                    className={`tabs__trigger ${value === tab.value ? 'tabs__trigger--active' : ''}`}
                    onClick={() => onChange(tab.value)}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}

export type { TabsProps, TabListProps };
