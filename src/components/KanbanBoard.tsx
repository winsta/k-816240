import React, { useState } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import Column from './Column';

interface KanbanData {
  [key: string]: {
    title: string;
    items: Array<{ id: string; content: string }>;
  };
}

const initialData: KanbanData = {
  todo: {
    title: 'To Do',
    items: [
      { id: 'task-1', content: 'Create project documentation' },
      { id: 'task-2', content: 'Design user interface' },
      { id: 'task-3', content: 'Implement authentication' },
    ],
  },
  inProgress: {
    title: 'In Progress',
    items: [
      { id: 'task-4', content: 'Develop API endpoints' },
      { id: 'task-5', content: 'Write unit tests' },
    ],
  },
  done: {
    title: 'Done',
    items: [
      { id: 'task-6', content: 'Project setup' },
      { id: 'task-7', content: 'Initial planning' },
    ],
  },
};

const KanbanBoard = () => {
  const [columns, setColumns] = useState<KanbanData>(initialData);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;

    if (source.droppableId === destination.droppableId) {
      const column = columns[source.droppableId];
      const copiedItems = [...column.items];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);

      setColumns({
        ...columns,
        [source.droppableId]: {
          ...column,
          items: copiedItems,
        },
      });
    } else {
      const sourceColumn = columns[source.droppableId];
      const destColumn = columns[destination.droppableId];
      const sourceItems = [...sourceColumn.items];
      const destItems = [...destColumn.items];
      const [removed] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, removed);

      setColumns({
        ...columns,
        [source.droppableId]: {
          ...sourceColumn,
          items: sourceItems,
        },
        [destination.droppableId]: {
          ...destColumn,
          items: destItems,
        },
      });
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex flex-col items-center min-h-screen bg-gray-50 p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Project Tasks</h1>
        <div className="flex flex-wrap justify-center gap-4">
          {Object.entries(columns).map(([columnId, column]) => (
            <Column
              key={columnId}
              id={columnId}
              title={column.title}
              cards={column.items}
            />
          ))}
        </div>
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;