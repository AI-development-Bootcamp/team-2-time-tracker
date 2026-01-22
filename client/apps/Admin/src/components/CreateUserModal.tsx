/**
 * @fileoverview Modal component for creating new users
 * @module components/CreateUserModal
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { UserRole } from '@shared/types';
import { createUserSchema, type CreateUserFormData } from '../schemas/user.schema';
import { usersApi } from '../api/usersApi';
import { translateError } from '../utils/errorMessages';
import { ModalIcon } from './ModalIcon';
import { FormActionButton } from './FormActionButton';
import './Modal.css';
import './CreateUserModal.css';

interface CreateUserModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * @description Modal for creating a new user with form validation
 * @param {CreateUserModalProps} props - Component props
 * @returns {React.ReactElement} Create user modal component
 */
export const CreateUserModal: React.FC<CreateUserModalProps> = ({ onClose, onSuccess }) => {
  const queryClient = useQueryClient();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: UserRole.EMPLOYEE,
    },
  });

  const firstName = watch('firstName');
  const lastName = watch('lastName');
  const email = watch('email');
  const password = watch('password');

  const isFormValid = firstName?.trim() && lastName?.trim() && email?.trim() && password?.trim();

  // Create user mutation with optimistic updates
  const createUserMutation = useMutation({
    mutationFn: async (data: any) => {
      return usersApi.createUser(data);
    },
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['assignments'] });

      // Snapshot previous value
      const previousAssignments = queryClient.getQueryData(['assignments']);

      // Note: New users won't immediately appear in assignments
      // (they need to be assigned to tasks first), but we invalidate for consistency

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
   * @param {CreateUserFormData} data - Form data
   */
  function onSubmit(data: CreateUserFormData): void {
    setSubmitError(null);

    // Combine firstName and lastName into fullName for the API
    const requestData = {
      fullName: `${data.firstName} ${data.lastName}`,
      email: data.email,
      password: data.password,
      role: data.role,
    };

    createUserMutation.mutate(requestData);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <div className="modal__title-wrapper">
            <ModalIcon icon={Plus} />
            <h2 className="modal__title">יצירת משתמש חדש</h2>
          </div>
          <button
            className="modal__close"
            onClick={onClose}
            type="button"
            aria-label="סגור"
            disabled={createUserMutation.isPending}
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
              <label htmlFor="firstName" className="user-form__label">
                שם פרטי <span className="user-form__required">*</span>
              </label>
              <input
                id="firstName"
                type="text"
                className={`user-form__input ${errors.firstName ? 'user-form__input--error' : ''}`}
                {...register('firstName')}
                disabled={createUserMutation.isPending}
                placeholder="הזן שם פרטי"
              />
              {errors.firstName && (
                <span className="user-form__field-error">{errors.firstName.message}</span>
              )}
            </div>

            <div className="user-form__field">
              <label htmlFor="lastName" className="user-form__label">
                שם משפחה <span className="user-form__required">*</span>
              </label>
              <input
                id="lastName"
                type="text"
                className={`user-form__input ${errors.lastName ? 'user-form__input--error' : ''}`}
                {...register('lastName')}
                disabled={createUserMutation.isPending}
                placeholder="הזן שם משפחה"
              />
              {errors.lastName && (
                <span className="user-form__field-error">{errors.lastName.message}</span>
              )}
            </div>

            <div className="user-form__field">
              <label htmlFor="email" className="user-form__label">
                כתובת אימייל <span className="user-form__required">*</span>
              </label>
              <input
                id="email"
                type="email"
                className={`user-form__input ${errors.email ? 'user-form__input--error' : ''}`}
                {...register('email')}
                disabled={createUserMutation.isPending}
                placeholder="user@example.com"
                dir="ltr"
              />
              {errors.email && (
                <span className="user-form__field-error">{errors.email.message}</span>
              )}
            </div>

            <div className="user-form__field">
              <label htmlFor="password" className="user-form__label">
                סיסמה <span className="user-form__required">*</span>
              </label>
              <input
                id="password"
                type="password"
                className={`user-form__input ${errors.password ? 'user-form__input--error' : ''}`}
                {...register('password')}
                disabled={createUserMutation.isPending}
                placeholder="לפחות 8 תווים עם אות גדולה, קטנה וספרה"
                dir="ltr"
              />
              {errors.password && (
                <span className="user-form__field-error">{errors.password.message}</span>
              )}
              <span className="user-form__hint">
                המשתמש יידרש לשנות סיסמה בכניסה הראשונה
              </span>
            </div>

            <div className="user-form__field">
              <label htmlFor="role" className="user-form__label">
                תפקיד <span className="user-form__required">*</span>
              </label>
              <select
                id="role"
                className={`user-form__select ${errors.role ? 'user-form__select--error' : ''}`}
                {...register('role')}
                disabled={createUserMutation.isPending}
              >
                <option value={UserRole.EMPLOYEE}>עובד</option>
                <option value={UserRole.ADMIN}>מנהל</option>
              </select>
              {errors.role && (
                <span className="user-form__field-error">{errors.role.message}</span>
              )}
            </div>

            <div className="user-form__actions user-form__actions--single">
              <FormActionButton
                label="צור משתמש חדש"
                loadingLabel="יוצר משתמש..."
                icon={Plus}
                disabled={createUserMutation.isPending || !isFormValid}
                isLoading={createUserMutation.isPending}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
