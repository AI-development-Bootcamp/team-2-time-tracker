/**
 * @fileoverview Admin assignments management page
 * @module pages/AssignmentsPage
 */

import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    useReactTable,
    getCoreRowModel,
    createColumnHelper,
    flexRender,
} from '@tanstack/react-table';
import type { TaskAssignmentDto } from '@shared/types';
import { getAssignments, deleteAssignment } from '../api/assignmentsApi';
import { AdminLayout } from '../components/AdminLayout';
import { DashboardHeader } from '../components/DashboardHeader';
import { EditClientModal } from '../components/EditClientModal';
import { EditProjectModal } from '../components/EditProjectModal';
import { EditTaskModal } from '../components/EditTaskModal';
import './AssignmentsPage.css';

/**
 * @description Admin assignments management page with table, filters, and delete functionality
 * @returns {React.JSX.Element} Assignments page component
 */
function AssignmentsPage(): React.JSX.Element {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [editModalState, setEditModalState] = useState<{ type: 'client' | 'project' | 'task', id: string } | null>(null);
    const queryClient = useQueryClient();

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActiveMenuId(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // Fetch all assignments
    const { data: assignments = [], isLoading, error } = useQuery({
        queryKey: ['assignments', { userName: searchTerm }], // Add search term to query key
        queryFn: () => getAssignments({
            userName: searchTerm || undefined // Pass search term to API
        }),
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: deleteAssignment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assignments'] });
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { error?: { message?: string } } } };
            const message = err.response?.data?.error?.message || 'שגיאה במחיקת הקצאה';
            alert(message);
        },
    });

    interface GroupedAssignment {
        taskId: string;
        taskName: string;
        projectName: string;
        clientName: string;
        assignments: TaskAssignmentDto[];
    }

    /**
     * Group assignments by task (and project/client)
     * This creates a row for each unique task, with a list of assigned users
     */
    const groupedAssignments = useMemo<GroupedAssignment[]>(() => {
        const groups = new Map<string, GroupedAssignment>();

        assignments.forEach((assignment) => {
            const key = assignment.taskId; // Group by Task ID
            if (!groups.has(key)) {
                groups.set(key, {
                    taskId: assignment.taskId,
                    taskName: assignment.taskName,
                    projectName: assignment.projectName,
                    clientName: assignment.clientName,
                    assignments: []
                });
            }
            groups.get(key)!.assignments.push(assignment);
        });

        return Array.from(groups.values());
    }, [assignments]);

    const [editingAssignmentsTaskId, setEditingAssignmentsTaskId] = useState<string | null>(null);

    // Icons
    const EditIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
        </svg>
    );

    const DeleteIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
    );

    // Table columns definition
    const columnHelper = createColumnHelper<GroupedAssignment>();
    const columns = [
        columnHelper.accessor('clientName', {
            header: 'שם לקוח',
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('projectName', {
            header: 'שם פרויקט',
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('taskName', {
            header: 'שם המשימה',
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('assignments', {
            header: 'שמות העובדים המשוייכים',
            cell: info => {
                const isEditing = editingAssignmentsTaskId === info.row.original.taskId;
                return (
                    <div className="assignments-list">
                        {info.getValue().map((assignment) => (
                            <span
                                key={assignment.id}
                                className={`assignment-badge ${isEditing ? 'assignment-badge--editing' : ''}`}
                            >
                                {assignment.userName}
                                {isEditing && (
                                    <button
                                        className="assignment-badge__remove"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm(`האם להסיר את ${assignment.userName} מהמשימה?`)) {
                                                deleteMutation.mutate(assignment.id);
                                            }
                                        }}
                                        title="הסר עובד"
                                    >
                                        ×
                                    </button>
                                )}
                            </span>
                        ))}
                    </div>
                );
            },
        }),

        columnHelper.display({
            id: 'actions',
            header: 'פעולות',
            cell: ({ row }) => {
                const isMenuOpen = activeMenuId === row.original.taskId;
                const isEditing = editingAssignmentsTaskId === row.original.taskId;

                return (
                    <div className="assignments-page__actions">
                        {isEditing ? (
                            <button
                                className="assignments-page__action-btn assignments-page__action-btn--active"
                                onClick={() => setEditingAssignmentsTaskId(null)}
                                title="סיום עריכה"
                            >
                                סיום
                            </button>
                        ) : (
                            <div className="assignments-page__menu-container" onClick={(e) => e.stopPropagation()}>
                                <button
                                    className={`assignments-page__action-btn ${isMenuOpen ? 'assignments-page__action-btn--active' : ''}`}
                                    onClick={() => setActiveMenuId(isMenuOpen ? null : row.original.taskId)}
                                    title="ערוך"
                                >
                                    <EditIcon />
                                </button>
                                {isMenuOpen && (
                                    <div className="assignments-page__dropdown">
                                        <button
                                            className="assignments-page__dropdown-item"
                                            onClick={() => {
                                                const clientId = row.original.assignments[0]?.clientId;
                                                if (clientId) {
                                                    setEditModalState({ type: 'client', id: clientId });
                                                }
                                                setActiveMenuId(null);
                                            }}
                                        >
                                            ערוך לקוח
                                        </button>
                                        <button
                                            className="assignments-page__dropdown-item"
                                            onClick={() => {
                                                const projectId = row.original.assignments[0]?.projectId;
                                                if (projectId) {
                                                    setEditModalState({ type: 'project', id: projectId });
                                                }
                                                setActiveMenuId(null);
                                            }}
                                        >
                                            ערוך פרויקט
                                        </button>
                                        <button
                                            className="assignments-page__dropdown-item"
                                            onClick={() => {
                                                setEditModalState({ type: 'task', id: row.original.taskId });
                                                setActiveMenuId(null);
                                            }}
                                        >
                                            ערוך משימה
                                        </button>
                                        <div className="assignments-page__dropdown-separator" />
                                        <button
                                            className="assignments-page__dropdown-item"
                                            onClick={() => {
                                                setEditingAssignmentsTaskId(row.original.taskId);
                                                setActiveMenuId(null);
                                            }}
                                        >
                                            ערוך שיוך עובדים
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                        <button
                            className="assignments-page__action-btn assignments-page__action-btn--delete"
                            onClick={() => handleDeleteTaskAssignments(row.original.taskId)}
                            title="מחק הכל"
                        >
                            <DeleteIcon />
                        </button>
                    </div>
                );
            },
        }),
    ];


    const table = useReactTable({
        data: groupedAssignments,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    // Handle delete: Deletes ALL assignments for this task (for this view logic)
    // Or just one? The mock implies rows are tasks. Deleting the row probably removes all assignments or unassigns them.
    // Given the API only deletes single assignment ID, we might need to loop delete or add a bulk delete endpoint.
    // For now, let's implement loop delete for the task's assignments.
    const handleDeleteTaskAssignments = async (taskId: string) => {
        if (confirm('האם אתה בטוח שברצונך למחוק את כל השיוכים למשימה זו?')) {
            const group = groupedAssignments.find(g => g.taskId === taskId);
            if (group) {
                // Delete all assignments for this task
                // In a real app, this should be a bulk API call to ensure atomicity
                for (const assignment of group.assignments) {
                    deleteMutation.mutate(assignment.id);
                }
            }
        }
    };

    return (
        <AdminLayout>
            <label> placeholder</label>
            <DashboardHeader
                title="שיוך עובד למשימה"
                showAddButton={false}
            />
            <div className="assignments-page__subtitle">
                כאן תוכל לשייך עובדים למשימות מתוך פרויקטים שונים של לקוחות.
            </div>

            <div className="assignments-page">
                {/* Filters */}
                {/* Search */}
                <div className="assignments-page__search-container">
                    <input
                        type="text"
                        placeholder="חיפוש לפי שם עובד"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="assignments-page__search-input"
                    />
                    <button className="assignments-page__create-btn" onClick={() => {/* TODO: Implement create modal */ }}>
                        יצירה +
                    </button>
                </div>

                {/* Loading state */}
                {isLoading && (
                    <div className="assignments-page__loading">טוען...</div>
                )}

                {/* Error state */}
                {error && (
                    <div className="assignments-page__error">
                        שגיאה בטעינת ההקצאות
                    </div>
                )}

                {/* Table */}
                {!isLoading && !error && (
                    <div className="assignments-page__table-container">
                        <table className="assignments-page__table">
                            <thead>
                                {table.getHeaderGroups().map(headerGroup => (
                                    <tr key={headerGroup.id}>
                                        {headerGroup.headers.map(header => (
                                            <th key={header.id}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody>
                                {table.getRowModel().rows.length === 0 ? (
                                    <tr>
                                        <td colSpan={columns.length} className="assignments-page__empty">
                                            לא נמצאו הקצאות
                                        </td>
                                    </tr>
                                ) : (
                                    table.getRowModel().rows.map(row => (
                                        <tr key={row.id}>
                                            {row.getVisibleCells().map(cell => (
                                                <td key={cell.id}>
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext()
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            {editModalState?.type === 'client' && (
                <EditClientModal
                    clientId={editModalState.id}
                    onClose={() => setEditModalState(null)}
                />
            )}
            {editModalState?.type === 'project' && (
                <EditProjectModal
                    projectId={editModalState.id}
                    onClose={() => setEditModalState(null)}
                />
            )}
            {editModalState?.type === 'task' && (
                <EditTaskModal
                    taskId={editModalState.id}
                    onClose={() => setEditModalState(null)}
                />
            )}
        </AdminLayout>
    );
}

export default AssignmentsPage;
