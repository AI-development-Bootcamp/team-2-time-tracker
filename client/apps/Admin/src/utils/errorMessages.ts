/**
 * @fileoverview Error message translation utility
 * @module utils/errorMessages
 */

import { AxiosError } from 'axios';

/**
 * @description Map of English error messages to Hebrew translations
 */
const ERROR_MESSAGES: Record<string, string> = {
    // Authentication errors
    'Invalid credentials': 'שם משתמש או סיסמה שגויים',
    'User not found': 'משתמש לא נמצא',
    'Unauthorized': 'אין הרשאה לבצע פעולה זו',
    'Token expired': 'פג תוקף ההתחברות, נא להתחבר מחדש',
    'Invalid token': 'אסימון לא תקין',

    // User errors
    'Email already exists': 'כתובת האימייל כבר קיימת במערכת',
    'User already exists': 'משתמש כבר קיים במערכת',
    'Invalid email format': 'כתובת אימייל לא תקינה',
    'Password too weak': 'הסיסמה חלשה מדי',
    'User is not active': 'משתמש לא פעיל',

    // Validation errors
    'Validation failed': 'שגיאת תקינות בנתונים',
    'Required field': 'שדה חובה',
    'Invalid data': 'נתונים לא תקינים',
    'Invalid request': 'בקשה לא תקינה',

    // General errors
    'Bad Request': 'בקשה שגויה',
    'Internal Server Error': 'שגיאת שרת פנימית',
    'Service Unavailable': 'השירות אינו זמין כרגע',
    'Network Error': 'שגיאת רשת, נא לבדוק את החיבור לאינטרנט',
    'Request timeout': 'תם הזמן המוקצב לבקשה',

    // Default
    'default': 'אירעה שגיאה, נא לנסות שוב',
};

/**
 * @description Extracts error message from various error formats
 * @param {unknown} error - Error object
 * @returns {string} Extracted error message
 */
function extractErrorMessage(error: unknown): string {
    if (!error) return ERROR_MESSAGES.default;

    // Axios error
    if (error instanceof AxiosError) {
        // Check response data for error message
        const responseData = error.response?.data;

        if (responseData) {
            // Check for error.message pattern
            if (responseData.error?.message) {
                return responseData.error.message;
            }

            // Check for message pattern
            if (responseData.message) {
                return responseData.message;
            }

            // Check for error string pattern
            if (typeof responseData.error === 'string') {
                return responseData.error;
            }
        }

        // Use Axios error message
        if (error.message) {
            return error.message;
        }
    }

    // Regular Error object
    if (error instanceof Error) {
        return error.message;
    }

    // String error
    if (typeof error === 'string') {
        return error;
    }

    // Unknown error format
    return ERROR_MESSAGES.default;
}

/**
 * @description Translates English error messages to Hebrew
 * @param {unknown} error - Error object from API or validation
 * @returns {string} Hebrew error message
 * @example
 * const hebrewError = translateError(axiosError);
 * // Returns: "כתובת האימייל כבר קיימת במערכת"
 */
export function translateError(error: unknown): string {
    const errorMessage = extractErrorMessage(error);

    // Remove "Request failed with status code XXX" prefix
    const cleanMessage = errorMessage.replace(/^Request failed with status code \d+[:\s]*/i, '');

    // Try to find exact match in translations
    if (ERROR_MESSAGES[cleanMessage]) {
        return ERROR_MESSAGES[cleanMessage];
    }

    // Try to find partial match
    for (const [englishMsg, hebrewMsg] of Object.entries(ERROR_MESSAGES)) {
        if (cleanMessage.toLowerCase().includes(englishMsg.toLowerCase())) {
            return hebrewMsg;
        }
    }

    // If message is already in Hebrew (contains Hebrew characters), return as-is
    if (/[\u0590-\u05FF]/.test(cleanMessage)) {
        return cleanMessage;
    }

    // Return default error message
    return ERROR_MESSAGES.default;
}

/**
 * @description Checks if an error is a network error
 * @param {unknown} error - Error object
 * @returns {boolean} True if network error
 */
export function isNetworkError(error: unknown): boolean {
    if (error instanceof AxiosError) {
        return !error.response && error.code === 'ERR_NETWORK';
    }
    return false;
}

/**
 * @description Checks if an error is an authentication error (401/403)
 * @param {unknown} error - Error object
 * @returns {boolean} True if auth error
 */
export function isAuthError(error: unknown): boolean {
    if (error instanceof AxiosError) {
        return error.response?.status === 401 || error.response?.status === 403;
    }
    return false;
}
