import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import Card from './Card';
import { Button } from './ui/button';
import { Plus, ChevronRight, ChevronDown } from 'lucide-react';

interface Subtask {
  id: string;
  content: string;
  completed: boolean;
}

interface ClientInfo {
  contactNumber: string;
  email: string;
  companyName: string;
  address: string;
}

interface Task {
  id: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  tags: string[];
  subtasks: Subtask[];
  clientName: string;
  clientInfo?: ClientInfo;
  projectName: string;
  parentId?: string;
  isExpanded?: boolean;
  status: 'not-started' | 'in-progress' | 'completed';
  totalCost?: number;
  expenses?: { id: string; description: string; amount: number; }[];
  assignedTeam?: { id: string; name: string; }[];
  attachments?: string[];
  notes?: string;
}

interface ColumnProps {
  id: string;
  title: string;
  cards: Task[];
  onAddTask: () => void;
  onAddSubtask: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onEditTask: (columnId: string, taskId: string) => void;
  onToggleExpand?: (taskId: string) => void;
}

const Column = ({ 
  id, 
  title, 
  cards, 
  onAddTask, 
  onAddSubtask, 
  onToggleSubtask,
  onEditTask,
  onToggleExpand
}: ColumnProps) => {
  const renderCards = (cardsToRender: Task[], level = 0) => {
    return cardsToRender
      .filter(card => !card.parentId) // Only render top-level cards
      .map((card, index) => {
        const childCards = cardsToRender.filter(c => c.parentId === card.id);
        const hasChildren = childCards.length > 0;

        return (
          <div key={card.id} className="space-y-2">
            <div className="flex items-start">
              {hasChildren && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 h-6 w-6 mr-1"
                  onClick={() => onToggleExpand?.(card.id)}
                >
                  {card.isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              )}
              <div className={`flex-1 ${level > 0 ? 'ml-6' : ''}`}>
                <Card 
                  key={card.id} 
                  id={card.id} 
                  index={index} 
                  content={card.content}
                  priority={card.priority}
                  dueDate={card.dueDate}
                  tags={card.tags}
                  subtasks={card.subtasks}
                  clientName={card.clientName}
                  clientInfo={card.clientInfo}
                  projectName={card.projectName}
                  isExpanded={card.isExpanded}
                  parentId={card.parentId}
                  columnId={id}
                  status={card.status}
                  totalCost={card.totalCost}
                  expenses={card.expenses}
                  assignedTeam={card.assignedTeam}
                  attachments={card.attachments}
                  notes={card.notes}
                  onAddSubtask={onAddSubtask}
                  onToggleSubtask={onToggleSubtask}
                  onEditTask={onEditTask}
                  onToggleExpand={onToggleExpand}
                />
              </div>
            </div>
            {hasChildren && card.isExpanded && (
              <div className="ml-4">
                {renderCards(childCards, level + 1)}
              </div>
            )}
          </div>
        );
      });
  };

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
            {renderCards(cards)}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default Column;
