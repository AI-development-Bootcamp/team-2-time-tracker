/**
 * @fileoverview Modal for delete confirmation
 * @module components/DeleteConfirmationModal
 */

import React from 'react';
import { Trash2 } from 'lucide-react';
import './DeleteConfirmationModal.css';

interface DeleteConfirmationModalProps {
    title: string;
    description: string;
    onConfirm: () => void;
    onClose: () => void;
    isLoading?: boolean;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
    title,
    description,
    onConfirm,
    onClose,
    isLoading = false
}) => {
    return (
        <div className="delete-modal-overlay" onClick={onClose}>
            <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
                <div className="delete-modal__content">
                    <div className="delete-modal__text">
                        <h3 className="delete-modal__title">{title}</h3>
                        <p className="delete-modal__description">{description}</p>
                    </div>
                    <div className="delete-modal__icon-wrapper">
                        <Trash2 size={24} />
                    </div>
                </div>

                <div className="delete-modal__actions">
                    <button
                        className="delete-modal__btn delete-modal__btn--cancel"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        ביטול
                    </button>
                    <button
                        className="delete-modal__btn delete-modal__btn--confirm"
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? 'מוחק...' : 'מחיקה'}
                    </button>
                </div>
            </div>
        </div>
    );
};
