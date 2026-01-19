import React from 'react';
import './Modal.css';

interface CreateUserModalProps {
  onClose: () => void;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({ onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">יצירת משתמש חדש</h2>
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
          {/* Future: User creation form */}
          <p>טופס יצירת משתמש יתווסף בהמשך</p>
        </div>
      </div>
    </div>
  );
};
