export const formatDate = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('he-IL');
};

export const formatTime = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
};

export const getMonthString = (date: Date): string => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

/**
 * Check if a date is an Israeli workday (Sunday-Thursday)
 * Friday (5) and Saturday (6) are weekend days in Israel
 */
export const isIsraeliWorkday = (date: Date): boolean => {
    const dayOfWeek = date.getDay();
    return dayOfWeek >= 0 && dayOfWeek <= 4;
};

/**
 * Expand a date range to individual dates (all days, including weekends)
 */
export const expandDateRange = (startDate: Date, endDate: Date): Date[] => {
    const dates: Date[] = [];
    const current = new Date(startDate);
    current.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    while (current <= end) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }

    return dates;
};

/**
 * Get only workdays in a date range (excludes Friday and Saturday)
 */
export const getWorkdaysInRange = (startDate: Date, endDate: Date): Date[] => {
    return expandDateRange(startDate, endDate).filter(isIsraeliWorkday);
};

/**
 * Calculate the number of Israeli workdays between two dates (inclusive)
 */
export const calculateWorkdayCount = (startDate: Date, endDate: Date): number => {
    return getWorkdaysInRange(startDate, endDate).length;
};

/**
 * Format date in Hebrew format (DD/MM/YY)
 */
export const formatHebrewDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
};

/**
 * Format date with Hebrew month name (e.g., "נובמבר 2025")
 */
export const formatHebrewMonthYear = (date: Date): string => {
    return date.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' });
};

/**
 * Format day name in Hebrew (e.g., "יום א'")
 */
export const formatHebrewDayName = (date: Date): string => {
    const dayNames = ["יום א'", "יום ב'", "יום ג'", "יום ד'", "יום ה'", "יום ו'", "שבת"];
    return dayNames[date.getDay()];
};

/**
 * Parse date string in format YYYY-MM-DD to Date object
 */
export const parseISODate = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
};

/**
 * Format Date object to ISO date string (YYYY-MM-DD)
 */
export const toISODateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};
