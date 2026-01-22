/**
 * @fileoverview Modal component for creating new clients
 * @module components/CreateClientModal
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { createClientSchema, type CreateClientFormData } from '../schemas/client.schema';
import { clientsApi } from '../api/clientsApi';
import { translateError } from '../utils/errorMessages';
import { ModalIcon } from './ModalIcon';
import { FormActionButton } from './FormActionButton';
import './Modal.css';
import './CreateUserModal.css';

interface CreateClientModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * @description Modal for creating a new client with form validation
 * @param {CreateClientModalProps} props - Component props
 * @returns {React.ReactElement} Create client modal component
 */
export const CreateClientModal: React.FC<CreateClientModalProps> = ({ onClose, onSuccess }) => {
  const queryClient = useQueryClient();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateClientFormData>({
    resolver: zodResolver(createClientSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const name = watch('name');

  // Create client mutation with optimistic updates
  const createClientMutation = useMutation({
    mutationFn: async (data: any) => {
      return clientsApi.createClient(data);
    },
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['assignments'] });

      // Snapshot previous value
      const previousAssignments = queryClient.getQueryData(['assignments']);

      // Note: New clients won't immediately appear in assignments
      // (they need projects and tasks first), but we invalidate for consistency

      return { previousAssignments };
    },
    onError: (error: any, _, context) => {
      // Rollback on error
      if (context?.previousAssignments) {
        queryClient.setQueryData(['assignments'], context.previousAssignments);
      }
      const hebrewError = translateError(error);
      setSubmitError(hebrewError);
    },
    onSuccess: () => {
      onSuccess?.();
      onClose();
    },
    onSettled: () => {
      // Refetch to sync with server
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
    },
  });

  /**
   * @description Handles form submission
   * @param {CreateClientFormData} data - Form data
   */
  function onSubmit(data: CreateClientFormData): void {
    setSubmitError(null);

    const requestData = {
      name: data.name,
      description: data.description || undefined,
    };

    createClientMutation.mutate(requestData);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <div className="modal__title-wrapper">
            <ModalIcon icon={Plus} />
            <h2 className="modal__title">יצירת לקוח חדש</h2>
          </div>
          <button
            className="modal__close"
            onClick={onClose}
            type="button"
            aria-label="סגור"
            disabled={createClientMutation.isPending}
          >
            ×
          </button>
        </div>
        <div className="modal__body">
          <form onSubmit={handleSubmit(onSubmit)} className="user-form" noValidate>
            {submitError && (
              <div className="user-form__error" role="alert">
                {submitError}
              </div>
            )}

            <div className="user-form__field">
              <label htmlFor="name" className="user-form__label">
                שם לקוח <span className="user-form__required">*</span>
              </label>
              <input
                id="name"
                type="text"
                className={`user-form__input ${errors.name ? 'user-form__input--error' : ''}`}
                {...register('name')}
                disabled={createClientMutation.isPending}
                placeholder="הזן שם לקוח"
              />
              {errors.name && (
                <span className="user-form__field-error">{errors.name.message}</span>
              )}
            </div>

            <div className="user-form__field">
              <label htmlFor="description" className="user-form__label">
                תיאור
              </label>
              <textarea
                id="description"
                className={`user-form__input ${errors.description ? 'user-form__input--error' : ''}`}
                {...register('description')}
                disabled={createClientMutation.isPending}
                placeholder="הזן תיאור (אופציונלי)"
                rows={3}
              />
              {errors.description && (
                <span className="user-form__field-error">{errors.description.message}</span>
              )}
            </div>

            <div className="user-form__actions user-form__actions--single">
              <FormActionButton
                label="צור לקוח חדש"
                loadingLabel="יוצר לקוח..."
                icon={Plus}
                disabled={createClientMutation.isPending || !name?.trim()}
                isLoading={createClientMutation.isPending}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
