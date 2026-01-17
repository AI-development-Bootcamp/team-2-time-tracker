import { WorkLocation } from '../enums/locationType.enum';

/**
 * Timer data transfer object
 */
export interface TimerDto {
    id: string;
    userId: string;
    workDate: string;
    startedAt: string;
    stoppedAt: string | null;
    durationMinutes: number | null;
    isRunning: boolean;
    createdAt: string;
    updatedAt: string;
}

/**
 * Request DTO for starting a timer
 */
export interface StartTimerRequestDto {
    workDate: string;
}

/**
 * Response DTO for starting a timer
 */
export interface StartTimerResponseDto {
    success: boolean;
    data: {
        id: string;
        startedAt: string;
    };
}

/**
 * Request DTO for stopping a timer
 */
export interface StopTimerRequestDto {
    taskId: string;
    location: WorkLocation;
    description: string;
}

/**
 * Time entry with task info (used in stop timer response)
 */
export interface TimeEntryDto {
    id: string;
    workDate: string;
    startTime: string;
    endTime: string;
    durationMinutes: number;
    location: WorkLocation;
    description: string;
    source: 'MANUAL' | 'TIMER';
    task: {
        id: string;
        name: string;
        project: {
            id: string;
            name: string;
        };
        client: {
            id: string;
            name: string;
        };
    };
}

/**
 * Response DTO for stopping a timer
 */
export interface StopTimerResponseDto {
    success: boolean;
    data: TimeEntryDto;
}

/**
 * Response DTO for timer status
 */
export interface TimerStatusResponseDto {
    success: boolean;
    data: {
        isRunning: boolean;
        elapsedMinutes: number | null;
        timer: TimerDto | null;
    };
}

/**
 * Response DTO for cancelling a timer
 */
export interface CancelTimerResponseDto {
    success: boolean;
    message: string;
}
