/**
 * @fileoverview Modal for selecting a project to edit
 * @module components/SelectProjectModal
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Folder, Search } from 'lucide-react';
import { projectsApi } from '../api/projectsApi';
import { EditProjectModal } from './EditProjectModal';
import { ModalIcon } from './ModalIcon';
import './Modal.css';
import './SelectModal.css';

interface SelectProjectModalProps {
    onClose: () => void;
}

export const SelectProjectModal: React.FC<SelectProjectModalProps> = ({ onClose }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

    // Fetch all projects
    const { data: projects = [], isLoading } = useQuery({
        queryKey: ['projects'],
        queryFn: () => projectsApi.getProjects(),
    });

    // Filter projects based on search term
    const filteredProjects = projects.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.client?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // If a project is selected, show the edit modal
    if (selectedProjectId) {
        return (
            <EditProjectModal
                projectId={selectedProjectId}
                onClose={() => {
                    setSelectedProjectId(null);
                    onClose();
                }}
            />
        );
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal modal--wide" onClick={(e) => e.stopPropagation()}>
                <div className="modal__header">
                    <div className="modal__title-wrapper">
                        <ModalIcon icon={Folder} />
                        <h2 className="modal__title">בחר פרויקט לעריכה</h2>
                    </div>
                    <button
                        className="modal__close"
                        onClick={onClose}
                        type="button"
                        aria-label="סגור"
                    >
                        ×
                    </button>
                </div>

                <div className="modal__body">
                    {/* Search bar */}
                    <div className="select-modal__search">
                        <Search className="select-modal__search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="חפש פרויקט לפי שם או לקוח..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="select-modal__search-input"
                            autoFocus
                        />
                    </div>

                    {/* Loading state */}
                    {isLoading && (
                        <div className="select-modal__loading">טוען רשימת פרויקטים...</div>
                    )}

                    {/* Projects list */}
                    {!isLoading && (
                        <div className="select-modal__list">
                            {filteredProjects.length === 0 ? (
                                <div className="select-modal__empty">
                                    {searchTerm ? 'לא נמצאו פרויקטים תואמים' : 'אין פרויקטים במערכת'}
                                </div>
                            ) : (
                                filteredProjects.map((project) => (
                                    <button
                                        key={project.id}
                                        className="select-modal__item"
                                        onClick={() => setSelectedProjectId(project.id)}
                                    >
                                        <div className="select-modal__item-icon">
                                            <Folder size={20} />
                                        </div>
                                        <div className="select-modal__item-content">
                                            <div className="select-modal__item-title">{project.name}</div>
                                            <div className="select-modal__item-subtitle">
                                                {project.client?.name || 'ללא לקוח'} • {project.status === 'ACTIVE' ? 'פעיל' : 'לא פעיל'}
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
