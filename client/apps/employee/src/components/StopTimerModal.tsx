import { useState, useEffect, FormEvent } from 'react';
import { selectorsApi } from '@client/api-client';
import { TaskSelectorDto, WorkLocation } from '@shared/types';
import './StopTimerModal.css';

interface StopTimerModalProps {
    isOpen: boolean;
    isLoading: boolean;
    onClose: () => void;
    onConfirm: (data: { taskId: string; location: WorkLocation; description: string }) => void;
}

export function StopTimerModal({ isOpen, isLoading, onClose, onConfirm }: StopTimerModalProps) {
    const [tasks, setTasks] = useState<TaskSelectorDto[]>([]);
    const [taskId, setTaskId] = useState('');
    const [location, setLocation] = useState<WorkLocation>(WorkLocation.OFFICE);
    const [description, setDescription] = useState('');
    const [loadingTasks, setLoadingTasks] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setLoadingTasks(true);
            selectorsApi.getTasks()
                .then((data: TaskSelectorDto[]) => setTasks(data))
                .catch(console.error)
                .finally(() => setLoadingTasks(false));
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onConfirm({ taskId, location, description });
    };

    return (
        <div className="stop-timer-modal-overlay">
            <div className="stop-timer-modal">
                <h2>עצור טיימר</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>משימה</label>
                        <select
                            value={taskId}
                            onChange={(e) => setTaskId(e.target.value)}
                            required
                            disabled={loadingTasks}
                        >
                            <option value="">בחר משימה</option>
                            {tasks.map(task => (
                                <option key={task.id} value={task.id}>
                                    {task.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>מיקום</label>
                        <select
                            value={location}
                            onChange={(e) => setLocation(e.target.value as WorkLocation)}
                            required
                        >
                            <option value={WorkLocation.OFFICE}>משרד</option>
                            <option value={WorkLocation.HOME}>בית</option>
                            <option value={WorkLocation.CLIENT}>לקוח</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>תיאור</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            placeholder="מה עשית?"
                            required
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} disabled={isLoading}>ביטול</button>
                        <button type="submit" disabled={isLoading || !taskId || !description} className="submit-btn">
                            {isLoading ? 'שומר...' : 'עצור ושמור'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
