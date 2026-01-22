/**
 * @fileoverview Modal for selecting a client to edit
 * @module components/SelectClientModal
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Briefcase, Search } from 'lucide-react';
import { clientsApi } from '../api/clientsApi';
import { EditClientModal } from './EditClientModal';
import { ModalIcon } from './ModalIcon';
import './Modal.css';
import './SelectModal.css';

interface SelectClientModalProps {
    onClose: () => void;
}

export const SelectClientModal: React.FC<SelectClientModalProps> = ({ onClose }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

    // Fetch all clients
    const { data: clients = [], isLoading } = useQuery({
        queryKey: ['clients'],
        queryFn: () => clientsApi.getClients(),
    });

    // Filter clients based on search term
    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // If a client is selected, show the edit modal
    if (selectedClientId) {
        return (
            <EditClientModal
                clientId={selectedClientId}
                onClose={() => {
                    setSelectedClientId(null);
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
                        <ModalIcon icon={Briefcase} />
                        <h2 className="modal__title">בחר לקוח לעריכה</h2>
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
                            placeholder="חפש לקוח לפי שם..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="select-modal__search-input"
                            autoFocus
                        />
                    </div>

                    {/* Loading state */}
                    {isLoading && (
                        <div className="select-modal__loading">טוען רשימת לקוחות...</div>
                    )}

                    {/* Clients list */}
                    {!isLoading && (
                        <div className="select-modal__list">
                            {filteredClients.length === 0 ? (
                                <div className="select-modal__empty">
                                    {searchTerm ? 'לא נמצאו לקוחות תואמים' : 'אין לקוחות במערכת'}
                                </div>
                            ) : (
                                filteredClients.map((client) => (
                                    <button
                                        key={client.id}
                                        className="select-modal__item"
                                        onClick={() => setSelectedClientId(client.id)}
                                    >
                                        <div className="select-modal__item-icon">
                                            <Briefcase size={20} />
                                        </div>
                                        <div className="select-modal__item-content">
                                            <div className="select-modal__item-title">{client.name}</div>
                                            <div className="select-modal__item-subtitle">
                                                {client.status === 'ACTIVE' ? 'פעיל' : 'לא פעיל'}
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
