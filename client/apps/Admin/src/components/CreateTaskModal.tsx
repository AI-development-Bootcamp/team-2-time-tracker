/**
 * @fileoverview Modal component for creating new tasks
 * @module components/CreateTaskModal
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { createTaskSchema, type CreateTaskFormData } from '../schemas/task.schema';
import { tasksApi } from '../api/tasksApi';
import { projectsApi } from '../api/projectsApi';
import { translateError } from '../utils/errorMessages';
import { ModalIcon } from './ModalIcon';
import { FormActionButton } from './FormActionButton';
import './Modal.css';
import './CreateUserModal.css';

interface CreateTaskModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

interface ProjectOption {
  id: string;
  name: string;
  clientName: string;
}

/**
 * @description Modal for creating a new task with form validation
 * @param {CreateTaskModalProps} props - Component props
 * @returns {React.ReactElement} Create task modal component
 */
export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      name: '',
      projectId: '',
      description: '',
      startDate: '',
      endDate: '',
    },
  });

  const name = watch('name');
  const projectId = watch('projectId');

  /**
   * @description Fetches active projects for the dropdown
   */
  useEffect(() => {
    async function fetchProjects() {
      try {
        const projectsData = await projectsApi.getProjects();
        const activeProjects = projectsData
          .filter((project) => project.status === 'ACTIVE')
          .map((project) => ({
            id: project.id,
            name: project.name,
            clientName: project.client?.name || 'ללא לקוח',
          }))
          .sort((a, b) => a.name.localeCompare(b.name, 'he'));
        setProjects(activeProjects);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
        setSubmitError('שגיאה בטעינת רשימת פרויקטים');
      } finally {
        setIsLoadingProjects(false);
      }
    }

    fetchProjects();
  }, []);

  /**
   * @description Handles form submission
   * @param {CreateTaskFormData} data - Form data
   */
  async function onSubmit(data: CreateTaskFormData): Promise<void> {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const requestData = {
        name: data.name,
        projectId: data.projectId,
        description: data.description || null,
        startDate: data.startDate || null,
        endDate: data.endDate || null,
      };

      await tasksApi.createTask(requestData);
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
            <h2 className="modal__title">יצירת משימה חדשה</h2>
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
                שם המשימה <span className="user-form__required">*</span>
              </label>
              <input
                id="name"
                type="text"
                className={`user-form__input ${errors.name ? 'user-form__input--error' : ''}`}
                {...register('name')}
                disabled={isSubmitting}
                placeholder="הזן שם משימה"
              />
              {errors.name && (
                <span className="user-form__field-error">{errors.name.message}</span>
              )}
            </div>

            <div className="user-form__field">
              <label htmlFor="projectId" className="user-form__label">
                שייך לפרויקט לקוח <span className="user-form__required">*</span>
              </label>
              <select
                id="projectId"
                className={`user-form__input ${errors.projectId ? 'user-form__input--error' : ''}`}
                {...register('projectId')}
                disabled={isSubmitting || isLoadingProjects}
              >
                <option value="">בחר פרויקט</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name} ({project.clientName})
                  </option>
                ))}
              </select>
              {errors.projectId && (
                <span className="user-form__field-error">{errors.projectId.message}</span>
              )}
            </div>

            <div className="user-form__field">
              <label htmlFor="description" className="user-form__label">
                תיאור המשימה
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
              <FormActionButton
                label="צור משימה"
                loadingLabel="יוצר משימה..."
                icon={Plus}
                disabled={isSubmitting || !name?.trim() || !projectId}
                isLoading={isSubmitting}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
