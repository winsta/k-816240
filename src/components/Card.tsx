import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Badge } from './ui/badge';
import { format, differenceInDays } from 'date-fns';
import { Checkbox } from './ui/checkbox';
import { ListPlus, AlertCircle, Edit, ChevronRight, ChevronDown, Users, Receipt, Upload } from 'lucide-react';
import { Button } from './ui/button';

interface ClientInfo {
  contactNumber: string;
  email: string;
  companyName: string;
  address: string;
}

interface TeamMember {
  id: string;
  name: string;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
}

interface Subtask {
  id: string;
  content: string;
  completed: boolean;
}

interface CardProps {
  id: string;
  index: number;
  content: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  tags: string[];
  subtasks: Subtask[];
  clientName: string;
  clientInfo?: ClientInfo;
  projectName: string;
  isExpanded?: boolean;
  parentId?: string;
  columnId: string;
  totalCost?: number;
  expenses?: Expense[];
  assignedTeam?: TeamMember[];
  status: 'not-started' | 'in-progress' | 'completed';
  notes?: string;
  attachments?: string[];
  onAddSubtask: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onEditTask: (columnId: string, taskId: string) => void;
  onToggleExpand?: (taskId: string) => void;
}

const Card = ({ 
  id, 
  index, 
  content, 
  priority, 
  dueDate, 
  tags, 
  subtasks,
  clientName,
  clientInfo,
  projectName,
  isExpanded,
  parentId,
  columnId,
  totalCost,
  expenses,
  assignedTeam,
  status,
  notes,
  attachments,
  onAddSubtask,
  onToggleSubtask,
  onEditTask,
  onToggleExpand
}: CardProps) => {
  const getRemainingDays = () => {
    if (!dueDate) return null;
    const today = new Date();
    const days = differenceInDays(dueDate, today);
    return days;
  };

  const getDueDateStatus = () => {
    const days = getRemainingDays();
    if (days === null) return null;
    if (days < 0) return 'overdue';
    if (days === 0) return 'due-today';
    if (days <= 3) return 'upcoming';
    return 'future';
  };

  const dueDateStatus = getDueDateStatus();

  const statusColors = {
    'not-started': 'bg-gray-100 text-gray-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    'completed': 'bg-green-100 text-green-800',
  };

  return (
    <Draggable draggableId={id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`p-4 mb-3 rounded-lg bg-kanban-card shadow-sm hover:shadow-md transition-shadow duration-200 select-none space-y-2 ${
            snapshot.isDragging ? 'shadow-lg' : ''
          } ${parentId ? 'ml-6 border-l-2 border-gray-200' : ''}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {subtasks.length > 0 && onToggleExpand && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 hover:bg-transparent"
                  onClick={() => onToggleExpand(id)}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              )}
              <div className="flex-1">
                {clientName && (
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500">
                      Client: {clientName}
                    </div>
                    {clientInfo && (
                      <div className="text-xs text-gray-500">
                        <div>{clientInfo.companyName}</div>
                        <div>{clientInfo.email}</div>
                        <div>{clientInfo.contactNumber}</div>
                      </div>
                    )}
                  </div>
                )}
                {projectName && (
                  <div className="text-xs text-gray-500">
                    Project: {projectName}
                  </div>
                )}
                <p className="text-sm text-gray-700 cursor-default">{content}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditTask(columnId, id)}
              className="ml-2"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className={priorityColors[priority]}>
              {priority}
            </Badge>
            <Badge variant="secondary" className={statusColors[status]}>
              {status.replace('-', ' ')}
            </Badge>
            {dueDate && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={dueDateColors[dueDateStatus || 'future']}>
                  Due {format(dueDate, 'MMM d')}
                </Badge>
                {dueDateStatus && dueDateStatus !== 'future' && (
                  <Badge variant="outline" className={dueDateColors[dueDateStatus]}>
                    {dueDateStatus === 'overdue' && (
                      <>
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {Math.abs(getRemainingDays()!)} days overdue
                      </>
                    )}
                    {dueDateStatus === 'due-today' && 'Due today'}
                    {dueDateStatus === 'upcoming' && `${getRemainingDays()} days left`}
                  </Badge>
                )}
              </div>
            )}
          </div>

          {totalCost !== undefined && (
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Total Cost: ${totalCost.toLocaleString()}
              </span>
            </div>
          )}

          {assignedTeam && assignedTeam.length > 0 && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <div className="flex flex-wrap gap-1">
                {assignedTeam.map((member) => (
                  <Badge key={member.id} variant="outline" className="text-xs">
                    {member.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-800">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {notes && (
            <div className="text-sm text-gray-600 mt-2">
              <p className="line-clamp-2">{notes}</p>
            </div>
          )}

          {attachments && attachments.length > 0 && (
            <div className="flex items-center gap-2">
              <Upload className="h-4 w-4 text-gray-500" />
              <div className="flex flex-wrap gap-1">
                {attachments.map((attachment, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {attachment}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            {subtasks.map((subtask) => (
              <div key={subtask.id} className="flex items-center space-x-2">
                <Checkbox
                  id={subtask.id}
                  checked={subtask.completed}
                  onCheckedChange={() => onToggleSubtask(id, subtask.id)}
                />
                <label
                  htmlFor={subtask.id}
                  className={`text-sm ${subtask.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}
                >
                  {subtask.content}
                </label>
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAddSubtask(id)}
              className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ListPlus className="h-4 w-4" />
              Add Subtask
            </Button>
          </div>
        </div>
      )}
    </Draggable>
  );
};

const priorityColors = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
};

const dueDateColors = {
  'overdue': 'bg-red-100 text-red-800',
  'due-today': 'bg-yellow-100 text-yellow-800',
  'upcoming': 'bg-orange-100 text-orange-800',
  'future': 'bg-green-100 text-green-800',
};

export default Card;
