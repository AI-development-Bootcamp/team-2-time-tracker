/**
 * @fileoverview Modal component for creating new tasks
 * @module components/CreateTaskModal
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();
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

  // Create task mutation with optimistic updates
  const createTaskMutation = useMutation({
    mutationFn: async (data: any) => {
      return tasksApi.createTask(data);
    },
    onMutate: async (newTaskData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['assignments'] });

      // Snapshot previous value
      const previousAssignments = queryClient.getQueryData(['assignments']);

      // Find the selected project info
      const selectedProject = projects.find(p => p.id === newTaskData.projectId);

      // Optimistically add new task to assignments
      if (selectedProject) {
        queryClient.setQueryData(['assignments'], (old: any) => {
          if (!old) return old;

          const optimisticAssignment = {
            id: `task-temp-${Date.now()}`,
            userId: null,
            taskId: `temp-${Date.now()}`,
            createdAt: new Date().toISOString(),
            userName: null,
            userEmail: null,
            taskName: newTaskData.name,
            projectId: newTaskData.projectId,
            projectName: selectedProject.name,
            clientId: null,
            clientName: selectedProject.clientName,
          };

          return [...old, optimisticAssignment];
        });
      }

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
  function onSubmit(data: CreateTaskFormData): void {
    setSubmitError(null);

    const requestData = {
      name: data.name,
      projectId: data.projectId,
      description: data.description || null,
      startDate: data.startDate || null,
      endDate: data.endDate || null,
    };

    createTaskMutation.mutate(requestData);
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
            disabled={createTaskMutation.isPending}
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
                disabled={createTaskMutation.isPending}
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
                disabled={createTaskMutation.isPending || isLoadingProjects}
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
                disabled={createTaskMutation.isPending}
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
                disabled={createTaskMutation.isPending}
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
                disabled={createTaskMutation.isPending}
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
                disabled={createTaskMutation.isPending || !name?.trim() || !projectId}
                isLoading={createTaskMutation.isPending}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
