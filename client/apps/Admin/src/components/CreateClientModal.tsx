import React from 'react';
import './Modal.css';

interface CreateClientModalProps {
  onClose: () => void;
}

export const CreateClientModal: React.FC<CreateClientModalProps> = ({ onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">יצירת לקוח חדש</h2>
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
          {/* Future: Client creation form */}
          <p>טופס יצירת לקוח יתווסף בהמשך</p>
        </div>
      </div>
    </div>
  );
};
