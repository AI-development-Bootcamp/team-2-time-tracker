/**
 * @fileoverview Select/Dropdown component using Radix Select
 * @module ui/Select
 */

import * as SelectPrimitive from '@radix-ui/react-select';
import './Select.css';

export interface SelectOption {
    /** Option value */
    value: string;
    /** Display label */
    label: string;
    /** Optional emoji icon */
    emoji?: string;
    /** Whether option is disabled */
    disabled?: boolean;
}

interface SelectProps {
    /** Label text */
    label?: string;
    /** Placeholder text */
    placeholder?: string;
    /** Available options */
    options: SelectOption[];
    /** Currently selected value */
    value?: string;
    /** Callback when selection changes */
    onChange: (value: string) => void;
    /** Whether the select is disabled */
    disabled?: boolean;
    /** Error message */
    error?: string;
    /** Custom class name */
    className?: string;
}

/**
 * Select component
 * @description A dropdown select component with RTL and emoji support
 * @param props - Select properties
 * @returns Select element
 * @example
 * <Select
 *   label="סוג העדרות"
 *   placeholder="בחר סוג העדרות"
 *   options={[
 *     { value: 'vacation-half', label: 'חופשה - חצי יום', emoji: '🏖️' },
 *     { value: 'vacation-full', label: 'חופשה - יום מלא', emoji: '🏖️' },
 *     { value: 'sick', label: 'מחלה', emoji: '😷' },
 *     { value: 'reserves', label: 'מילואים', emoji: '🚨' },
 *   ]}
 *   value={selected}
 *   onChange={setSelected}
 * />
 */
export function Select({
    label,
    placeholder = 'בחר',
    options,
    value,
    onChange,
    disabled = false,
    error,
    className = '',
}: SelectProps) {
    const selectedOption = options.find((opt) => opt.value === value);

    const classNames = [
        'select',
        disabled && 'select--disabled',
        error && 'select--error',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div className={classNames}>
            {label && <label className="select__label">{label}</label>}
            <SelectPrimitive.Root value={value} onValueChange={onChange} disabled={disabled}>
                <SelectPrimitive.Trigger className="select__trigger" aria-label={label}>
                    <SelectPrimitive.Value placeholder={placeholder}>
                        {selectedOption && (
                            <span className="select__value">
                                {selectedOption.emoji && (
                                    <span className="select__emoji">{selectedOption.emoji}</span>
                                )}
                                {selectedOption.label}
                            </span>
                        )}
                    </SelectPrimitive.Value>
                    <SelectPrimitive.Icon className="select__icon">
                        <ChevronDownIcon />
                    </SelectPrimitive.Icon>
                </SelectPrimitive.Trigger>

                <SelectPrimitive.Portal>
                    <SelectPrimitive.Content
                        className="select__content"
                        position="popper"
                        sideOffset={4}
                    >
                        <SelectPrimitive.Viewport className="select__viewport">
                            {options.map((option) => (
                                <SelectPrimitive.Item
                                    key={option.value}
                                    value={option.value}
                                    disabled={option.disabled}
                                    className="select__item"
                                >
                                    <SelectPrimitive.ItemText>
                                        <span className="select__item-content">
                                            {option.emoji && (
                                                <span className="select__emoji">{option.emoji}</span>
                                            )}
                                            {option.label}
                                        </span>
                                    </SelectPrimitive.ItemText>
                                    <SelectPrimitive.ItemIndicator className="select__item-indicator">
                                        <CheckIcon />
                                    </SelectPrimitive.ItemIndicator>
                                </SelectPrimitive.Item>
                            ))}
                        </SelectPrimitive.Viewport>
                    </SelectPrimitive.Content>
                </SelectPrimitive.Portal>
            </SelectPrimitive.Root>
            {error && <span className="select__error">{error}</span>}
        </div>
    );
}

function ChevronDownIcon() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <path
                d="M4 6L8 10L12 6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <path
                d="M13.3333 4L6 11.3333L2.66667 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export type { SelectProps };
