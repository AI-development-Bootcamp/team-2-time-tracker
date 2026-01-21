import { z } from 'zod';

export const createTaskSchema = z.object({
    name: z.string().trim()
        .min(1, 'שם משימה הוא שדה חובה')
        .max(100, 'שם משימה לא יכול להכיל יותר מ-100 תווים'),
    projectId: z.string().min(1, 'פרויקט הוא שדה חובה'),
    description: z.string().trim()
        .max(250, 'תיאור לא יכול להכיל יותר מ-250 תווים')
        .optional()
        .or(z.literal('')),
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

export type CreateTaskFormData = z.infer<typeof createTaskSchema>;
