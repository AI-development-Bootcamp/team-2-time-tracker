import React from 'react';
import './Modal.css';

interface CreateProjectModalProps {
  onClose: () => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">יצירת פרויקט חדש</h2>
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
          {/* Future: Project creation form */}
          <p>טופס יצירת פרויקט יתווסף בהמשך</p>
        </div>
      </div>
    </div>
  );
};
