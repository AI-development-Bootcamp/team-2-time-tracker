import { z } from 'zod';
import { ReportType } from '@shared/types';

export const createProjectSchema = z.object({
    name: z.string().trim()
        .min(1, 'שם פרויקט הוא שדה חובה')
        .max(100, 'שם פרויקט לא יכול להכיל יותר מ-100 תווים'),
    clientId: z.string().min(1, 'לקוח הוא שדה חובה'),
    description: z.string().trim()
        .max(250, 'תיאור לא יכול להכיל יותר מ-250 תווים')
        .optional()
        .or(z.literal('')),
    reportType: z.nativeEnum(ReportType),
    startDate: z.string().optional().or(z.literal('')),
    endDate: z.string().optional().or(z.literal('')),
}).refine(
    (data) => {
        if (data.startDate && data.endDate) {
            return new Date(data.endDate) >= new Date(data.startDate);
        }
        return true;
    },
    {
        message: 'תאריך סיום חייב להיות שווה או גדול מתאריך התחלה',
        path: ['endDate'],
    }
);

export type CreateProjectFormData = z.infer<typeof createProjectSchema>;
