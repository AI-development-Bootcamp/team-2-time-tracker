import React, { useState, useEffect } from 'react';
import './FrequentSelectors.css';

/**
 * Selector item interface for dropdown options
 */
interface SelectorItem {
    id: string;
    name: string;
    usageCount: number;
}

/**
 * Client selector item
 */
interface ClientSelector extends SelectorItem {
    // No additional fields
}

/**
 * Project selector item
 */
interface ProjectSelector extends SelectorItem {
    clientId: string;
}

/**
 * Task selector item
 */
interface TaskSelector extends SelectorItem {
    projectId: string;
}

/**
 * Selection state interface
 */
export interface FrequentSelectorsValue {
    clientId: string | null;
    projectId: string | null;
    taskId: string | null;
}

/**
 * Props for FrequentSelectors component
 */
export interface FrequentSelectorsProps {
    /** Callback when selection changes */
    onSelectionChange: (selection: FrequentSelectorsValue) => void;
    /** Initial selection values */
    initialSelection?: Partial<FrequentSelectorsValue>;
    /** Disable all selectors */
    disabled?: boolean;
}

/**
 * Sort mode for dropdowns
 */
type SortMode = 'frequency' | 'alpha';

/**
 * @description FrequentSelectors component - Cascading dropdowns for Client -> Project -> Task selection
 * with auto-select and frequency sorting features
 * 
 * @param {FrequentSelectorsProps} props - Component props
 * @returns {JSX.Element} FrequentSelectors component
 * 
 * @example
 *   initialSelection={{ clientId: 'abc-123' }}
 * />
 */

// TODO: Replace with actual API calls when backend is ready (tasks 5.1-5.12)
// Mock data for testing - this simulates the expected API response format
const mockClients: ClientSelector[] = [
    { id: '550e8400-e29b-41d4-a716-446655440001', name: 'לקוח א', usageCount: 45 },
    { id: '550e8400-e29b-41d4-a716-446655440002', name: 'לקוח ב', usageCount: 30 },
    { id: '550e8400-e29b-41d4-a716-446655440003', name: 'לקוח ג', usageCount: 15 },
];

const mockProjects: ProjectSelector[] = [
    { id: '550e8400-e29b-41d4-a716-446655440011', name: 'פרויקט 1', clientId: '550e8400-e29b-41d4-a716-446655440001', usageCount: 25 },
    { id: '550e8400-e29b-41d4-a716-446655440012', name: 'פרויקט 2', clientId: '550e8400-e29b-41d4-a716-446655440001', usageCount: 20 },
    { id: '550e8400-e29b-41d4-a716-446655440013', name: 'פרויקט 3', clientId: '550e8400-e29b-41d4-a716-446655440002', usageCount: 18 },
    { id: '550e8400-e29b-41d4-a716-446655440014', name: 'פרויקט 4', clientId: '550e8400-e29b-41d4-a716-446655440003', usageCount: 10 },
];

const mockTasks: TaskSelector[] = [
    { id: '550e8400-e29b-41d4-a716-446655440111', name: 'משימה 1', projectId: '550e8400-e29b-41d4-a716-446655440011', usageCount: 15 },
    { id: '550e8400-e29b-41d4-a716-446655440112', name: 'משימה 2', projectId: '550e8400-e29b-41d4-a716-446655440011', usageCount: 10 },
    { id: '550e8400-e29b-41d4-a716-446655440113', name: 'משימה 3', projectId: '550e8400-e29b-41d4-a716-446655440012', usageCount: 12 },
    { id: '550e8400-e29b-41d4-a716-446655440114', name: 'משימה 4', projectId: '550e8400-e29b-41d4-a716-446655440013', usageCount: 9 },
    { id: '550e8400-e29b-41d4-a716-446655440115', name: 'משימה 5', projectId: '550e8400-e29b-41d4-a716-446655440014', usageCount: 6 },
];

export const FrequentSelectors: React.FC<FrequentSelectorsProps> = ({
    onSelectionChange,
    initialSelection = {},
    disabled = false,
}) => {
    // State
    const [clientId, setClientId] = useState<string | null>(initialSelection.clientId || null);
    const [projectId, setProjectId] = useState<string | null>(initialSelection.projectId || null);
    const [taskId, setTaskId] = useState<string | null>(initialSelection.taskId || null);
    const [sortMode, setSortMode] = useState<SortMode>('frequency');

    // Track manual overrides to prevent auto-select from overriding user choices
    const [manualOverrides, setManualOverrides] = useState({
        client: false,
        project: false,
        task: false,
    });

    /**
     * @description Sort items based on current sort mode
     * @param {SelectorItem[]} items - Items to sort
     * @returns {SelectorItem[]} Sorted items
     */
    const sortItems = <T extends SelectorItem>(items: T[]): T[] => {
        if (sortMode === 'frequency') {
            return [...items].sort((a, b) => b.usageCount - a.usageCount);
        }
        return [...items].sort((a, b) => a.name.localeCompare(b.name, 'he'));
    };

    /**
     * @description Get filtered and sorted clients
     */
    const clients = React.useMemo(() => {
        return sortItems(mockClients);
    }, [sortMode]);

    /**
     * @description Get filtered and sorted projects for selected client
     */
    const projects = React.useMemo(() => {
        if (!clientId) return [];
        const filtered = mockProjects.filter(p => p.clientId === clientId);
        return sortItems(filtered);
    }, [clientId, sortMode]);

    /**
     * @description Get filtered and sorted tasks for selected project
     */
    const tasks = React.useMemo(() => {
        if (!projectId) return [];
        const filtered = mockTasks.filter(t => t.projectId === projectId);
        return sortItems(filtered);
    }, [projectId, sortMode]);

    /**
     * @description Auto-select when only one option is available
     * @param {SelectorItem[]} items - Items to check
     * @param {string | null} currentValue - Current selected value
     * @param {(value: string) => void} setValue - Setter function
     * @param {'client' | 'project' | 'task'} level - Selection level
     */
    const autoSelectSingle = (
        items: SelectorItem[],
        currentValue: string | null,
        setValue: (value: string) => void,
        level: 'client' | 'project' | 'task'
    ) => {
        // Don't auto-select if user manually overrode
        if (manualOverrides[level]) return;

        // Don't auto-select if already selected
        if (currentValue) return;

        // Auto-select if exactly one option
        if (items.length === 1) {
            setValue(items[0].id);
        }
    };

    /**
     * @description Handle client selection change
     */
    const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value || null;
        setClientId(value);
        setProjectId(null); // Reset children
        setTaskId(null);
        setManualOverrides(prev => ({ ...prev, client: true, project: false, task: false }));
    };

    /**
     * @description Handle project selection change
     */
    const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value || null;
        setProjectId(value);
        setTaskId(null); // Reset children
        setManualOverrides(prev => ({ ...prev, project: true, task: false }));
    };

    /**
     * @description Handle task selection change
     */
    const handleTaskChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value || null;
        setTaskId(value);
        setManualOverrides(prev => ({ ...prev, task: true }));
    };

    /**
     * @description Toggle sort mode between frequency and alphabetical
     */
    const toggleSortMode = () => {
        setSortMode(prev => prev === 'frequency' ? 'alpha' : 'frequency');
    };

    // Effect: Auto-select clients when data loads
    useEffect(() => {
        autoSelectSingle(clients, clientId, setClientId, 'client');
    }, [clients, clientId]); // Depend on memoized clients

    // Effect: Auto-select projects when client changes
    useEffect(() => {
        if (clientId) {
            autoSelectSingle(projects, projectId, setProjectId, 'project');
        }
    }, [projects, projectId, clientId]); // Depend on memoized projects

    // Effect: Auto-select tasks when project changes
    useEffect(() => {
        if (projectId) {
            autoSelectSingle(tasks, taskId, setTaskId, 'task');
        }
    }, [tasks, taskId, projectId]); // Depend on memoized tasks

    // Effect: Notify parent of selection changes
    useEffect(() => {
        onSelectionChange({ clientId, projectId, taskId });
    }, [clientId, projectId, taskId, onSelectionChange]);

    return (
        <div className="frequent-selectors">
            <div className="frequent-selectors__header">
                <h3 className="frequent-selectors__title">בחירת משימה</h3>
                <button
                    type="button"
                    className="frequent-selectors__sort-toggle"
                    onClick={toggleSortMode}
                    disabled={disabled}
                    aria-label={sortMode === 'frequency' ? 'מיון לפי תדירות' : 'מיון אלפביתי'}
                >
                    {sortMode === 'frequency' ? '🔥 תדיר' : '🔤 א-ב'}
                </button>
            </div>

            <div className="frequent-selectors__dropdowns">
                {/* Client Selector */}
                <div className="frequent-selectors__field">
                    <label htmlFor="client-select" className="frequent-selectors__label">
                        לקוח
                    </label>
                    <select
                        id="client-select"
                        className="frequent-selectors__dropdown"
                        value={clientId || ''}
                        onChange={handleClientChange}
                        disabled={disabled || clients.length === 0}
                    >
                        <option value="">בחר לקוח...</option>
                        {clients.map(client => (
                            <option key={client.id} value={client.id}>
                                {client.name}
                                {sortMode === 'frequency' && ` (${client.usageCount})`}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Project Selector */}
                <div className="frequent-selectors__field">
                    <label htmlFor="project-select" className="frequent-selectors__label">
                        פרויקט
                    </label>
                    <select
                        id="project-select"
                        className="frequent-selectors__dropdown"
                        value={projectId || ''}
                        onChange={handleProjectChange}
                        disabled={disabled || !clientId || projects.length === 0}
                    >
                        <option value="">בחר פרויקט...</option>
                        {projects.map(project => (
                            <option key={project.id} value={project.id}>
                                {project.name}
                                {sortMode === 'frequency' && ` (${project.usageCount})`}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Task Selector */}
                <div className="frequent-selectors__field">
                    <label htmlFor="task-select" className="frequent-selectors__label">
                        משימה
                    </label>
                    <select
                        id="task-select"
                        className="frequent-selectors__dropdown"
                        value={taskId || ''}
                        onChange={handleTaskChange}
                        disabled={disabled || !projectId || tasks.length === 0}
                    >
                        <option value="">בחר משימה...</option>
                        {tasks.map(task => (
                            <option key={task.id} value={task.id}>
                                {task.name}
                                {sortMode === 'frequency' && ` (${task.usageCount})`}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};
