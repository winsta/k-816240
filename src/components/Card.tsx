import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Badge } from './ui/badge';
import { format } from 'date-fns';

interface CardProps {
  id: string;
  index: number;
  content: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  tags: string[];
}

const priorityColors = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
};

const Card = ({ id, index, content, priority, dueDate, tags }: CardProps) => {
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
        </div>
      )}
    </Draggable>
  );
};

export default Card;