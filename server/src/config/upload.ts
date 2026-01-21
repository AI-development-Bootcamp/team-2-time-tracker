import { fileConstraints } from './storage';

export const uploadConfig = {
    maxFileSize: fileConstraints.maxFileSize, // 10MB
    allowedMimeTypes: [...fileConstraints.allowedMimeTypes],
};

export const hebrewFileErrors = {
    FILE_TOO_LARGE: 'גודל הקובץ חורג מ-10MB',
    INVALID_FILE_TYPE: 'סוג קובץ לא נתמך. יש להעלות PDF, JPG או PNG',
    NO_FILE_UPLOADED: 'לא הועלה קובץ',
};
