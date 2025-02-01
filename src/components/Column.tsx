import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import Card from './Card';

interface ColumnProps {
  id: string;
  title: string;
  cards: Array<{ id: string; content: string }>;
}

const Column = ({ id, title, cards }: ColumnProps) => {
  return (
    <div className="w-72 mx-2 flex flex-col">
      <h2 className="font-semibold mb-4 text-gray-700">{title}</h2>
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-4 rounded-lg bg-kanban-column min-h-[150px] ${
              snapshot.isDraggingOver ? 'bg-kanban-columnHover' : ''
            }`}
          >
            {cards.map((card, index) => (
              <Card key={card.id} id={card.id} index={index} content={card.content} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default Column;