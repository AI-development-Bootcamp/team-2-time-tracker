/**
 * @fileoverview Modal component for creating new projects
 * @module components/CreateProjectModal
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { ReportType, EntityStatus } from '@shared/types';
import { createProjectSchema, type CreateProjectFormData } from '../schemas/project.schema';
import { projectsApi } from '../api/projectsApi';
import { clientsApi } from '../api/clientsApi';
import { translateError } from '../utils/errorMessages';
import { ModalIcon } from './ModalIcon';
import './Modal.css';
import './CreateUserModal.css';

interface CreateProjectModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

interface ClientOption {
  id: string;
  name: string;
}

/**
 * @description Modal for creating a new project with form validation
 * @param {CreateProjectModalProps} props - Component props
 * @returns {React.ReactElement} Create project modal component
 */
export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: '',
      clientId: '',
      description: '',
      reportType: ReportType.TOTAL_HOURS,
      startDate: '',
      endDate: '',
    },
  });

  const name = watch('name');
  const clientId = watch('clientId');

  /**
   * @description Fetches active clients for the dropdown
   */
  useEffect(() => {
    async function fetchClients() {
      try {
        const clientsData = await clientsApi.getClients();
        const activeClients = clientsData
          .filter((client) => client.status === EntityStatus.ACTIVE)
          .sort((a, b) => a.name.localeCompare(b.name, 'he'));
        setClients(activeClients);
      } catch (error) {
        console.error('Failed to fetch clients:', error);
        setSubmitError('שגיאה בטעינת רשימת לקוחות');
      } finally {
        setIsLoadingClients(false);
      }
    }

    fetchClients();
  }, []);

  /**
   * @description Handles form submission
   * @param {CreateProjectFormData} data - Form data
   */
  async function onSubmit(data: CreateProjectFormData): Promise<void> {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const requestData = {
        name: data.name,
        clientId: data.clientId,
        description: data.description || undefined,
        reportType: data.reportType,
        startDate: data.startDate || null,
        endDate: data.endDate || null,
      };

      await projectsApi.createProject(requestData);
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
            <h2 className="modal__title">יצירת פרויקט חדש</h2>
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
                שם פרויקט <span className="user-form__required">*</span>
              </label>
              <input
                id="name"
                type="text"
                className={`user-form__input ${errors.name ? 'user-form__input--error' : ''}`}
                {...register('name')}
                disabled={isSubmitting}
                placeholder="הזן שם פרויקט"
              />
              {errors.name && (
                <span className="user-form__field-error">{errors.name.message}</span>
              )}
            </div>

            <div className="user-form__field">
              <label htmlFor="clientId" className="user-form__label">
                לקוח <span className="user-form__required">*</span>
              </label>
              <select
                id="clientId"
                className={`user-form__input ${errors.clientId ? 'user-form__input--error' : ''}`}
                {...register('clientId')}
                disabled={isSubmitting || isLoadingClients}
              >
                <option value="">בחר לקוח</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
              {errors.clientId && (
                <span className="user-form__field-error">{errors.clientId.message}</span>
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

            <fieldset className="user-form__field">
              <legend className="user-form__label">
                סוג דיווח <span className="user-form__required">*</span>
              </legend>
              <div style={{ display: 'flex', gap: '1rem', flexDirection: 'row' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', flexDirection: 'row-reverse' }}>
                  <span>סה״כ שעות</span>
                  <input
                    type="radio"
                    value={ReportType.TOTAL_HOURS}
                    {...register('reportType')}
                    disabled={isSubmitting}
                  />
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', flexDirection: 'row-reverse' }}>
                  <span>כניסה/יציאה</span>
                  <input
                    type="radio"
                    value={ReportType.ENTRY_EXIT}
                    {...register('reportType')}
                    disabled={isSubmitting}
                  />
                </label>
              </div>
            </fieldset>

            <div className="user-form__field">
              <label htmlFor="startDate" className="user-form__label">
                תאריך התחלה
              </label>
              <input
                id="startDate"
                type="date"
                className={`user-form__input ${errors.startDate ? 'user-form__input--error' : ''}`}
                {...register('startDate')}
                disabled={isSubmitting}
              />
              {errors.startDate && (
                <span className="user-form__field-error">{errors.startDate.message}</span>
              )}
            </div>

            <div className="user-form__field">
              <label htmlFor="endDate" className="user-form__label">
                תאריך סיום
              </label>
              <input
                id="endDate"
                type="date"
                className={`user-form__input ${errors.endDate ? 'user-form__input--error' : ''}`}
                {...register('endDate')}
                disabled={isSubmitting}
              />
              {errors.endDate && (
                <span className="user-form__field-error">{errors.endDate.message}</span>
              )}
            </div>

            <div className="user-form__actions user-form__actions--single">
              <button
                type="submit"
                className="user-form__button user-form__button--primary user-form__button--full"
                disabled={isSubmitting || !name?.trim() || !clientId}
              >
                <Plus size={20} strokeWidth={2.5} />
                <span>{isSubmitting ? 'יוצר פרויקט...' : 'צור פרויקט חדש'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
