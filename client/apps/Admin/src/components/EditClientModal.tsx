/**
 * @fileoverview Modal for editing a client
 * @module components/EditClientModal
 */

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getClient, updateClient } from '../api/entitiesApi';
import { ModalIcon } from './ModalIcon';
import { Briefcase } from 'lucide-react';
import './Modal.css';

interface EditClientModalProps {
    clientId: string;
    onClose: () => void;
}

interface EditClientFormValues {
    name: string;
}

export const EditClientModal: React.FC<EditClientModalProps> = ({ clientId, onClose }) => {
    const queryClient = useQueryClient();

    const { register, handleSubmit, reset, formState: { errors } } = useForm<EditClientFormValues>();

    // Fetch client details
    const { data: client, isLoading } = useQuery({
        queryKey: ['client', clientId],
        queryFn: () => getClient(clientId),
        enabled: !!clientId,
    });

    // Reset form when client data is loaded
    useEffect(() => {
        if (client) {
            reset({
                name: client.name,
            });
        }
    }, [client, reset]);

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: (data: EditClientFormValues) => updateClient(clientId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assignments'] }); // Refresh table
            queryClient.invalidateQueries({ queryKey: ['client', clientId] });
            onClose();
        },
        onError: (error: any) => {
            alert(error.response?.data?.message || 'שגיאה בעדכון הלקוח');
        },
    });

    const onSubmit = (data: EditClientFormValues) => {
        updateMutation.mutate(data);
    };

    if (!clientId) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal__header">
                    <div className="modal__title-wrapper">
                        <ModalIcon icon={Briefcase} />
                        <h2 className="modal__title">עריכת לקוח</h2>
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
                                <label className="form-label" htmlFor="name">שם לקוח</label>
                                <input
                                    id="name"
                                    className={`form-input ${errors.name ? 'form-input--error' : ''}`}
                                    {...register('name', { required: 'שם לקוח הוא שדה חובה' })}
                                />
                                {errors.name && <span className="form-error">{errors.name.message}</span>}
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
