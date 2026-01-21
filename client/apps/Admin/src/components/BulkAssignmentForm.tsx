/**
 * @fileoverview Bulk assignment form component for creating multiple task assignments
 * @module components/BulkAssignmentForm
 */

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Users } from 'lucide-react';
import { calculateCartesianProduct } from '@shared/types';
import { bulkCreateAssignments } from '../api/assignmentsApi';
import { usersApi } from '../api/usersApi';
import { ModalIcon } from './ModalIcon';
import './Modal.css';
import './BulkAssignmentForm.css';

interface BulkAssignmentFormProps {
    onClose: () => void;
    onSuccess?: () => void;
}

interface Task {
    id: string;
    name: string;
}

/**
 * @description Form component for creating bulk task assignments using cartesian product
 * @param {BulkAssignmentFormProps} props - Component props
 * @returns {React.JSX.Element} Bulk assignment form component
 */
export function BulkAssignmentForm({ onClose, onSuccess }: BulkAssignmentFormProps): React.JSX.Element {
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
    const [showConfirmation, setShowConfirmation] = useState(false);
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
            // For now, return empty array
            return [];
        },
    });

    // Bulk create mutation
    const bulkCreateMutation = useMutation({
        mutationFn: bulkCreateAssignments,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['assignments'] });
            alert(`נוצרו בהצלחה ${data.count} הקצאות חדשות!`);
            onSuccess?.();
            onClose();
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { error?: { message?: string } } } };
            const message = err.response?.data?.error?.message || 'שגיאה ביצירת הקצאות';
            setSubmitError(message);
            setShowConfirmation(false);
        },
    });

    /**
     * @description Calculate preview count using cartesian product
     */
    const previewCount = selectedUserIds.length > 0 && selectedTaskIds.length > 0
        ? calculateCartesianProduct(selectedUserIds, selectedTaskIds).length
        : 0;

    /**
     * @description Handle user selection toggle
     */
    function toggleUser(userId: string): void {
        setSelectedUserIds(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    }

    /**
     * @description Handle task selection toggle
     */
    function toggleTask(taskId: string): void {
        setSelectedTaskIds(prev =>
            prev.includes(taskId)
                ? prev.filter(id => id !== taskId)
                : [...prev, taskId]
        );
    }

    /**
     * @description Handle form submission
     */
    function handleSubmit(e: React.FormEvent): void {
        e.preventDefault();

        if (selectedUserIds.length === 0 || selectedTaskIds.length === 0) {
            setSubmitError('יש לבחור לפחות עובד אחד ומשימה אחת');
            return;
        }

        setSubmitError(null);
        setShowConfirmation(true);
    }

    /**
     * @description Confirm and execute bulk creation
     */
    function confirmBulkCreate(): void {
        bulkCreateMutation.mutate({
            userIds: selectedUserIds,
            taskIds: selectedTaskIds,
        });
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal bulk-assignment-form" onClick={(e) => e.stopPropagation()}>
                <div className="modal__header">
                    <div className="modal__title-wrapper">
                        <ModalIcon icon={Users} />
                        <h2 className="modal__title">הקצאה קבוצתית של משימות</h2>
                    </div>
                    <button
                        className="modal__close"
                        onClick={onClose}
                        type="button"
                        aria-label="סגור"
                        disabled={bulkCreateMutation.isPending}
                    >
                        ×
                    </button>
                </div>

                <div className="modal__body">
                    {!showConfirmation ? (
                        <form onSubmit={handleSubmit} className="bulk-assignment-form__form">
                            {submitError && (
                                <div className="bulk-assignment-form__error" role="alert">
                                    {submitError}
                                </div>
                            )}

                            {/* Users Multi-Select */}
                            <div className="bulk-assignment-form__section">
                                <label className="bulk-assignment-form__label">
                                    בחר עובדים <span className="bulk-assignment-form__required">*</span>
                                </label>
                                <div className="bulk-assignment-form__multi-select">
                                    {usersData?.users.map((user: { id: string; fullName: string }) => (
                                        <label key={user.id} className="bulk-assignment-form__checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={selectedUserIds.includes(user.id)}
                                                onChange={() => toggleUser(user.id)}
                                                className="bulk-assignment-form__checkbox"
                                            />
                                            <span>{user.fullName}</span>
                                        </label>
                                    ))}
                                    {(!usersData?.users || usersData.users.length === 0) && (
                                        <p className="bulk-assignment-form__empty">לא נמצאו עובדים</p>
                                    )}
                                </div>
                                <p className="bulk-assignment-form__hint">
                                    נבחרו {selectedUserIds.length} עובדים
                                </p>
                            </div>

                            {/* Tasks Multi-Select */}
                            <div className="bulk-assignment-form__section">
                                <label className="bulk-assignment-form__label">
                                    בחר משימות <span className="bulk-assignment-form__required">*</span>
                                </label>
                                <div className="bulk-assignment-form__multi-select">
                                    {tasks.map(task => (
                                        <label key={task.id} className="bulk-assignment-form__checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={selectedTaskIds.includes(task.id)}
                                                onChange={() => toggleTask(task.id)}
                                                className="bulk-assignment-form__checkbox"
                                            />
                                            <span>{task.name}</span>
                                        </label>
                                    ))}
                                    {tasks.length === 0 && (
                                        <p className="bulk-assignment-form__empty">לא נמצאו משימות</p>
                                    )}
                                </div>
                                <p className="bulk-assignment-form__hint">
                                    נבחרו {selectedTaskIds.length} משימות
                                </p>
                            </div>

                            {/* Preview Count */}
                            {previewCount > 0 && (
                                <div className="bulk-assignment-form__preview">
                                    <strong>תצוגה מקדימה:</strong> יווצרו {previewCount} הקצאות
                                    ({selectedUserIds.length} עובדים × {selectedTaskIds.length} משימות)
                                </div>
                            )}

                            {/* Actions */}
                            <div className="bulk-assignment-form__actions">
                                <button
                                    type="button"
                                    className="bulk-assignment-form__button bulk-assignment-form__button--secondary"
                                    onClick={onClose}
                                >
                                    ביטול
                                </button>
                                <button
                                    type="submit"
                                    className="bulk-assignment-form__button bulk-assignment-form__button--primary"
                                    disabled={previewCount === 0}
                                >
                                    המשך
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="bulk-assignment-form__confirmation">
                            <p className="bulk-assignment-form__confirmation-text">
                                האם אתה בטוח שברצונך ליצור <strong>{previewCount} הקצאות</strong>?
                            </p>
                            <p className="bulk-assignment-form__confirmation-details">
                                {selectedUserIds.length} עובדים × {selectedTaskIds.length} משימות
                            </p>
                            <div className="bulk-assignment-form__actions">
                                <button
                                    type="button"
                                    className="bulk-assignment-form__button bulk-assignment-form__button--secondary"
                                    onClick={() => setShowConfirmation(false)}
                                    disabled={bulkCreateMutation.isPending}
                                >
                                    חזור
                                </button>
                                <button
                                    type="button"
                                    className="bulk-assignment-form__button bulk-assignment-form__button--primary"
                                    onClick={confirmBulkCreate}
                                    disabled={bulkCreateMutation.isPending}
                                >
                                    {bulkCreateMutation.isPending ? 'יוצר הקצאות...' : 'אשר ויצור'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
