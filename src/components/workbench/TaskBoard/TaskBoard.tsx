import { Window } from '../../containers/Window';
import { Button } from '../../primitives/Button';
import './TaskBoard.css';

export type TaskStatus = 'todo' | 'doing' | 'done';

export interface Task {
  id: string;
  title: string;
  col: TaskStatus;
  who: string;
}

export interface TaskBoardProps {
  tasks: readonly Task[];
  /** List of team members to calculate open tasks per person. */
  team: readonly string[];
  onMove: (id: string, direction: -1 | 1) => void;
  onDelete: (id: string) => void;
  className?: string;
}

const COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: 'todo', label: 'To do' },
  { id: 'doing', label: 'Doing' },
  { id: 'done', label: 'Done' },
];

export function TaskBoard({ tasks, team, onMove, onDelete, className }: TaskBoardProps) {
  return (
    <div className={['amees-task-board', className].filter(Boolean).join(' ')}>
      {team.length > 0 && (
        <div className="amees-task-board__roster">
          <span className="amees-task-board__roster-label">Open tasks per person:</span>
          {team.map(person => {
            const count = tasks.filter(t => t.who === person && t.col !== 'done').length;
            return (
              <span key={person} className="amees-task-board__person">
                {person} <b>· {count}</b>
              </span>
            );
          })}
        </div>
      )}

      <div className="amees-task-board__grid">
        {COLUMNS.map(col => {
          const colTasks = tasks.filter(t => t.col === col.id);
          return (
            <Window key={col.id} title={col.label} meta={String(colTasks.length)}>
              <div className="amees-task-board__col">
                {colTasks.length === 0 ? (
                  <p className="amees-task-board__empty">No tasks here.</p>
                ) : (
                  colTasks.map(task => (
                    <div key={task.id} className="amees-task-card">
                      <div className="amees-task-card__title">{task.title}</div>
                      <div className="amees-task-card__footer">
                        <span className="amees-task-card__who">{task.who}</span>
                        <div className="amees-task-card__actions">
                          {col.id !== 'todo' && (
                            <Button 
                              size="sm" 
                              onClick={() => onMove(task.id, -1)}
                              aria-label="Move left"
                              title="Move left"
                            >
                              ←
                            </Button>
                          )}
                          {col.id !== 'done' && (
                            <Button 
                              size="sm" 
                              onClick={() => onMove(task.id, 1)}
                              aria-label="Move right"
                              title="Move right"
                            >
                              →
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            onClick={() => onDelete(task.id)}
                            aria-label="Delete task"
                            title="Delete task"
                          >
                            ✕
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Window>
          );
        })}
      </div>
    </div>
  );
}