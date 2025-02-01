import React, { useState } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import Column from './Column';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';
import { useToast } from './ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface TaskTag {
  id: string;
  name: string;
}

interface Task {
  id: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  tags: string[];
}

interface KanbanData {
  [key: string]: {
    title: string;
    items: Task[];
  };
}

const initialData: KanbanData = {
  todo: {
    title: 'To Do',
    items: [
      { id: 'task-1', content: 'Create project documentation', priority: 'medium', tags: ['docs'] },
      { id: 'task-2', content: 'Design user interface', priority: 'high', tags: ['design'] },
      { id: 'task-3', content: 'Implement authentication', priority: 'high', tags: ['backend'] },
    ],
  },
  inProgress: {
    title: 'In Progress',
    items: [
      { id: 'task-4', content: 'Develop API endpoints', priority: 'medium', tags: ['backend'] },
      { id: 'task-5', content: 'Write unit tests', priority: 'low', tags: ['testing'] },
    ],
  },
  done: {
    title: 'Done',
    items: [
      { id: 'task-6', content: 'Project setup', priority: 'high', tags: ['setup'] },
      { id: 'task-7', content: 'Initial planning', priority: 'medium', tags: ['planning'] },
    ],
  },
};

const KanbanBoard = () => {
  const [columns, setColumns] = useState<KanbanData>(initialData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTaskContent, setNewTaskContent] = useState('');
  const [activeColumn, setActiveColumn] = useState<string | null>(null);
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState<Date>();
  const [newTaskTags, setNewTaskTags] = useState('');
  const { toast } = useToast();

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

  const addTask = (columnId: string) => {
    setActiveColumn(columnId);
    setNewTaskContent('');
    setNewTaskPriority('medium');
    setNewTaskDueDate(undefined);
    setNewTaskTags('');
    setIsDialogOpen(true);
  };

  const handleAddTask = () => {
    if (activeColumn && newTaskContent.trim()) {
      const newTaskId = `task-${Date.now()}`;
      const column = columns[activeColumn];
      const newTask: Task = {
        id: newTaskId,
        content: newTaskContent.trim(),
        priority: newTaskPriority,
        dueDate: newTaskDueDate,
        tags: newTaskTags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
      };

      setColumns({
        ...columns,
        [activeColumn]: {
          ...column,
          items: [...column.items, newTask]
        }
      });

      setIsDialogOpen(false);
      setNewTaskContent('');
      setNewTaskPriority('medium');
      setNewTaskDueDate(undefined);
      setNewTaskTags('');
      setActiveColumn(null);

      toast({
        title: "Task added",
        description: "New task has been added to the column",
      });
    }
  };

  return (
    <>
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
                onAddTask={() => addTask(columnId)}
              />
            ))}
          </div>
        </div>
      </DragDropContext>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="task">Task Description</Label>
              <Input
                id="task"
                placeholder="Enter task description"
                value={newTaskContent}
                onChange={(e) => setNewTaskContent(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Priority</Label>
              <RadioGroup
                value={newTaskPriority}
                onValueChange={(value: 'low' | 'medium' | 'high') => setNewTaskPriority(value)}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="low" />
                  <Label htmlFor="low">Low</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium">Medium</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="high" />
                  <Label htmlFor="high">High</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !newTaskDueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newTaskDueDate ? format(newTaskDueDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={newTaskDueDate}
                    onSelect={setNewTaskDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                placeholder="e.g. frontend, urgent, bug"
                value={newTaskTags}
                onChange={(e) => setNewTaskTags(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTask}>Add Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default KanbanBoard;