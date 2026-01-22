import React, { useState, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();

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

  const handleSuccess = () => {
    // Invalidate assignments query to refetch data
    queryClient.invalidateQueries({ queryKey: ['assignments'] });
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

      {activeModal === 'user' && <CreateUserModal onClose={handleCloseModal} onSuccess={handleSuccess} />}
      {activeModal === 'client' && <CreateClientModal onClose={handleCloseModal} onSuccess={handleSuccess} />}
      {activeModal === 'project' && <CreateProjectModal onClose={handleCloseModal} onSuccess={handleSuccess} />}
      {activeModal === 'task' && <CreateTaskModal onClose={handleCloseModal} onSuccess={handleSuccess} />}
    </>
  );
};
