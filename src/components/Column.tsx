import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import Card from './Card';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';

interface Task {
  id: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  tags: string[];
}

interface ColumnProps {
  id: string;
  title: string;
  cards: Task[];
  onAddTask: () => void;
}

const Column = ({ id, title, cards, onAddTask }: ColumnProps) => {
  return (
    <div className="w-72 mx-2 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-gray-700">{title}</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onAddTask}
          className="hover:bg-gray-100"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
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
              <Card 
                key={card.id} 
                id={card.id} 
                index={index} 
                content={card.content}
                priority={card.priority}
                dueDate={card.dueDate}
                tags={card.tags}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default Column;