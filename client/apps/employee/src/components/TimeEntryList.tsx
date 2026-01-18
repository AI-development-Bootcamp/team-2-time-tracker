import React from 'react';
import { TimeEntryDto } from '@shared/types';
import { Button } from '@client/ui';
import './TimeEntryList.css';

interface TimeEntryListProps {
    entries: TimeEntryDto[];
    onEdit: (entry: TimeEntryDto) => void;
    onDelete: (entry: TimeEntryDto) => void;
}

export const TimeEntryList: React.FC<TimeEntryListProps> = ({
    entries,
    onEdit,
    onDelete,
}) => {
    if (entries.length === 0) {
        return <div className="time-entry-list__empty">No entries found.</div>;
    }

    return (
        <div className="time-entry-list">
            {entries.map((entry) => (
                <div key={entry.id} className="time-entry-item">
                    <div className="time-entry-item__info">
                        <span className="time-entry-item__project">
                            {entry.task.project.name} • {entry.task.client.name}
                        </span>
                        <span className="time-entry-item__task">
                            {entry.task.name}
                        </span>
                        {entry.description && (
                            <span className="time-entry-item__description" title={entry.description}>
                                {entry.description.length > 50
                                    ? `${entry.description.substring(0, 50)}...`
                                    : entry.description}
                            </span>
                        )}
                    </div>

                    <div className="time-entry-item__time">
                        <span className="time-entry-item__duration">
                            {formatDuration(entry.durationMinutes)}
                        </span>
                        <span className="time-entry-item__range">
                            {entry.startTime} - {entry.endTime}
                        </span>
                    </div>

                    <div className="time-entry-item__actions">
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => onEdit(entry)}
                        >
                            Edit
                        </Button>
                        <Button
                            size="sm"
                            variant="danger"
                            onClick={() => onDelete(entry)}
                        >
                            Delete
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
};

function formatDuration(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}
