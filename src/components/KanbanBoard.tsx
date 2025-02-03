import React, { useState } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import Column from './Column';
import { Button } from './ui/button';
import { Plus, X, CalendarIcon } from 'lucide-react';
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
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";

interface Subtask {
  id: string;
  content: string;
  completed: boolean;
}

interface Task {
  id: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  tags: string[];
  subtasks: Subtask[];
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
      { 
        id: 'task-1', 
        content: 'Create project documentation', 
        priority: 'medium', 
        tags: ['docs'],
        subtasks: []
      },
      { 
        id: 'task-2', 
        content: 'Design user interface', 
        priority: 'high', 
        tags: ['design'],
        subtasks: []
      },
      { 
        id: 'task-3', 
        content: 'Implement authentication', 
        priority: 'high', 
        tags: ['backend'],
        subtasks: []
      },
    ],
  },
  inProgress: {
    title: 'In Progress',
    items: [
      { 
        id: 'task-4', 
        content: 'Develop API endpoints', 
        priority: 'medium', 
        tags: ['backend'],
        subtasks: []
      },
      { 
        id: 'task-5', 
        content: 'Write unit tests', 
        priority: 'low', 
        tags: ['testing'],
        subtasks: []
      },
    ],
  },
  done: {
    title: 'Done',
    items: [
      { 
        id: 'task-6', 
        content: 'Project setup', 
        priority: 'high', 
        tags: ['setup'],
        subtasks: []
      },
      { 
        id: 'task-7', 
        content: 'Initial planning', 
        priority: 'medium', 
        tags: ['planning'],
        subtasks: []
      },
    ],
  },
};

const predefinedTags = [
  'frontend', 'backend', 'design', 'bug', 'feature', 'docs', 
  'testing', 'urgent', 'planning', 'setup'
];

const KanbanBoard = () => {
  const [columns, setColumns] = useState<KanbanData>(initialData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubtaskDialogOpen, setIsSubtaskDialogOpen] = useState(false);
  const [newTaskContent, setNewTaskContent] = useState('');
  const [newSubtaskContent, setNewSubtaskContent] = useState('');
  const [activeColumn, setActiveColumn] = useState<string | null>(null);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState<Date>();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
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
    setSelectedTags([]);
    setCustomTag('');
    setIsDialogOpen(true);
  };

  const handleAddSubtask = (taskId: string) => {
    setActiveTaskId(taskId);
    setNewSubtaskContent('');
    setIsSubtaskDialogOpen(true);
  };

  const handleSubtaskSubmit = () => {
    if (activeTaskId && newSubtaskContent.trim()) {
      setColumns(prevColumns => {
        const newColumns = { ...prevColumns };
        Object.keys(newColumns).forEach(columnId => {
          const taskIndex = newColumns[columnId].items.findIndex(task => task.id === activeTaskId);
          if (taskIndex !== -1) {
            const newSubtask: Subtask = {
              id: `subtask-${Date.now()}`,
              content: newSubtaskContent.trim(),
              completed: false
            };
            newColumns[columnId].items[taskIndex].subtasks.push(newSubtask);
          }
        });
        return newColumns;
      });

      setIsSubtaskDialogOpen(false);
      setNewSubtaskContent('');
      setActiveTaskId(null);

      toast({
        title: "Subtask added",
        description: "New subtask has been added to the task",
      });
    }
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setColumns(prevColumns => {
      const newColumns = { ...prevColumns };
      Object.keys(newColumns).forEach(columnId => {
        const taskIndex = newColumns[columnId].items.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
          const subtaskIndex = newColumns[columnId].items[taskIndex].subtasks.findIndex(
            subtask => subtask.id === subtaskId
          );
          if (subtaskIndex !== -1) {
            newColumns[columnId].items[taskIndex].subtasks[subtaskIndex].completed =
              !newColumns[columnId].items[taskIndex].subtasks[subtaskIndex].completed;
          }
        }
      });
      return newColumns;
    });
  };

  const handleTagClick = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleAddCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      setSelectedTags(prev => [...prev, customTag.trim()]);
      setCustomTag('');
    }
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
        tags: selectedTags
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
      setSelectedTags([]);
      setCustomTag('');
      setActiveColumn(null);
      setIsCalendarOpen(false);

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
                onAddSubtask={handleAddSubtask}
                onToggleSubtask={handleToggleSubtask}
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
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
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
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newTaskDueDate}
                    onSelect={(date) => {
                      setNewTaskDueDate(date);
                      setIsCalendarOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {predefinedTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleTagClick(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add custom tag"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomTag();
                    }
                  }}
                />
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={handleAddCustomTag}
                >
                  Add
                </Button>
              </div>
              {selectedTags.length > 0 && (
                <div className="mt-2">
                  <Label>Selected Tags:</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="default"
                        className="cursor-pointer"
                      >
                        {tag}
                        <X
                          className="ml-1 h-3 w-3"
                          onClick={() => setSelectedTags(prev => prev.filter(t => t !== tag))}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
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

      <Dialog open={isSubtaskDialogOpen} onOpenChange={setIsSubtaskDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Subtask</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subtask">Subtask Description</Label>
              <Input
                id="subtask"
                placeholder="Enter subtask description"
                value={newSubtaskContent}
                onChange={(e) => setNewSubtaskContent(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSubtaskDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubtaskSubmit}>Add Subtask</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default KanbanBoard;
