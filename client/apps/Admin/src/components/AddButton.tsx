import React, { useState, useRef, useEffect } from 'react';
import './AddButton.css';
import { CreateUserModal } from './CreateUserModal';
import { CreateClientModal } from './CreateClientModal';
import { CreateProjectModal } from './CreateProjectModal';
import { CreateTaskModal } from './CreateTaskModal';

type ModalType = 'user' | 'client' | 'project' | 'task' | null;

export const AddButton: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleToggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSelectOption = (type: ModalType) => {
    setIsDropdownOpen(false);
    setActiveModal(type);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
  };

  return (
    <>
      <div className="add-button" ref={dropdownRef}>
        <button
          className="add-button__trigger"
          onClick={handleToggleDropdown}
          type="button"
        >
           יצירה +
        </button>

        {isDropdownOpen && (
          <div className="add-button__dropdown">
            <button
              className="add-button__option"
              onClick={() => handleSelectOption('user')}
              type="button"
            >
              יצירת משתמש חדש
            </button>
            <button
              className="add-button__option"
              onClick={() => handleSelectOption('client')}
              type="button"
            >
              יצירת לקוח חדש
            </button>
            <button
              className="add-button__option"
              onClick={() => handleSelectOption('project')}
              type="button"
            >
              יצירת פרויקט חדש
            </button>
            <button
              className="add-button__option"
              onClick={() => handleSelectOption('task')}
              type="button"
            >
              יצירת משימה חדשה
            </button>
          </div>
        )}
      </div>

      {activeModal === 'user' && <CreateUserModal onClose={handleCloseModal} />}
      {activeModal === 'client' && <CreateClientModal onClose={handleCloseModal} />}
      {activeModal === 'project' && <CreateProjectModal onClose={handleCloseModal} />}
      {activeModal === 'task' && <CreateTaskModal onClose={handleCloseModal} />}
    </>
  );
};
