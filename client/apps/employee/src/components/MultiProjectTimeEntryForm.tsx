import React, { useState, useEffect } from 'react';
import { selectorsApi } from '@client/api-client';
import { ClientSelectorDto, ProjectSelectorDto, TaskSelectorDto, WorkLocation, CreateTimeEntryInput, TimeEntryDto } from '@shared/types';
import { Dialog, Button } from '@client/ui';
import './MultiProjectTimeEntryForm.css';

interface ProjectEntryForm {
    id: string;
    projectId: string;
    taskId: string;
    location: WorkLocation;
    description: string;
}

interface MultiProjectTimeEntryFormProps {
    initialData?: TimeEntryDto | null;
    defaultDate?: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: CreateTimeEntryInput) => Promise<void>;
}

export const MultiProjectTimeEntryForm: React.FC<MultiProjectTimeEntryFormProps> = ({
    initialData,
    defaultDate,
    open,
    onOpenChange,
    onSubmit,
}) => {
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

    const resetForm = () => {
        setProjectForms([{ id: '1', projectId: '', taskId: '', location: WorkLocation.OFFICE, description: '' }]);
        setStartTime('09:00');
        setEndTime('15:00');
        setError(null);
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
            }
        }
    }, [open, initialData, defaultDate]);

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
        const incompleteForms = projectForms.filter(f => !f.projectId || !f.taskId || !f.description || f.description.length < 10);
        if (incompleteForms.length > 0) {
            setError('נא למלא את כל השדות בכל הפרויקטים (כולל תיאור של לפחות 10 תווים)');
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

    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
            title="דיווח ידני"
            className="multi-project-form-dialog"
        >
            <div className="multi-project-form">
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
                        />
                    </div>
                    <div className="multi-project-form__field">
                        <label>שעת סיום</label>
                        <input
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
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
                        {isSubmitting ? 'שומר...' : 'סגירה'}
                    </Button>
                </div>
            </div>
        </Dialog>
    );
};
