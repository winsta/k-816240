import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Badge } from './ui/badge';
import { format } from 'date-fns';
import { Checkbox } from './ui/checkbox';
import { ListPlus } from 'lucide-react';
import { Button } from './ui/button';

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
  onAddSubtask: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
}

const Card = ({ 
  id, 
  index, 
  content, 
  priority, 
  dueDate, 
  tags, 
  subtasks,
  onAddSubtask,
  onToggleSubtask 
}: CardProps) => {
  return (
    <Draggable draggableId={id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`p-4 mb-3 rounded-lg bg-kanban-card shadow-sm hover:shadow-md transition-shadow duration-200 select-none space-y-2 ${
            snapshot.isDragging ? 'shadow-lg' : ''
          }`}
        >
          <p className="text-sm text-gray-700 cursor-default">{content}</p>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={priorityColors[priority]}>
              {priority}
            </Badge>
            {dueDate && (
              <Badge variant="outline">
                Due {format(dueDate, 'MMM d')}
              </Badge>
            )}
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-800">
                  {tag}
                </Badge>
              ))}
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

export default Card;