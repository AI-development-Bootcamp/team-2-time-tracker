/**
 * @fileoverview Modal component for creating new clients
 * @module components/CreateClientModal
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { createClientSchema, type CreateClientFormData } from '../schemas/client.schema';
import { clientsApi } from '../api/clientsApi';
import { translateError } from '../utils/errorMessages';
import { ModalIcon } from './ModalIcon';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  /**
   * @description Handles form submission
   * @param {CreateClientFormData} data - Form data
   */
  async function onSubmit(data: CreateClientFormData): Promise<void> {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const requestData = {
        name: data.name,
        description: data.description || undefined,
      };

      await clientsApi.createClient(requestData);
      onSuccess?.();
      onClose();
    } catch (error) {
      const hebrewError = translateError(error);
      setSubmitError(hebrewError);
    } finally {
      setIsSubmitting(false);
    }
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
            disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
                placeholder="הזן תיאור (אופציונלי)"
                rows={3}
              />
              {errors.description && (
                <span className="user-form__field-error">{errors.description.message}</span>
              )}
            </div>

            <div className="user-form__actions user-form__actions--single">
              <button
                type="submit"
                className="user-form__button user-form__button--primary user-form__button--full"
                disabled={isSubmitting || !name?.trim()}
              >
                <Plus size={20} strokeWidth={2.5} />
                <span>{isSubmitting ? 'יוצר לקוח...' : 'צור לקוח חדש'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
