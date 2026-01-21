/**
 * @fileoverview Modal for editing a task
 * @module components/EditTaskModal
 */

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTask, updateTask } from '../api/entitiesApi';
import { ModalIcon } from './ModalIcon';
import { CheckSquare } from 'lucide-react';
import './Modal.css';

interface EditTaskModalProps {
    taskId: string;
    onClose: () => void;
}

interface EditTaskFormValues {
    name: string;
    startDate: string;
    endDate: string;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({ taskId, onClose }) => {
    const queryClient = useQueryClient();

    const { register, handleSubmit, reset, formState: { errors } } = useForm<EditTaskFormValues>();

    // Fetch task details
    const { data: task, isLoading } = useQuery({
        queryKey: ['task', taskId],
        queryFn: () => getTask(taskId),
        enabled: !!taskId,
    });

    // Reset form when task data is loaded
    useEffect(() => {
        if (task) {
            reset({
                name: task.name,
                // Format dates to YYYY-MM-DD for input[type="date"]
                startDate: task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : '',
                endDate: task.endDate ? new Date(task.endDate).toISOString().split('T')[0] : '',
            });
        }
    }, [task, reset]);

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: (data: EditTaskFormValues) => updateTask(taskId, {
            ...data,
            // Convert empty strings to null for optional dates
            startDate: data.startDate || null,
            endDate: data.endDate || null,
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assignments'] });
            queryClient.invalidateQueries({ queryKey: ['task', taskId] });
            onClose();
        },
        onError: (error: any) => {
            alert(error.response?.data?.message || 'שגיאה בעדכון המשימה');
        },
    });

    const onSubmit = (data: EditTaskFormValues) => {
        updateMutation.mutate(data);
    };

    if (!taskId) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal__header">
                    <div className="modal__title-wrapper">
                        <ModalIcon icon={CheckSquare} />
                        <h2 className="modal__title">עריכת משימה</h2>
                    </div>
                    <button
                        className="modal__close"
                        onClick={onClose}
                        type="button"
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                <div className="modal__body">
                    {isLoading ? (
                        <p>טוען נתונים...</p>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="modal__form">
                            <div className="form-group">
                                <label className="form-label" htmlFor="name">שם משימה</label>
                                <input
                                    id="name"
                                    className={`form-input ${errors.name ? 'form-input--error' : ''}`}
                                    {...register('name', { required: 'שם משימה הוא שדה חובה' })}
                                />
                                {errors.name && <span className="form-error">{errors.name.message}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="startDate">תאריך התחלה</label>
                                <input
                                    id="startDate"
                                    type="date"
                                    className="form-input"
                                    {...register('startDate')}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="endDate">תאריך סיום</label>
                                <input
                                    id="endDate"
                                    type="date"
                                    className="form-input"
                                    {...register('endDate')}
                                />
                            </div>

                            <div className="modal__actions">
                                <button
                                    type="button"
                                    className="modal__btn modal__btn--secondary"
                                    onClick={onClose}
                                >
                                    ביטול
                                </button>
                                <button
                                    type="submit"
                                    className="modal__btn modal__btn--primary"
                                    disabled={updateMutation.isPending}
                                >
                                    {updateMutation.isPending ? 'שומר...' : 'שמור שינויים'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};
