/**
 * @fileoverview Hebrew DatePicker component using react-day-picker
 * @module ui/DatePicker
 */

import { useState } from 'react';
import { DayPicker, DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import 'react-day-picker/style.css';
import './DatePicker.css';

/** Days of week for Israeli weekend (Friday=5, Saturday=6) */
const ISRAELI_WEEKEND_DAYS = [5, 6];

interface DatePickerBaseProps {
    /** Label text displayed above the input */
    label?: string;
    /** Placeholder text when no date selected */
    placeholder?: string;
    /** Whether the date picker is disabled */
    disabled?: boolean;
    /** Error message to display */
    error?: string;
    /** Disable weekend days (Friday-Saturday) */
    disableWeekends?: boolean;
    /** Custom class name */
    className?: string;
}

interface SingleDatePickerProps extends DatePickerBaseProps {
    /** Selection mode */
    mode: 'single';
    /** Selected date */
    value?: Date;
    /** Callback when date changes */
    onChange: (date: Date | undefined) => void;
}

interface RangeDatePickerProps extends DatePickerBaseProps {
    /** Selection mode */
    mode: 'range';
    /** Selected date range */
    value?: DateRange;
    /** Callback when date range changes */
    onChange: (range: DateRange | undefined) => void;
}

export type DatePickerProps = SingleDatePickerProps | RangeDatePickerProps;

/**
 * Hebrew DatePicker component
 * @description A date picker component with Hebrew locale and Israeli workweek support
 * @param props - DatePicker properties
 * @returns DatePicker element
 * @example
 * // Single date selection
 * <DatePicker
 *   mode="single"
 *   label="תאריך"
 *   value={selectedDate}
 *   onChange={setSelectedDate}
 *   disableWeekends
 * />
 *
 * // Date range selection
 * <DatePicker
 *   mode="range"
 *   label="טווח תאריכים"
 *   value={dateRange}
 *   onChange={setDateRange}
 *   disableWeekends
 * />
 */
export function DatePicker(props: DatePickerProps) {
    const {
        label,
        placeholder = 'בחר תאריך',
        disabled = false,
        error,
        disableWeekends = false,
        className = '',
        mode,
        value,
        onChange,
    } = props;

    const [isOpen, setIsOpen] = useState(false);

    const formatDisplayValue = (): string => {
        if (mode === 'single') {
            const date = value as Date | undefined;
            return date ? format(date, 'dd/MM/yy', { locale: he }) : '';
        } else {
            const range = value as DateRange | undefined;
            if (!range?.from) return '';
            if (!range.to) return format(range.from, 'dd/MM/yy', { locale: he });
            return `${format(range.from, 'dd/MM/yy', { locale: he })} - ${format(range.to, 'dd/MM/yy', { locale: he })}`;
        }
    };

    const isWeekendDay = (date: Date): boolean => {
        return ISRAELI_WEEKEND_DAYS.includes(date.getDay());
    };

    const handleSelect = (selected: Date | DateRange | undefined) => {
        if (mode === 'single') {
            (onChange as SingleDatePickerProps['onChange'])(selected as Date | undefined);
            setIsOpen(false);
        } else {
            (onChange as RangeDatePickerProps['onChange'])(selected as DateRange | undefined);
        }
    };

    const handleClear = () => {
        if (mode === 'single') {
            (onChange as SingleDatePickerProps['onChange'])(undefined);
        } else {
            (onChange as RangeDatePickerProps['onChange'])(undefined);
        }
    };

    const handleSave = () => {
        setIsOpen(false);
    };

    const classNames = [
        'date-picker',
        disabled && 'date-picker--disabled',
        error && 'date-picker--error',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div className={classNames}>
            {label && <label className="date-picker__label">{label}</label>}
            <button
                type="button"
                className="date-picker__trigger"
                onClick={() => !disabled && setIsOpen(true)}
                disabled={disabled}
                aria-expanded={isOpen}
                aria-haspopup="dialog"
            >
                <span className={formatDisplayValue() ? '' : 'date-picker__placeholder'}>
                    {formatDisplayValue() || placeholder}
                </span>
                <CalendarIcon />
            </button>
            {error && <span className="date-picker__error">{error}</span>}

            {isOpen && (
                <div className="date-picker__overlay" onClick={() => setIsOpen(false)}>
                    <div
                        className="date-picker__dropdown"
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-label="בחר תאריך"
                    >
                        {mode === 'single' ? (
                            <DayPicker
                                mode="single"
                                selected={value as Date | undefined}
                                onSelect={handleSelect as (date: Date | undefined) => void}
                                locale={he}
                                dir="rtl"
                                weekStartsOn={0}
                                disabled={disableWeekends ? isWeekendDay : undefined}
                                modifiers={{
                                    weekend: isWeekendDay,
                                }}
                                modifiersClassNames={{
                                    weekend: 'date-picker__day--weekend',
                                }}
                            />
                        ) : (
                            <DayPicker
                                mode="range"
                                selected={value as DateRange | undefined}
                                onSelect={handleSelect as (range: DateRange | undefined) => void}
                                locale={he}
                                dir="rtl"
                                weekStartsOn={0}
                                disabled={disableWeekends ? isWeekendDay : undefined}
                                modifiers={{
                                    weekend: isWeekendDay,
                                }}
                                modifiersClassNames={{
                                    weekend: 'date-picker__day--weekend',
                                }}
                            />
                        )}
                        {mode === 'range' && (
                            <div className="date-picker__actions">
                                <button
                                    type="button"
                                    className="date-picker__action date-picker__action--primary"
                                    onClick={handleSave}
                                >
                                    שמירה
                                </button>
                                <button
                                    type="button"
                                    className="date-picker__action date-picker__action--secondary"
                                    onClick={handleClear}
                                >
                                    נקה
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function CalendarIcon() {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <path
                d="M6.66667 1.66667V4.16667M13.3333 1.66667V4.16667M2.91667 7.57917H17.0833M17.5 7.08333V14.1667C17.5 16.6667 16.25 18.3333 13.3333 18.3333H6.66667C3.75 18.3333 2.5 16.6667 2.5 14.1667V7.08333C2.5 4.58333 3.75 2.91667 6.66667 2.91667H13.3333C16.25 2.91667 17.5 4.58333 17.5 7.08333Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M13.0791 11.4167H13.0866M13.0791 13.9167H13.0866M9.99579 11.4167H10.0033M9.99579 13.9167H10.0033M6.91162 11.4167H6.91912M6.91162 13.9167H6.91912"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export type { DateRange };
