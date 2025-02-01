import React from 'react';
import { Draggable } from 'react-beautiful-dnd';

interface CardProps {
  id: string;
  index: number;
  content: string;
}

const Card = ({ id, index, content }: CardProps) => {
  return (
    <Draggable draggableId={id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`p-4 mb-3 rounded-lg bg-kanban-card shadow-sm hover:shadow-md transition-shadow duration-200 ${
            snapshot.isDragging ? 'shadow-lg' : ''
          }`}
        >
          <p className="text-sm text-gray-700">{content}</p>
        </div>
      )}
    </Draggable>
  );
};

export default Card;