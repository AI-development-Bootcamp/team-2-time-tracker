/**
 * @fileoverview FrequentSelectors Component
 * 
 * Provides a cascading dropdown interface for selecting Client -> Project -> Task.
 * Features:
 * - Sort options: Most frequently used (default) or Alphabetical.
 * - Auto-selection: Automatically selects an option if it's the only one available (and user hasn't manually overridden).
 * - State Management: Handles dependencies between specific dropdowns (e.g., clearing project when client changes).
 */

import React, { useState, useEffect } from 'react';
import { selectorsApi } from '@client/api-client';
import { ClientSelectorDto, ProjectSelectorDto, TaskSelectorDto } from '@shared/types';
import './FrequentSelectors.css';

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
 * FrequentSelectors Component
 * 
 * Renders three dependent select inputs for hierarchical data selection.
 * Handles data fetching from the API based on current selections and sort preference.
 * 
 * @param {FrequentSelectorsProps} props - Component props
 */
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

    // Data from API
    const [clients, setClients] = useState<ClientSelectorDto[]>([]);
    const [projects, setProjects] = useState<ProjectSelectorDto[]>([]);
    const [tasks, setTasks] = useState<TaskSelectorDto[]>([]);

    // Loading states
    const [loadingClients, setLoadingClients] = useState(false);
    const [loadingProjects, setLoadingProjects] = useState(false);
    const [loadingTasks, setLoadingTasks] = useState(false);

    // Track manual overrides to prevent auto-select from overriding user choices
    const [manualOverrides, setManualOverrides] = useState({
        client: false,
        project: false,
        task: false,
    });

    /**
     * @description Fetch clients from API whenever sort mode changes
     */
    useEffect(() => {
        const fetchClients = async () => {
            setLoadingClients(true);
            try {
                const data = await selectorsApi.getClients(sortMode);
                setClients(data);
            } catch (error) {
                console.error('Failed to fetch clients:', error);
            } finally {
                setLoadingClients(false);
            }
        };
        fetchClients();
    }, [sortMode]);

    /**
     * @description Fetch projects when the selected client changes
     */
    useEffect(() => {
        if (!clientId) {
            setProjects([]);
            return;
        }

        const fetchProjects = async () => {
            setLoadingProjects(true);
            try {
                const data = await selectorsApi.getProjects(clientId, sortMode);
                setProjects(data);
            } catch (error) {
                console.error('Failed to fetch projects:', error);
            } finally {
                setLoadingProjects(false);
            }
        };
        fetchProjects();
    }, [clientId, sortMode]);

    /**
     * @description Fetch tasks when the selected project changes
     */
    useEffect(() => {
        if (!projectId) {
            setTasks([]);
            return;
        }

        const fetchTasks = async () => {
            setLoadingTasks(true);
            try {
                const data = await selectorsApi.getTasks(projectId, sortMode);
                setTasks(data);
            } catch (error) {
                console.error('Failed to fetch tasks:', error);
            } finally {
                setLoadingTasks(false);
            }
        };
        fetchTasks();
    }, [projectId, sortMode]);

    /**
     * Helper function to auto-select an option if it's the single available choice.
     * Prevents auto-selection if the user has explicitly interacted with this level before.
     * 
     * @param items - List of available options
     * @param currentValue - Currently selected value (if any)
     * @param setValue - State setter function
     * @param level - The hierarchy level ('client', 'project', 'task')
     */
    const autoSelectSingle = (
        items: any[],
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
     * Handles changes to the Client dropdown.
     * Resets Project and Task selections.
     */
    const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value || null;
        setClientId(value);
        setProjectId(null); // Reset children
        setTaskId(null);
        setManualOverrides(prev => ({ ...prev, client: true, project: false, task: false }));
    };

    /**
     * Handles changes to the Project dropdown.
     * Resets Task selection.
     */
    const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value || null;
        setProjectId(value);
        setTaskId(null); // Reset children
        setManualOverrides(prev => ({ ...prev, project: true, task: false }));
    };

    /**
     * Handles changes to the Task dropdown.
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
                        disabled={disabled || loadingClients}
                    >
                        <option value="">{loadingClients ? 'טוען...' : 'בחר לקוח...'}</option>
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
                        disabled={disabled || !clientId || loadingProjects}
                    >
                        <option value="">{loadingProjects ? 'טוען...' : 'בחר פרויקט...'}</option>
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
                        disabled={disabled || !projectId || loadingTasks}
                    >
                        <option value="">{loadingTasks ? 'טוען...' : 'בחר משימה...'}</option>
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
