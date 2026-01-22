/**
 * @fileoverview Modal for adding detailed employee selection to a task
 * @module components/AddEmployeeToTaskModal
 */

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api/usersApi';
import { bulkCreateAssignments } from '../api/assignmentsApi';
import { UserPlus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { UserRole } from '@shared/types';
import './AddEmployeeToTaskModal.css';

interface AddEmployeeToTaskModalProps {
    taskId: string;
    taskName?: string;
    projectName?: string;
    clientName?: string;
    existingUserIds: string[];
    onClose: () => void;
}

// Helper to determine role description from schema role
const getRoleDescription = (role: UserRole) => {
    return role === UserRole.ADMIN ? 'מנהל מערכת' : 'עובד';
};

// Helper for type description
const getTypeDescription = (role: UserRole) => {
    return role === UserRole.ADMIN ? 'מנהל' : 'עובד';
};

export const AddEmployeeToTaskModal: React.FC<AddEmployeeToTaskModalProps> = ({
    taskId,
    taskName = '',
    projectName = '',
    clientName = '',
    existingUserIds,
    onClose
}) => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 8; // Number of rows per page

    // Fetch all users
    const { data: usersData, isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: () => usersApi.getUsers({ page: 1, pageSize: 1000 }),
    });

    const availableUsers = useMemo(() => {
        if (!usersData?.users) return [];
        return usersData.users.filter(user => !existingUserIds.includes(user.id));
    }, [usersData, existingUserIds]);

    // Filter by search term
    const filteredUsers = useMemo(() => {
        return availableUsers.filter(user =>
            user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.id.includes(searchTerm)
        );
    }, [availableUsers, searchTerm]);

    // Pagination logic
    const totalPages = Math.ceil(filteredUsers.length / pageSize);
    const paginatedUsers = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredUsers.slice(start, start + pageSize);
    }, [filteredUsers, currentPage, pageSize]);

    // Toggle selection
    const toggleUserSelection = (userId: string) => {
        const newSelected = new Set(selectedUserIds);
        if (newSelected.has(userId)) {
            newSelected.delete(userId);
        } else {
            newSelected.add(userId);
        }
        setSelectedUserIds(newSelected);
    };

    // Bulk assign mutation
    const assignMutation = useMutation({
        mutationFn: async () => {
            return bulkCreateAssignments({
                taskIds: [taskId],
                userIds: Array.from(selectedUserIds),
            });
        },
        onMutate: async () => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['assignments'] });

            // Snapshot the previous value
            const previousAssignments = queryClient.getQueryData(['assignments']);

            // Get selected users data for optimistic update
            const selectedUsers = usersData?.users?.filter(u => selectedUserIds.has(u.id)) || [];

            // Optimistically add new assignments
            queryClient.setQueryData(['assignments'], (old: any) => {
                if (!old) return old;

                // Create optimistic assignment records
                const newAssignments = selectedUsers.map(user => ({
                    id: `temp-${Date.now()}-${user.id}`, // Temporary ID
                    userId: user.id,
                    taskId: taskId,
                    createdAt: new Date().toISOString(),
                    userName: user.fullName,
                    userEmail: user.email,
                    taskName: taskName || '',
                    projectName: projectName || '',
                    clientName: clientName || '',
                }));

                return [...old, ...newAssignments];
            });

            // Return context with previous data for rollback
            return { previousAssignments };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assignments'] });
            onClose();
        },
        onError: (error: any, _, context) => {
            // Rollback to previous state on error
            if (context?.previousAssignments) {
                queryClient.setQueryData(['assignments'], context.previousAssignments);
            }
            alert(error.response?.data?.message || 'שגיאה בשיוך העובדים');
        },
    });

    const handleAssign = () => {
        if (selectedUserIds.size > 0) {
            assignMutation.mutate();
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="add-employee-modal" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="add-employee-modal__header">
                    <div className="add-employee-modal__header-content">
                        <div className="add-employee-modal__icon">
                            <UserPlus size={24} />
                        </div>
                        <div className="add-employee-modal__title-group">
                            <h2 className="add-employee-modal__title">שיוך עובד חדש למשימה</h2>
                            <div className="add-employee-modal__subtitle">
                                כאן תוכל לשייך עובד חדש מהמאגר לטובת
                                <div className="add-employee-modal__breadcrumbs">
                                    {clientName && <span className="breadcrumb-pill pill-blue">{clientName}</span>}
                                    {clientName && projectName && <span className="breadcrumb-arrow">←</span>}
                                    {projectName && <span className="breadcrumb-pill pill-pink">{projectName}</span>}
                                    {projectName && taskName && <span className="breadcrumb-arrow">←</span>}
                                    {taskName && <span className="breadcrumb-pill pill-purple">{taskName}</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                    <button className="add-employee-modal__close" onClick={onClose}>×</button>
                </div>

                {/* Body */}
                <div className="add-employee-modal__body">
                    <div className="add-employee-modal__toolbar">
                        <div style={{ fontSize: '0.9rem', color: '#666' }}>
                            בחר עובד מהרשימה
                        </div>
                        <div className="add-employee-modal__search-bar">
                            <Search className="add-employee-modal__search-icon" />
                            <input
                                type="text"
                                className="add-employee-modal__search-input"
                                placeholder="חיפוש לפי שם עובד"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1); // Reset to page 1 on search
                                }}
                            />
                        </div>
                    </div>


                    <div className="add-employee-modal__table-container">
                        <table className="add-employee-modal__table">
                            <thead>
                                <tr>
                                    <th>Employee ID</th>
                                    <th>שם מלא</th>
                                    <th>תפקיד</th>
                                    <th>סוג</th>
                                    <th>שיוך ארגוני</th>
                                    <th>אחוז משרה</th>
                                    <th>בחירה</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr><td colSpan={7} style={{ textAlign: 'center' }}>טוען נתונים...</td></tr>
                                ) : paginatedUsers.length === 0 ? (
                                    <tr><td colSpan={7} style={{ textAlign: 'center' }}>לא נמצאו עובדים זמינים</td></tr>
                                ) : (
                                    paginatedUsers.map((user) => (
                                        <tr key={user.id} onClick={() => toggleUserSelection(user.id)} style={{ cursor: 'pointer' }}>
                                            <td className="font-mono text-xs">{user.id.substring(0, 6)}...</td>
                                            <td style={{ fontWeight: 500 }}>{user.fullName}</td>
                                            <td>{getRoleDescription(user.role)}</td>
                                            <td>
                                                <span style={{
                                                    background: user.role === UserRole.ADMIN ? '#eff6ff' : '#f3f4f6',
                                                    color: user.role === UserRole.ADMIN ? '#1d4ed8' : '#374151',
                                                    padding: '2px 8px',
                                                    borderRadius: '12px',
                                                    fontSize: '0.75rem'
                                                }}>
                                                    {getTypeDescription(user.role)}
                                                </span>
                                            </td>
                                            <td>-</td>
                                            <td>-</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <input
                                                    type="checkbox"
                                                    className="add-employee-modal__checkbox"
                                                    checked={selectedUserIds.has(user.id)}
                                                    onChange={() => toggleUserSelection(user.id)}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="add-employee-modal__pagination">
                        <button
                            className="add-employee-modal__page-btn"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                        >
                            <ChevronRight size={16} />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                className={`add-employee-modal__page-btn ${currentPage === page ? 'add-employee-modal__page-btn--active' : ''}`}
                                onClick={() => setCurrentPage(page)}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            className="add-employee-modal__page-btn"
                            disabled={currentPage === totalPages || totalPages === 0}
                            onClick={() => setCurrentPage(p => p + 1)}
                        >
                            <ChevronLeft size={16} />
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="add-employee-modal__footer">
                    <button
                        className="add-employee-modal__submit-btn"
                        disabled={selectedUserIds.size === 0 || assignMutation.isPending}
                        onClick={handleAssign}
                    >
                        {assignMutation.isPending ? 'משייך...' : 'שייך עובד למשימה'}
                        <UserPlus size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};
