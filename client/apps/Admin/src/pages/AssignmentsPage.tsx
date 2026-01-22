/**
 * @fileoverview Admin assignments management page
 * @module pages/AssignmentsPage
 */

import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import {
    useReactTable,
    getCoreRowModel,
    createColumnHelper,
    flexRender,
    getPaginationRowModel,
} from '@tanstack/react-table';
import type { TaskAssignmentDto } from '@shared/types';
import { getAssignments, deleteAssignment } from '../api/assignmentsApi';
import { closeTask } from '../api/entitiesApi';
import { AdminLayout } from '../components/AdminLayout';
import { DashboardHeader } from '../components/DashboardHeader';
import { AddButton } from '../components/AddButton';
import { SelectClientModal } from '../components/SelectClientModal';
import { SelectProjectModal } from '../components/SelectProjectModal';
import { EditTaskModal } from '../components/EditTaskModal';
import { AddEmployeeToTaskModal } from '../components/AddEmployeeToTaskModal';
import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal';
import './AssignmentsPage.css';

/**
 * @description Admin assignments management page with table, filters, and close functionality
 * @returns {React.JSX.Element} Assignments page component
 */
function AssignmentsPage(): React.JSX.Element {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [editModalState, setEditModalState] = useState<{ type: 'select-client' | 'select-project' | 'task', id?: string } | null>(null);
    const [addingEmployeeToTaskId, setAddingEmployeeToTaskId] = useState<string | null>(null);
    const queryClient = useQueryClient();

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActiveMenuId(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // Fetch all assignments
    const { data: assignments = [], isLoading, error } = useQuery({
        queryKey: ['assignments', { userName: searchTerm }],
        queryFn: () => getAssignments({
            userName: searchTerm || undefined
        }),
    });

    // Delete mutation for individual assignment removal
    const deleteMutation = useMutation({
        mutationFn: deleteAssignment,
        onMutate: async (assignmentId) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['assignments'] });

            // Snapshot the previous value
            const previousAssignments = queryClient.getQueryData(['assignments', { userName: searchTerm }]);

            // Optimistically update to remove the assignment
            queryClient.setQueryData(['assignments', { userName: searchTerm }], (old: any) => {
                if (!old) return old;
                return old.filter((assignment: any) => assignment.id !== assignmentId);
            });

            // Return context with previous data for rollback
            return { previousAssignments };
        },
        onError: (error: unknown, _, context) => {
            // Rollback to previous state on error
            if (context?.previousAssignments) {
                queryClient.setQueryData(['assignments', { userName: searchTerm }], context.previousAssignments);
            }
            const err = error as { response?: { data?: { error?: { message?: string } } } };
            const message = err.response?.data?.error?.message || 'שגיאה במחיקת הקצאה';
            alert(message);
        },
        onSettled: () => {
            // Refetch to ensure sync with server
            queryClient.invalidateQueries({ queryKey: ['assignments'] });
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
            const key = assignment.taskId;
            if (!groups.has(key)) {
                groups.set(key, {
                    taskId: assignment.taskId,
                    taskName: assignment.taskName,
                    projectName: assignment.projectName,
                    clientName: assignment.clientName,
                    assignments: []
                });
            }
            // Only add assignment to the array if it has a userId (skip placeholder assignments)
            if (assignment.userId) {
                groups.get(key)!.assignments.push(assignment);
            }
        });

        return Array.from(groups.values());
    }, [assignments]);

    const [editingAssignmentsTaskId, setEditingAssignmentsTaskId] = useState<string | null>(null);
    const [closeConfirmationTaskId, setCloseConfirmationTaskId] = useState<string | null>(null);
    const [isClosing, setIsClosing] = useState(false);

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
                const assignmentsList = info.getValue();

                return (
                    <div className="assignments-list">
                        {assignmentsList.length === 0 && !isEditing && (
                            <span className="assignment-badge assignment-badge--empty">
                                אין עובדים משוייכים
                            </span>
                        )}
                        {assignmentsList.map((assignment) => (
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
                        {isEditing && (
                            <button
                                className="assignment-badge assignment-badge--add"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setAddingEmployeeToTaskId(info.row.original.taskId);
                                }}
                                title="הוסף עובד"
                            >
                                +
                            </button>
                        )}
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
                                                setEditModalState({ type: 'select-client' });
                                                setActiveMenuId(null);
                                            }}
                                        >
                                            ערוך לקוח
                                        </button>
                                        <button
                                            className="assignments-page__dropdown-item"
                                            onClick={() => {
                                                setEditModalState({ type: 'select-project' });
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
                            onClick={() => handleCloseTask(row.original.taskId)}
                            title="סגור משימה"
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
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: {
                pageSize: 14,
            },
        },
    });

    // Handle close task click - open modal
    const handleCloseTask = (taskId: string) => {
        setCloseConfirmationTaskId(taskId);
    };

    // Confirm close execution
    const confirmCloseTask = async () => {
        if (!closeConfirmationTaskId) return;

        const taskId = closeConfirmationTaskId;
        setIsClosing(true);

        try {
            // Optimistically remove from UI


            queryClient.setQueryData(['assignments', { userName: searchTerm }], (old: any) => {
                if (!old) return old;
                return old.filter((assignment: any) => assignment.taskId !== taskId);
            });

            // Call API to close task
            await closeTask(taskId);

            // Refetch to get fresh data from server
            await queryClient.invalidateQueries({ queryKey: ['assignments'] });
        } catch (error: any) {
            // On error, refetch to restore correct state
            await queryClient.invalidateQueries({ queryKey: ['assignments'] });
            const message = error.response?.data?.error?.message || 'שגיאה בסגירת המשימה';
            alert(message);
        } finally {
            setIsClosing(false);
            setCloseConfirmationTaskId(null);
        }
    };

    return (
        <AdminLayout>

            <DashboardHeader
                title="שיוך עובד למשימה"
                showAddButton={false}
            />
            <div className="assignments-page__subtitle">
                כאן תוכל לשייך עובדים למשימות מתוך פרויקטים שונים של לקוחות.
            </div>

            <div className="assignments-page">
                {/* Search */}
                <div className="assignments-page__search-container">
                    <div className="assignments-page__actions-group">
                        <AddButton />
                        <div className="assignments-page__search-wrapper">
                            <Search className="assignments-page__search-icon" size={18} />
                            <input
                                type="text"
                                placeholder="חיפוש לפי שם עובד"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="assignments-page__search-input"
                            />
                        </div>
                    </div>
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

                {/* Pagination */}
                {!isLoading && !error && groupedAssignments.length > 0 && (
                    <div className="assignments-page__pagination">
                        <button
                            onClick={() => table.firstPage()}
                            disabled={!table.getCanPreviousPage()}
                            className="assignments-page__pagination-btn"
                        >
                            ‹‹
                        </button>
                        <button
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            className="assignments-page__pagination-btn"
                        >
                            ‹
                        </button>

                        {Array.from({ length: table.getPageCount() }, (_, i) => i + 1).map(pageNum => (
                            <button
                                key={pageNum}
                                onClick={() => table.setPageIndex(pageNum - 1)}
                                className={`assignments-page__pagination-btn ${table.getState().pagination.pageIndex === pageNum - 1 ? 'active' : ''
                                    }`}
                            >
                                {pageNum}
                            </button>
                        ))}

                        <button
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className="assignments-page__pagination-btn"
                        >
                            ›
                        </button>
                        <button
                            onClick={() => table.lastPage()}
                            disabled={!table.getCanNextPage()}
                            className="assignments-page__pagination-btn"
                        >
                            ››
                        </button>
                    </div>
                )}
            </div>
            {editModalState?.type === 'select-client' && (
                <SelectClientModal
                    onClose={() => setEditModalState(null)}
                />
            )}
            {editModalState?.type === 'select-project' && (
                <SelectProjectModal
                    onClose={() => setEditModalState(null)}
                />
            )}
            {editModalState?.type === 'task' && editModalState.id && (
                <EditTaskModal
                    taskId={editModalState.id}
                    onClose={() => setEditModalState(null)}
                />
            )}
            {addingEmployeeToTaskId && (
                <AddEmployeeToTaskModal
                    taskId={addingEmployeeToTaskId}
                    taskName={groupedAssignments.find(g => g.taskId === addingEmployeeToTaskId)?.taskName}
                    projectName={groupedAssignments.find(g => g.taskId === addingEmployeeToTaskId)?.projectName}
                    clientName={groupedAssignments.find(g => g.taskId === addingEmployeeToTaskId)?.clientName}
                    existingUserIds={groupedAssignments.find(g => g.taskId === addingEmployeeToTaskId)?.assignments.map(a => a.userId) || []}
                    onClose={() => setAddingEmployeeToTaskId(null)}
                />
            )}

            {closeConfirmationTaskId && (
                <DeleteConfirmationModal
                    title="סגירת משימה"
                    description="האם אתה בטוח שברצונך לסגור משימה זו? המשימה לא תוצג יותר ברשימה."
                    onConfirm={confirmCloseTask}
                    onClose={() => setCloseConfirmationTaskId(null)}
                    isLoading={isClosing}
                />
            )}
        </AdminLayout>
    );
}

export default AssignmentsPage;
