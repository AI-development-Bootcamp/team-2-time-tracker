import React from 'react';
import './Modal.css';

interface CreateTaskModalProps {
  onClose: () => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">יצירת משימה חדשה</h2>
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
          {/* Future: Task creation form */}
          <p>טופס יצירת משימה יתווסף בהמשך</p>
        </div>
      </div>
    </div>
  );
};
