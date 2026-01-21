/**
 * @fileoverview Single assignment form component for creating individual task assignments
 * @module components/SingleAssignmentForm
 */

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UserPlus } from 'lucide-react';
import { createAssignment } from '../api/assignmentsApi';
import { usersApi } from '../api/usersApi';
import { ModalIcon } from './ModalIcon';
import './Modal.css';
import './SingleAssignmentForm.css';

interface SingleAssignmentFormProps {
    onClose: () => void;
    onSuccess?: () => void;
}

interface Task {
    id: string;
    name: string;
    projectId?: string;
    projectName?: string;
}

/**
 * @description Form component for creating a single task assignment
 * @param {SingleAssignmentFormProps} props - Component props
 * @returns {React.JSX.Element} Single assignment form component
 */
export function SingleAssignmentForm({ onClose, onSuccess }: SingleAssignmentFormProps): React.JSX.Element {
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [selectedTaskId, setSelectedTaskId] = useState<string>('');
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [submitError, setSubmitError] = useState<string | null>(null);
    const queryClient = useQueryClient();

    // Fetch users
    const { data: usersData } = useQuery({
        queryKey: ['users'],
        queryFn: () => usersApi.getUsers({ page: 1, pageSize: 100 }),
    });

    // Fetch tasks (placeholder - you'll need to implement this API)
    const { data: tasks = [] } = useQuery<Task[]>({
        queryKey: ['tasks'],
        queryFn: async () => {
            // TODO: Implement tasks API
            return [];
        },
    });

    // Create assignment mutation
    const createMutation = useMutation({
        mutationFn: createAssignment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assignments'] });
            alert('ההקצאה נוצרה בהצלחה!');
            onSuccess?.();
            onClose();
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { error?: { message?: string; code?: string } } } };
            const errorCode = err.response?.data?.error?.code;
            const errorMessage = err.response?.data?.error?.message;

            // Handle duplicate assignment error
            if (errorCode === 'VALIDATION_DUPLICATE_ASSIGNMENT') {
                setSubmitError('הקצאה זו כבר קיימת במערכת');
            } else {
                setSubmitError(errorMessage || 'שגיאה ביצירת הקצאה');
            }
        },
    });

    /**
     * @description Get unique projects from tasks
     */
    const projects = Array.from(
        new Set(
            tasks
                .filter((task: Task) => task.projectId && task.projectName)
                .map((task: Task) => JSON.stringify({ id: task.projectId, name: task.projectName }))
        )
    ).map((str: string) => JSON.parse(str) as { id: string; name: string });

    /**
     * @description Filter tasks by selected project
     */
    const filteredTasks = selectedProjectId
        ? tasks.filter((task: Task) => task.projectId === selectedProjectId)
        : tasks;

    /**
     * @description Handle form submission
     */
    function handleSubmit(e: React.FormEvent): void {
        e.preventDefault();

        if (!selectedUserId || !selectedTaskId) {
            setSubmitError('יש לבחור עובד ומשימה');
            return;
        }

        setSubmitError(null);
        createMutation.mutate({
            userId: selectedUserId,
            taskId: selectedTaskId,
        });
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal single-assignment-form" onClick={(e) => e.stopPropagation()}>
                <div className="modal__header">
                    <div className="modal__title-wrapper">
                        <ModalIcon icon={UserPlus} />
                        <h2 className="modal__title">הקצאת משימה לעובד</h2>
                    </div>
                    <button
                        className="modal__close"
                        onClick={onClose}
                        type="button"
                        aria-label="סגור"
                        disabled={createMutation.isPending}
                    >
                        ×
                    </button>
                </div>

                <div className="modal__body">
                    <form onSubmit={handleSubmit} className="single-assignment-form__form">
                        {submitError && (
                            <div className="single-assignment-form__error" role="alert">
                                {submitError}
                            </div>
                        )}

                        {/* User Selector */}
                        <div className="single-assignment-form__field">
                            <label htmlFor="user-select" className="single-assignment-form__label">
                                בחר עובד <span className="single-assignment-form__required">*</span>
                            </label>
                            <select
                                id="user-select"
                                value={selectedUserId}
                                onChange={(e) => setSelectedUserId(e.target.value)}
                                className="single-assignment-form__select"
                                disabled={createMutation.isPending}
                            >
                                <option value="">-- בחר עובד --</option>
                                {usersData?.users.map((user: { id: string; fullName: string }) => (
                                    <option key={user.id} value={user.id}>
                                        {user.fullName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Project Filter (Optional) */}
                        {projects.length > 0 && (
                            <div className="single-assignment-form__field">
                                <label htmlFor="project-filter" className="single-assignment-form__label">
                                    סנן לפי פרויקט (אופציונלי)
                                </label>
                                <select
                                    id="project-filter"
                                    value={selectedProjectId}
                                    onChange={(e) => {
                                        setSelectedProjectId(e.target.value);
                                        setSelectedTaskId(''); // Reset task selection
                                    }}
                                    className="single-assignment-form__select"
                                    disabled={createMutation.isPending}
                                >
                                    <option value="">כל הפרויקטים</option>
                                    {projects.map((project: { id: string; name: string }) => (
                                        <option key={project.id} value={project.id}>
                                            {project.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Task Selector */}
                        <div className="single-assignment-form__field">
                            <label htmlFor="task-select" className="single-assignment-form__label">
                                בחר משימה <span className="single-assignment-form__required">*</span>
                            </label>
                            <select
                                id="task-select"
                                value={selectedTaskId}
                                onChange={(e) => setSelectedTaskId(e.target.value)}
                                className="single-assignment-form__select"
                                disabled={createMutation.isPending}
                            >
                                <option value="">-- בחר משימה --</option>
                                {filteredTasks.map((task: Task) => (
                                    <option key={task.id} value={task.id}>
                                        {task.name}
                                        {task.projectName && ` (${task.projectName})`}
                                    </option>
                                ))}
                            </select>
                            {selectedProjectId && filteredTasks.length === 0 && (
                                <p className="single-assignment-form__hint">
                                    לא נמצאו משימות בפרויקט זה
                                </p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="single-assignment-form__actions">
                            <button
                                type="button"
                                className="single-assignment-form__button single-assignment-form__button--secondary"
                                onClick={onClose}
                                disabled={createMutation.isPending}
                            >
                                ביטול
                            </button>
                            <button
                                type="submit"
                                className="single-assignment-form__button single-assignment-form__button--primary"
                                disabled={createMutation.isPending || !selectedUserId || !selectedTaskId}
                            >
                                {createMutation.isPending ? 'יוצר הקצאה...' : 'צור הקצאה'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
