/**
 * @fileoverview MultiProjectTimeEntryForm Component
 * 
 * A comprehensive form for creating daily time reports. 
 * Supports both:
 * 1. Manual Entry: Editing normal daily reports.
 * 2. Timer Stop Protocol: Finalizing a tracked session (via "Stop Timer").
 * 
 * Features:
 * - Multi-Project Support: Allows adding multiple project entries for a single time block.
 * - Dynamic Data Loading: Fetches Clients, Projects, and Tasks on open.
 * - Contextual Modes:
 *   - "Locked" Mode: When stopping a timer, start/end times are fixed.
 *   - "Manual" Mode: User can freely edit all fields.
 */

import React, { useState, useEffect } from 'react';
import { selectorsApi } from '@client/api-client';
import { ClientSelectorDto, ProjectSelectorDto, TaskSelectorDto, WorkLocation, CreateTimeEntryInput, TimeEntryDto, AbsenceType, CreateAbsenceRequestDto } from '@shared/types';
import { Dialog, Button, AbsenceForm, AbsenceFormData, TabList, useToast } from '@client/ui';
import { useCreateAbsence, useUploadDocument } from '../api/absencesApi';
import './MultiProjectTimeEntryForm.css';

/**
 * Local state interface for a single project entry row
 */
interface ProjectEntryForm {
    id: string;
    projectId: string;
    taskId: string;
    location: WorkLocation;
    description: string;
}

/**
 * Component Props
 */
interface MultiProjectTimeEntryFormProps {
    /** Existing entry data for editing mode */
    initialData?: TimeEntryDto | null;
    /** Default date to pre-fill (YYYY-MM-DD) */
    defaultDate?: string;
    /** Pre-filled start time (HH:MM) */
    initialStartTime?: string;
    /** Pre-filled end time (HH:MM) */
    initialEndTime?: string;
    /** If true, locks the time input fields (used for Stop Timer flow) */
    isTimeLocked?: boolean;
    /** Controls modal visibility */
    open: boolean;
    /** Handler for changing modal open state */
    onOpenChange: (open: boolean) => void;
    /** Submission handler - called once per project entry */
    onSubmit: (data: CreateTimeEntryInput) => Promise<void>;

    /** Callback fired when an absence is successfully submitted */
    onAbsenceSubmitSuccess?: () => void;
}

/**
 * MultiProjectTimeEntryForm Component
 * 
 * @param {MultiProjectTimeEntryFormProps} props
 */
export const MultiProjectTimeEntryForm: React.FC<MultiProjectTimeEntryFormProps> = ({
    initialData,
    defaultDate,
    initialStartTime,
    initialEndTime,
    isTimeLocked = false,
    open,
    onOpenChange,
    onSubmit,
    onAbsenceSubmitSuccess,
}) => {
    // Dialog mode: 'time-entry' or 'absence'
    const [dialogMode, setDialogMode] = useState<'time-entry' | 'absence'>('time-entry');

    const [currentDate, setCurrentDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('15:00');
    const [projectForms, setProjectForms] = useState<ProjectEntryForm[]>([
        { id: '1', projectId: '', taskId: '', location: WorkLocation.OFFICE, description: '' }
    ]);

    // All data loaded once
    const [clients, setClients] = useState<ClientSelectorDto[]>([]);
    const [allProjects, setAllProjects] = useState<ProjectSelectorDto[]>([]);
    const [allTasks, setAllTasks] = useState<TaskSelectorDto[]>([]);

    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Absence-specific state
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [absenceError, setAbsenceError] = useState<string | null>(null);

    const toast = useToast();

    // Setup absence mutations
    const createAbsenceMutation = useCreateAbsence({
        onSuccess: (absence) => {
            console.log('Absence created:', absence);
        },
        onError: (error) => {
            const errorMessage = typeof error === 'string' ? error : 'שגיאה בשמירת הדיווח';
            setAbsenceError(errorMessage);
            toast.error(errorMessage);
        },
    });

    const uploadDocumentMutation = useUploadDocument({
        onProgress: (progress) => {
            setUploadProgress(progress);
        },
        onSuccess: (document) => {
            console.log('Document uploaded:', document);
        },
        onError: (error) => {
            const errorMessage = typeof error === 'string' ? error : 'שגיאה בהעלאת המסמך';
            toast.error(errorMessage);
        },
    });

    const resetForm = () => {
        setProjectForms([{ id: '1', projectId: '', taskId: '', location: WorkLocation.OFFICE, description: '' }]);
        setStartTime('09:00');
        setEndTime('15:00');
        setError(null);
        setAbsenceError(null);
        setUploadProgress(0);
        setIsUploading(false);
    };

    // Fetch all data when modal opens
    useEffect(() => {
        if (open) {
            fetchAllData();

            // Set date
            if (initialData?.workDate) {
                setCurrentDate(initialData.workDate);
            } else if (defaultDate) {
                setCurrentDate(defaultDate);
            } else {
                setCurrentDate(new Date().toISOString().split('T')[0]);
            }

            if (initialData) {
                // Populate form for editing
                setStartTime(initialData.startTime);
                setEndTime(initialData.endTime);

                // Safe access to project ID
                const projectId = initialData.task.project?.id || '';

                setProjectForms([{
                    id: '1',
                    projectId: projectId,
                    taskId: initialData.task.id,
                    location: initialData.location,
                    description: initialData.description || ''
                }]);
            } else {
                resetForm();
                // Apply initial times if provided
                if (initialStartTime) setStartTime(initialStartTime);
                if (initialEndTime) setEndTime(initialEndTime);
            }
        }
    }, [open, initialData, defaultDate, initialStartTime, initialEndTime]);

    const fetchAllData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [clientsData, projectsData, tasksData] = await Promise.all([
                selectorsApi.getClients(),
                selectorsApi.getProjects(), // Get all projects
                selectorsApi.getTasks(), // Get all tasks
            ]);
            setClients(clientsData);
            setAllProjects(projectsData);
            setAllTasks(tasksData);
        } catch (err) {
            console.error('Failed to fetch data:', err);
            setError('שגיאה בטעינת נתונים');
        } finally {
            setLoading(false);
        }
    };

    const getAvailableProjects = (currentFormId: string): ProjectSelectorDto[] => {
        const selectedProjectIds = projectForms
            .filter(f => f.id !== currentFormId && f.projectId)
            .map(f => f.projectId);

        return allProjects.filter(p => !selectedProjectIds.includes(p.id));
    };

    const getTasksForProject = (projectId: string): TaskSelectorDto[] => {
        return allTasks.filter(t => t.projectId === projectId);
    };

    const getClientForProject = (projectId: string): ClientSelectorDto | undefined => {
        const project = allProjects.find(p => p.id === projectId);
        if (!project) return undefined;
        return clients.find(c => c.id === project.clientId);
    };

    const handleProjectChange = (formId: string, projectId: string) => {
        setProjectForms(forms => forms.map(f =>
            f.id === formId
                ? { ...f, projectId, taskId: '' } // Reset task when project changes
                : f
        ));
    };

    const handleTaskChange = (formId: string, taskId: string) => {
        setProjectForms(forms => forms.map(f =>
            f.id === formId
                ? { ...f, taskId }
                : f
        ));
    };

    const handleLocationChange = (formId: string, location: WorkLocation) => {
        setProjectForms(forms => forms.map(f =>
            f.id === formId
                ? { ...f, location }
                : f
        ));
    };

    const handleDescriptionChange = (formId: string, description: string) => {
        setProjectForms(forms => forms.map(f =>
            f.id === formId
                ? { ...f, description }
                : f
        ));
    };

    const handleAddProjectForm = () => {
        const newId = (Math.max(...projectForms.map(f => parseInt(f.id))) + 1).toString();
        setProjectForms([...projectForms, {
            id: newId,
            projectId: '',
            taskId: '',
            location: WorkLocation.OFFICE,
            description: ''
        }]);
    };

    const handleRemoveForm = (formId: string) => {
        if (projectForms.length === 1) return; // Keep at least one form
        setProjectForms(forms => forms.filter(f => f.id !== formId));
    };

    const handleSubmit = async () => {
        // Validate all forms are complete
        const incompleteForms = projectForms.filter(f => !f.projectId || !f.taskId || !f.description);
        if (incompleteForms.length > 0) {
            setError('נא למלא את כל השדות בכל הפרויקטים (כולל תיאור עבודה)');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            // Submit each project as a separate time entry
            for (const form of projectForms) {
                const entryData: CreateTimeEntryInput = {
                    workDate: currentDate,
                    startTime,
                    endTime,
                    location: form.location,
                    taskId: form.taskId,
                    description: form.description,
                };
                await onSubmit(entryData);
            }

            onOpenChange(false);
            resetForm();
        } catch (err: any) {
            console.error('Failed to submit:', err);
            setError(err.message || 'שגיאה בשמירת הדיווח');
        } finally {
            setIsSubmitting(false);
        }
    };

    /**
     * Handle absence form submission
     */
    const handleAbsenceSubmit = async (data: AbsenceFormData, file?: File) => {
        setIsSubmitting(true);
        setAbsenceError(null);

        try {
            // Map form data to API DTO
            const absenceData = mapAbsenceFormDataToDto(data);

            // Create absence request
            const createdAbsence = await createAbsenceMutation.mutateAsync(absenceData);

            // If file is provided, upload it
            let fileUploadSuccess = true;
            if (file && createdAbsence.id) {
                try {
                    setIsUploading(true);
                    await uploadDocumentMutation.mutateAsync({
                        absenceId: createdAbsence.id,
                        file,
                    });
                } catch (uploadErr) {
                    // File upload failed, but absence was created
                    fileUploadSuccess = false;
                    const errorMessage = typeof uploadErr === 'string' ? uploadErr : 'שגיאה בהעלאת הקובץ';
                    console.error('Error uploading file:', uploadErr);

                    // Show warning that absence was saved but file upload failed
                    toast.warning(`הדיווח נשמר, אך העלאת הקובץ נכשלה: ${errorMessage}`);
                }
            }

            // Success - show notification and close dialog
            if (fileUploadSuccess) {
                toast.success('הדיווח נשמר בהצלחה!');
            }

            // Notify parent about success
            if (onAbsenceSubmitSuccess) {
                onAbsenceSubmitSuccess();
            }

            // Close dialog and reset form
            setTimeout(() => {
                onOpenChange(false);
                resetForm();
            }, 1500);
        } catch (err) {
            // Error handling is done in mutation callbacks
            console.error('Error submitting absence:', err);
        } finally {
            setIsSubmitting(false);
            setIsUploading(false);
        }
    };

    /**
     * Maps AbsenceFormData to CreateAbsenceRequestDto
     */
    const mapAbsenceFormDataToDto = (data: AbsenceFormData): CreateAbsenceRequestDto => {
        // Determine absence type and isHalfDay
        let type: AbsenceType = AbsenceType.VACATION;
        let isHalfDay = false;

        if (data.absenceType) {
            if (data.absenceType === 'VACATION_HALF') {
                type = AbsenceType.VACATION;
                isHalfDay = true;
            } else if (data.absenceType === 'VACATION_FULL') {
                type = AbsenceType.VACATION;
                isHalfDay = false;
            } else if (data.absenceType === 'SICK') {
                type = AbsenceType.SICK;
                isHalfDay = false;
            } else if (data.absenceType === 'RESERVES') {
                type = AbsenceType.RESERVES;
                isHalfDay = false;
            }
        }

        // Format dates as YYYY-MM-DD (backend expects this format)
        const formatDate = (date: Date): string => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        // Handle single date mode
        if (data.dateMode === 'single' && data.singleDate) {
            return {
                type,
                startDate: formatDate(data.singleDate),
                endDate: formatDate(data.singleDate),
                isHalfDay,
                note: data.note,
            };
        }

        // Handle range mode
        if (data.dateMode === 'range' && data.dateRange?.from && data.dateRange?.to) {
            return {
                type,
                startDate: formatDate(data.dateRange.from),
                endDate: formatDate(data.dateRange.to),
                isHalfDay: false, // Range mode is never half day
                note: data.note,
            };
        }

        throw new Error('Invalid absence form data');
    };

    if (loading) {
        return (
            <Dialog
                open={open}
                onOpenChange={onOpenChange}
                title="דיווח ידני"
                className="multi-project-form-dialog"
            >
                <div className="multi-project-form__loading">טוען נתונים...</div>
            </Dialog>
        );
    }

    // Tab configuration
    const dialogTabs = [
        { value: 'time-entry', label: 'דיווח שעות' },
        { value: 'absence', label: 'דיווח היעדרות' },
    ];

    // Determine dialog title based on mode
    const getDialogTitle = () => {
        if (dialogMode === 'absence') {
            return 'דיווח היעדרות';
        }
        return isTimeLocked ? "עצירת שעון ודיווח" : "דיווח ידני";
    };

    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
            title={getDialogTitle()}
            className="multi-project-form-dialog"
        >
            <div className="multi-project-form">
                {/* Tab Switcher */}
                <div className="multi-project-form__tabs">
                    <TabList
                        tabs={dialogTabs}
                        value={dialogMode}
                        onChange={(value) => setDialogMode(value as 'time-entry' | 'absence')}
                    />
                </div>

                {/* Time Entry Mode Content */}
                {dialogMode === 'time-entry' && (
                    <>
                        {/* Date display */}
                        <div className="multi-project-form__date">
                            {new Date(currentDate).toLocaleDateString('he-IL', {
                                weekday: 'long',
                                day: '2-digit',
                                month: '2-digit',
                                year: '2-digit'
                            })}
                        </div>

                        {/* Project forms */}
                        <div className="multi-project-form__entries">
                            <h3 className="multi-project-form__section-title">דיווחי פרוייקטים</h3>

                            {projectForms.map((form) => {
                                const availableProjects = getAvailableProjects(form.id);
                                const tasks = form.projectId ? getTasksForProject(form.projectId) : [];
                                const client = form.projectId ? getClientForProject(form.projectId) : undefined;
                                const project = allProjects.find(p => p.id === form.projectId);

                                return (
                                    <div key={form.id} className="multi-project-form__entry">
                                        {projectForms.length > 1 && (
                                            <button
                                                className="multi-project-form__entry-remove"
                                                onClick={() => handleRemoveForm(form.id)}
                                                type="button"
                                            >
                                                ×
                                            </button>
                                        )}

                                        {/* Breadcrumb */}
                                        {client && project && (
                                            <div className="multi-project-form__breadcrumb">
                                                {client.name} → {project.name}
                                            </div>
                                        )}

                                        {/* Project selector */}
                                        <div className="multi-project-form__field">
                                            <label>פרויקט</label>
                                            <select
                                                value={form.projectId}
                                                onChange={(e) => handleProjectChange(form.id, e.target.value)}
                                            >
                                                <option value="">בחר פרויקט...</option>
                                                {availableProjects.map(project => {
                                                    const projectClient = clients.find(c => c.id === project.clientId);
                                                    return (
                                                        <option key={project.id} value={project.id}>
                                                            {projectClient?.name} - {project.name}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                        </div>

                                        {/* Task selector */}
                                        <div className="multi-project-form__field">
                                            <label>משימה</label>
                                            <select
                                                value={form.taskId}
                                                onChange={(e) => handleTaskChange(form.id, e.target.value)}
                                                disabled={!form.projectId}
                                            >
                                                <option value="">בחר משימה...</option>
                                                {tasks.map(task => (
                                                    <option key={task.id} value={task.id}>
                                                        {task.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Location selector */}
                                        <div className="multi-project-form__field">
                                            <label>מיקום</label>
                                            <select
                                                value={form.location}
                                                onChange={(e) => handleLocationChange(form.id, e.target.value as WorkLocation)}
                                            >
                                                <option value={WorkLocation.OFFICE}>משרד</option>
                                                <option value={WorkLocation.CLIENT}>לקוח</option>
                                                <option value={WorkLocation.HOME}>בית</option>
                                            </select>
                                        </div>

                                        {/* Description field */}
                                        <div className="multi-project-form__field">
                                            <label>תיאור עבודה</label>
                                            <textarea
                                                value={form.description}
                                                onChange={(e) => handleDescriptionChange(form.id, e.target.value)}
                                                placeholder="תאר את העבודה שביצעת..."
                                                rows={3}
                                            />
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Add project button */}
                            <Button
                                variant="secondary"
                                onClick={handleAddProjectForm}
                                type="button"
                            >
                                + הוספת פרוייקט
                            </Button>
                        </div>

                        {/* Time fields */}
                        <div className="multi-project-form__time-fields">
                            <div className="multi-project-form__field">
                                <label>שעת התחלה</label>
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    disabled={isTimeLocked}
                                    style={isTimeLocked ? { backgroundColor: '#f3f4f6', cursor: 'not-allowed' } : {}}
                                />
                            </div>
                            <div className="multi-project-form__field">
                                <label>שעת סיום</label>
                                <input
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    disabled={isTimeLocked}
                                    style={isTimeLocked ? { backgroundColor: '#f3f4f6', cursor: 'not-allowed' } : {}}
                                />
                            </div>
                        </div>

                        {/* Error message */}
                        {error && (
                            <div className="multi-project-form__error">
                                {error}
                            </div>
                        )}

                        {/* Submit button */}
                        <div className="multi-project-form__actions">
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                type="button"
                            >
                                {isSubmitting ? 'שומר...' : 'שמירה'}
                            </Button>
                        </div>
                    </>
                )}

                {/* Absence Mode Content */}
                {dialogMode === 'absence' && (
                    <div className="multi-project-form__absence-wrapper">
                        <AbsenceForm
                            onSubmit={handleAbsenceSubmit}
                            isLoading={isSubmitting}
                            error={absenceError || undefined}
                            uploadProgress={uploadProgress}
                            isUploading={isUploading}
                            defaultValues={{ dateMode: 'single' }}
                        />
                    </div>
                )}
            </div>
        </Dialog>
    );
};
