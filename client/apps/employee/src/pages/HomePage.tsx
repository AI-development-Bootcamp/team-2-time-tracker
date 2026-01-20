/**
 * @fileoverview Home page displaying user's absences list
 * @module pages/HomePage
 */

import { useNavigate } from 'react-router-dom';
import { useAbsences } from '../api/absencesApi';
import { AbsenceType, AbsenceStatus } from '@shared/types';
import './HomePage.css';

export default function HomePage() {
    const navigate = useNavigate();
    const { data, isLoading, error } = useAbsences({ page: 1, pageSize: 50 });

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('he-IL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    };

    const getAbsenceTypeLabel = (type: AbsenceType): string => {
        const typeMap: Record<AbsenceType, string> = {
            [AbsenceType.VACATION]: 'חופשה',
            [AbsenceType.SICK]: 'מחלה',
            [AbsenceType.RESERVES]: 'מילואים',
            [AbsenceType.OTHER]: 'אחר',
        };
        return typeMap[type] || type;
    };

    const getAbsenceStatusLabel = (status: AbsenceStatus): string => {
        const statusMap: Record<AbsenceStatus, string> = {
            [AbsenceStatus.PENDING_DOCUMENT]: 'ממתין למסמך',
            [AbsenceStatus.SUBMITTED]: 'הוגש',
        };
        return statusMap[status] || status;
    };

    const getAbsenceStatusClass = (status: AbsenceStatus): string => {
        const statusClassMap: Record<AbsenceStatus, string> = {
            [AbsenceStatus.PENDING_DOCUMENT]: 'status--pending',
            [AbsenceStatus.SUBMITTED]: 'status--submitted',
        };
        return statusClassMap[status] || '';
    };

    const calculateDuration = (startDate: string, endDate: string): number => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
    };

    return (
        <div className="home-page">
            <div className="home-page__header">
                <h1 className="home-page__title">ההיעדרויות שלי</h1>
                <button
                    type="button"
                    className="home-page__add-btn"
                    onClick={() => navigate('/absences')}
                >
                    + דיווח חדש
                </button>
            </div>

            <div className="home-page__content">
                {isLoading && (
                    <div className="home-page__loading">טוען נתונים...</div>
                )}

                {error && (
                    <div className="home-page__error">
                        שגיאה בטעינת הנתונים: {String(error)}
                    </div>
                )}

                {data && data.items && data.items.length === 0 && !isLoading && (
                    <div className="home-page__empty">
                        <p>אין היעדרויות רשומות</p>
                        <button
                            type="button"
                            className="home-page__empty-btn"
                            onClick={() => navigate('/absences')}
                        >
                            צור דיווח ראשון
                        </button>
                    </div>
                )}

                {data && data.items && data.items.length > 0 && (
                    <div className="home-page__list">
                        <table className="absences-table">
                            <thead>
                                <tr>
                                    <th>תאריך התחלה</th>
                                    <th>תאריך סיום</th>
                                    <th>משך</th>
                                    <th>סוג</th>
                                    <th>חצי יום</th>
                                    <th>סטטוס</th>
                                    <th>ימי העדרות</th>
                                    <th>הערות</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.items.map((absence) => (
                                    <tr key={absence.id}>
                                        <td>{formatDate(absence.startDate)}</td>
                                        <td>{formatDate(absence.endDate)}</td>
                                        <td>
                                            {calculateDuration(absence.startDate, absence.endDate)} ימים
                                        </td>
                                        <td>
                                            <span className={`type-badge type-badge--${absence.type.toLowerCase()}`}>
                                                {getAbsenceTypeLabel(absence.type)}
                                            </span>
                                        </td>
                                        <td>{absence.isHalfDay ? '✓' : '-'}</td>
                                        <td>
                                            <span className={`status-badge ${getAbsenceStatusClass(absence.status)}`}>
                                                {getAbsenceStatusLabel(absence.status)}
                                            </span>
                                        </td>
                                        <td>
                                            {absence.absenceDays?.length || 0} ימים
                                        </td>
                                        <td className="note-cell">
                                            {absence.note || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {data && data.pagination && (
                    <div className="home-page__pagination">
                        <div className="pagination-info">
                            מציג {data.items.length} מתוך {data.pagination.total} היעדרויות
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
