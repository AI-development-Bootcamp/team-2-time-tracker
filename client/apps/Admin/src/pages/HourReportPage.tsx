/**
 * @fileoverview Admin Hour Report management page
 * @module pages/HourReportPage
 */

import { useState, useMemo } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    createColumnHelper,
    flexRender,
    getPaginationRowModel,
    getFilteredRowModel,
} from '@tanstack/react-table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '../components/AdminLayout';
import { Search } from 'lucide-react';
import { getProjects, updateProjectReportType } from '../api/entitiesApi';
import type { ProjectDto } from '@shared/types';
import { ReportType } from '@shared/types';
import './HourReportPage.css';

// Report type mapping constants
const REPORT_TYPE_MAP = {
    'TOTAL_HOURS': 'summary' as const,
    'ENTRY_EXIT': 'entry-exit' as const,
};

const REPORT_TYPE_REVERSE_MAP = {
    'summary': ReportType.TOTAL_HOURS,
    'entry-exit': ReportType.ENTRY_EXIT,
};

// Define the data structure for the table
interface HourReport {
    id: string;
    clientName: string;
    projectName: string;
    reportType: 'summary' | 'entry-exit';
}

/**
 * @description Transform ProjectDto to HourReport for table display
 */
function transformProjectToHourReport(project: ProjectDto): HourReport {
    return {
        id: project.id,
        clientName: project.client?.name || 'N/A',
        projectName: project.name,
        reportType: REPORT_TYPE_MAP[project.reportType],
    };
}

/**
 * @description Admin Hour Report management page with table
 * @returns {React.JSX.Element} Hour Report page component
 */
function HourReportPage(): React.JSX.Element {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch projects from backend
    const { data: projects = [], isLoading, error } = useQuery({
        queryKey: ['projects'],
        queryFn: () => getProjects(),
    });

    // Transform projects to HourReport format
    const data = useMemo<HourReport[]>(() => {
        return projects.map(transformProjectToHourReport);
    }, [projects]);

    // Mutation for updating report type
    const updateReportTypeMutation = useMutation({
        mutationFn: ({ projectId, reportType }: { projectId: string; reportType: ReportType }) =>
            updateProjectReportType(projectId, reportType),

        // Optimistic update for instant UI feedback
        onMutate: async ({ projectId, reportType }) => {
            await queryClient.cancelQueries({ queryKey: ['projects'] });
            const previousProjects = queryClient.getQueryData<ProjectDto[]>(['projects']);

            queryClient.setQueryData<ProjectDto[]>(['projects'], (old = []) =>
                old.map(project =>
                    project.id === projectId ? { ...project, reportType } : project
                )
            );

            return { previousProjects };
        },

        // Rollback on error
        onError: (error: any, _variables, context) => {
            if (context?.previousProjects) {
                queryClient.setQueryData(['projects'], context.previousProjects);
            }
            const message = error.response?.data?.error?.message || 'שגיאה בעדכון סוג הדיווח';
            alert(message);
        },

        // Refetch on success
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
    });

    const handleReportTypeToggle = (projectId: string, newType: 'summary' | 'entry-exit') => {
        const backendReportType = REPORT_TYPE_REVERSE_MAP[newType];
        updateReportTypeMutation.mutate({ projectId, reportType: backendReportType });
    };

    const columnHelper = createColumnHelper<HourReport>();
    const columns = [
        columnHelper.accessor('clientName', {
            header: 'שם לקוח',
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('projectName', {
            header: 'שם פרויקט',
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('reportType', {
            header: 'סוג בדיווח',
            cell: info => {
                const reportType = info.getValue();
                const rowId = info.row.original.id;
                return (
                    <div className="hour-report-page__toggle">
                        <button
                            className={`hour-report-page__toggle-btn ${reportType === 'summary' ? 'active' : ''}`}
                            onClick={() => handleReportTypeToggle(rowId, 'summary')}
                            disabled={updateReportTypeMutation.isPending}
                        >
                            <span className="hour-report-page__toggle-radio"></span>
                            סיכום שעות
                        </button>
                        <button
                            className={`hour-report-page__toggle-btn ${reportType === 'entry-exit' ? 'active' : ''}`}
                            onClick={() => handleReportTypeToggle(rowId, 'entry-exit')}
                            disabled={updateReportTypeMutation.isPending}
                        >
                            <span className="hour-report-page__toggle-radio"></span>
                            כניסה / יציאה
                        </button>
                    </div>
                );
            },
        }),
    ];

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            globalFilter: searchTerm,
        },
        onGlobalFilterChange: setSearchTerm,
        initialState: {
            pagination: {
                pageSize: 12,
            },
        },
    });

    return (
        <AdminLayout>
            <div className="hour-report-page">
                <div className="hour-report-page__header">
                    <div className="hour-report-page__header-left">
                        <h1 className="hour-report-page__title">הגדרת דיווחי שעות</h1>
                        <div className="hour-report-page__subtitle">
                            כאן תוכל להגדיר את סוג הדיווח של השעות של העובדים בפרויקטים השונים.
                        </div>
                    </div>
                    <div className="hour-report-page__header-right">
                        <div className="hour-report-page__search-wrapper">
                            <Search className="hour-report-page__search-icon" size={18} />
                            <input
                                type="text"
                                className="hour-report-page__search"
                                placeholder="חיפוש לפי שם לקוח/פרויקט"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {isLoading && (
                    <div className="hour-report-page__loading">
                        <div>טוען נתונים...</div>
                    </div>
                )}

                {error && (
                    <div className="hour-report-page__error">
                        <div>שגיאה בטעינת הנתונים. אנא נסה שוב מאוחר יותר.</div>
                    </div>
                )}

                <div className="hour-report-page__content">

                <div className="hour-report-page__table-container">
                    <table className="hour-report-page__table">
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
                                    <td colSpan={columns.length} className="hour-report-page__empty">
                                        לא נמצאו דוחות
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

                <div className="hour-report-page__pagination">
                    <button
                        onClick={() => table.firstPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="hour-report-page__pagination-btn"
                    >
                        ‹‹
                    </button>
                    <button
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="hour-report-page__pagination-btn"
                    >
                        ‹
                    </button>

                    {Array.from({ length: table.getPageCount() }, (_, i) => i + 1).map(pageNum => (
                        <button
                            key={pageNum}
                            onClick={() => table.setPageIndex(pageNum - 1)}
                            className={`hour-report-page__pagination-btn ${
                                table.getState().pagination.pageIndex === pageNum - 1 ? 'active' : ''
                            }`}
                        >
                            {pageNum}
                        </button>
                    ))}

                    <button
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="hour-report-page__pagination-btn"
                    >
                        ›
                    </button>
                    <button
                        onClick={() => table.lastPage()}
                        disabled={!table.getCanNextPage()}
                        className="hour-report-page__pagination-btn"
                    >
                        ››
                    </button>
                </div>
                </div>
            </div>
        </AdminLayout>
    );
}

export default HourReportPage;

