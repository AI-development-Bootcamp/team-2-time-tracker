/**
 * @fileoverview Modal for editing a project
 * @module components/EditProjectModal
 */

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProject, updateProject } from '../api/entitiesApi';
import { ModalIcon } from './ModalIcon';
import { Folder } from 'lucide-react';
import './Modal.css';

interface EditProjectModalProps {
    projectId: string;
    onClose: () => void;
}

interface EditProjectFormValues {
    name: string;
    startDate: string;
    endDate: string;
}

export const EditProjectModal: React.FC<EditProjectModalProps> = ({ projectId, onClose }) => {
    const queryClient = useQueryClient();

    const { register, handleSubmit, reset, formState: { errors } } = useForm<EditProjectFormValues>();

    // Fetch project details
    const { data: project, isLoading } = useQuery({
        queryKey: ['project', projectId],
        queryFn: () => getProject(projectId),
        enabled: !!projectId,
    });

    // Reset form when project data is loaded
    useEffect(() => {
        if (project) {
            reset({
                name: project.name,
                // Format dates to YYYY-MM-DD for input[type="date"]
                startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
                endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
            });
        }
    }, [project, reset]);

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: (data: EditProjectFormValues) => updateProject(projectId, {
            ...data,
            // Convert empty strings to null for optional dates
            startDate: data.startDate || null,
            endDate: data.endDate || null,
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assignments'] });
            queryClient.invalidateQueries({ queryKey: ['project', projectId] });
            onClose();
        },
        onError: (error: any) => {
            alert(error.response?.data?.message || 'שגיאה בעדכון הפרויקט');
        },
    });

    const onSubmit = (data: EditProjectFormValues) => {
        updateMutation.mutate(data);
    };

    if (!projectId) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal__header">
                    <div className="modal__title-wrapper">
                        <ModalIcon icon={Folder} />
                        <h2 className="modal__title">עריכת פרויקט</h2>
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
                                <label className="form-label" htmlFor="name">שם פרויקט</label>
                                <input
                                    id="name"
                                    className={`form-input ${errors.name ? 'form-input--error' : ''}`}
                                    {...register('name', { required: 'שם פרויקט הוא שדה חובה' })}
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
