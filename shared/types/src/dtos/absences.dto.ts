import { AbsenceType } from '../enums/absenceType.enum';
import { AbsenceStatus } from '../enums/absenceStatus.enum';
import type { PaginationDto } from './timeReports.dto';

export interface AbsenceDayDto {
    id: string;
    absenceRequestId: string;
    userId: string;
    workDate: string;
    minutes: number;
    createdAt: string;
}

export interface AbsenceDocumentDto {
    id: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    uploadedByUserId: string;
    uploadedAt: string;
}

export interface AbsenceRequestDto {
    id: string;
    userId: string;
    type: AbsenceType;
    startDate: string;
    endDate: string;
    isHalfDay: boolean;
    status: AbsenceStatus;
    note?: string;
    documents: AbsenceDocumentDto[];
    absenceDays: AbsenceDayDto[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateAbsenceRequestDto {
    type: AbsenceType;
    startDate: string;
    endDate: string;
    isHalfDay: boolean;
    note?: string;
}

export interface UpdateAbsenceRequestDto {
    type?: AbsenceType;
    startDate?: string;
    endDate?: string;
    isHalfDay?: boolean;
    note?: string;
}

export interface CreateAbsenceResponseDto {
    success: boolean;
    data: AbsenceRequestDto;
}

export interface UpdateAbsenceResponseDto {
    success: boolean;
    data: AbsenceRequestDto;
}

export interface DeleteAbsenceResponseDto {
    success: boolean;
    message: string;
}

export type { PaginationDto };

export interface ListAbsencesResponseDto {
    success: boolean;
    data: {
        items: AbsenceRequestDto[];
        pagination: PaginationDto;
    };
}

export interface UploadAbsenceDocumentResponseDto {
    success: boolean;
    data: {
        id: string;
        fileName: string;
        url: string;
    };
}

export interface ListAbsenceDocumentsResponseDto {
    success: boolean;
    data: AbsenceDocumentDto[];
}
