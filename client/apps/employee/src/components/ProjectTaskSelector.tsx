import { useState, useEffect } from 'react';
import { selectorsApi } from '@client/api-client';
import { ClientSelectorDto, ProjectSelectorDto, TaskSelectorDto } from '@shared/types';
import { Button } from '@client/ui';
import './ProjectTaskSelector.css';

interface ProjectTaskSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onTaskSelected: (taskId: string, taskName: string) => void;
}

type Step = 'projects' | 'tasks';

interface GroupedProjects {
    clientId: string;
    clientName: string;
    projects: ProjectSelectorDto[];
}

export function ProjectTaskSelector({ isOpen, onClose, onTaskSelected }: ProjectTaskSelectorProps) {
    const [step, setStep] = useState<Step>('projects');
    const [loading, setLoading] = useState(false);

    // Data
    const [clients, setClients] = useState<ClientSelectorDto[]>([]);
    const [projects, setProjects] = useState<ProjectSelectorDto[]>([]);
    const [tasks, setTasks] = useState<TaskSelectorDto[]>([]);

    // Selection
    const [selectedProject, setSelectedProject] = useState<ProjectSelectorDto | null>(null);

    // Fetch clients and projects when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchProjectsAndClients();
        }
    }, [isOpen]);

    const fetchProjectsAndClients = async () => {
        setLoading(true);
        try {
            const [clientsData, projectsData] = await Promise.all([
                selectorsApi.getClients(),
                selectorsApi.getProjects()
            ]);
            setClients(clientsData);
            setProjects(projectsData);
        } catch (error) {
            console.error('Failed to fetch projects/clients:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTasksForProject = async (projectId: string) => {
        setLoading(true);
        try {
            const tasksData = await selectorsApi.getTasks(projectId);
            setTasks(tasksData);
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    // Group projects by client
    const groupedProjects: GroupedProjects[] = clients.map(client => ({
        clientId: client.id,
        clientName: client.name,
        projects: projects.filter(p => p.clientId === client.id)
    })).filter(group => group.projects.length > 0);

    const handleProjectSelect = async (project: ProjectSelectorDto) => {
        setSelectedProject(project);
        await fetchTasksForProject(project.id);
        setStep('tasks');
    };

    const handleTaskSelect = (task: TaskSelectorDto) => {
        onTaskSelected(task.id, task.name);
        handleClose();
    };

    const handleBack = () => {
        if (step === 'tasks') {
            setStep('projects');
            setSelectedProject(null);
            setTasks([]);
        }
    };

    const handleClose = () => {
        setStep('projects');
        setSelectedProject(null);
        setTasks([]);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="project-task-selector-overlay">
            <div className="project-task-selector">
                {/* Header */}
                <div className="project-task-selector__header">
                    <button className="project-task-selector__close" onClick={handleClose}>
                        ×
                    </button>
                    <h2 className="project-task-selector__title">
                        {step === 'projects' ? 'בחר פרויקט' : 'בחר משימה'}
                    </h2>
                    {step === 'tasks' && (
                        <button className="project-task-selector__back" onClick={handleBack}>
                            ←
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="project-task-selector__content">
                    {loading ? (
                        <div className="project-task-selector__loading">טוען...</div>
                    ) : (
                        <>
                            {step === 'projects' && (
                                <div className="project-task-selector__projects">
                                    {groupedProjects.map(group => (
                                        <div key={group.clientId} className="project-task-selector__client-group">
                                            <div className="project-task-selector__client-header">
                                                {group.clientName}
                                            </div>
                                            <div className="project-task-selector__project-list">
                                                {group.projects.map(project => (
                                                    <button
                                                        key={project.id}
                                                        className="project-task-selector__item"
                                                        onClick={() => handleProjectSelect(project)}
                                                    >
                                                        {project.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {step === 'tasks' && (
                                <div className="project-task-selector__tasks">
                                    <div className="project-task-selector__selected-project">
                                        {selectedProject?.name}
                                    </div>
                                    <div className="project-task-selector__task-list">
                                        {tasks.map(task => (
                                            <button
                                                key={task.id}
                                                className="project-task-selector__item"
                                                onClick={() => handleTaskSelect(task)}
                                            >
                                                {task.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="project-task-selector__footer">
                    <Button variant="ghost" onClick={handleClose}>
                        סגירה
                    </Button>
                </div>
            </div>
        </div>
    );
}
