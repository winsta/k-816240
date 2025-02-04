import React, { useState } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import Column from './Column';
import { Button } from './ui/button';
import { Plus, X, CalendarIcon, ListPlus } from 'lucide-react';
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
  clientName: string;
  projectName: string;
  parentId?: string; // Added for hierarchy
  isExpanded?: boolean; // Added for expanding/collapsing
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
        subtasks: [],
        clientName: 'ACME Corp',
        projectName: 'Documentation Portal'
      },
      { 
        id: 'task-2', 
        content: 'Design user interface', 
        priority: 'high', 
        tags: ['design'],
        subtasks: [],
        clientName: 'ACME Corp',
        projectName: 'UI Design'
      },
      { 
        id: 'task-3', 
        content: 'Implement authentication', 
        priority: 'high', 
        tags: ['backend'],
        subtasks: [],
        clientName: 'ACME Corp',
        projectName: 'Auth Module'
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
        subtasks: [],
        clientName: 'ACME Corp',
        projectName: 'API Development'
      },
      { 
        id: 'task-5', 
        content: 'Write unit tests', 
        priority: 'low', 
        tags: ['testing'],
        subtasks: [],
        clientName: 'ACME Corp',
        projectName: 'Testing Suite'
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
        subtasks: [],
        clientName: 'ACME Corp',
        projectName: 'Initial Setup'
      },
      { 
        id: 'task-7', 
        content: 'Initial planning', 
        priority: 'medium', 
        tags: ['planning'],
        subtasks: [],
        clientName: 'ACME Corp',
        projectName: 'Planning Phase'
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
  const [newTaskContent, setNewTaskContent] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState<Date>();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [clientName, setClientName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [newSubtasks, setNewSubtasks] = useState<string[]>([]);
  const [activeColumn, setActiveColumn] = useState<string | null>(null);
  const [isSubtaskDialogOpen, setIsSubtaskDialogOpen] = useState(false);
  const [newSubtaskContent, setNewSubtaskContent] = useState('');
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const { toast } = useToast();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

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
    setClientName('');
    setProjectName('');
    setNewSubtasks([]);
    setIsDialogOpen(true);
  };

  const handleAddSubtaskField = () => {
    setNewSubtasks([...newSubtasks, '']);
  };

  const handleSubtaskChange = (index: number, value: string) => {
    const updatedSubtasks = [...newSubtasks];
    updatedSubtasks[index] = value;
    setNewSubtasks(updatedSubtasks);
  };

  const handleAddTask = () => {
    if (!activeColumn || !newTaskContent.trim()) return;

    const newTaskId = `task-${Date.now()}`;
    const column = columns[activeColumn];
    
    // Ensure the date is set to end of day for due dates
    const adjustedDueDate = newTaskDueDate ? new Date(newTaskDueDate.setHours(23, 59, 59, 999)) : undefined;
    
    const newTask: Task = {
      id: newTaskId,
      content: newTaskContent.trim(),
      priority: newTaskPriority,
      dueDate: adjustedDueDate,
      tags: selectedTags,
      subtasks: newSubtasks.filter(st => st.trim()).map(content => ({
        id: `subtask-${Date.now()}-${Math.random()}`,
        content,
        completed: false
      })),
      clientName: clientName.trim(),
      projectName: projectName.trim()
    };

    setColumns(prevColumns => ({
      ...prevColumns,
      [activeColumn]: {
        ...column,
        items: [...column.items, newTask]
      }
    }));

    setIsDialogOpen(false);
    resetForm();

    toast({
      title: "Task added",
      description: "New task has been added to the column",
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

  const handleAddSubtask = (taskId: string) => {
    setActiveTaskId(taskId);
    setNewSubtaskContent('');
    setIsSubtaskDialogOpen(true);
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setColumns(prevColumns => {
      const newColumns = { ...prevColumns };
      
      for (const columnId in newColumns) {
        const column = newColumns[columnId];
        const taskIndex = column.items.findIndex(task => task.id === taskId);
        
        if (taskIndex !== -1) {
          const task = column.items[taskIndex];
          const subtaskIndex = task.subtasks.findIndex(st => st.id === subtaskId);
          
          if (subtaskIndex !== -1) {
            const updatedSubtasks = [...task.subtasks];
            updatedSubtasks[subtaskIndex] = {
              ...updatedSubtasks[subtaskIndex],
              completed: !updatedSubtasks[subtaskIndex].completed
            };
            
            column.items[taskIndex] = {
              ...task,
              subtasks: updatedSubtasks
            };
          }
          break;
        }
      }
      
      return newColumns;
    });
  };

  const handleEditTask = (columnId: string, taskId: string) => {
    const column = columns[columnId];
    if (!column) return; // Early return if column not found
    
    const task = column.items.find(item => item.id === taskId);
    if (task) {
      setEditingTask(task);
      setNewTaskContent(task.content);
      setNewTaskPriority(task.priority);
      setNewTaskDueDate(task.dueDate);
      setSelectedTags(task.tags);
      setClientName(task.clientName);
      setProjectName(task.projectName);
      setIsEditDialogOpen(true);
    }
  };

  const handleUpdateTask = () => {
    if (editingTask && newTaskContent.trim()) {
      setColumns(prevColumns => {
        const newColumns = { ...prevColumns };
        for (const columnId in newColumns) {
          const column = newColumns[columnId];
          const taskIndex = column.items.findIndex(task => task.id === editingTask.id);
          
          if (taskIndex !== -1) {
            const adjustedDueDate = newTaskDueDate ? 
              new Date(newTaskDueDate.setHours(23, 59, 59, 999)) : undefined;

            column.items[taskIndex] = {
              ...column.items[taskIndex],
              content: newTaskContent.trim(),
              priority: newTaskPriority,
              dueDate: adjustedDueDate,
              tags: selectedTags,
              clientName: clientName.trim(),
              projectName: projectName.trim(),
            };
            break;
          }
        }
        return newColumns;
      });

      setIsEditDialogOpen(false);
      setEditingTask(null);
      resetForm();
      
      toast({
        title: "Task updated",
        description: "The task has been updated successfully",
      });
    }
  };

  const resetForm = () => {
    setNewTaskContent('');
    setNewTaskPriority('medium');
    setNewTaskDueDate(undefined);
    setSelectedTags([]);
    setCustomTag('');
    setClientName('');
    setProjectName('');
    setNewSubtasks([]);
  };

  const handleSubtaskSubmit = () => {
    if (activeTaskId && newSubtaskContent.trim()) {
      setColumns(prevColumns => {
        const newColumns = { ...prevColumns };
        
        for (const columnId in newColumns) {
          const column = newColumns[columnId];
          const taskIndex = column.items.findIndex(task => task.id === activeTaskId);
          
          if (taskIndex !== -1) {
            const task = column.items[taskIndex];
            const newSubtask = {
              id: `subtask-${Date.now()}-${Math.random()}`,
              content: newSubtaskContent.trim(),
              completed: false
            };
            
            column.items[taskIndex] = {
              ...task,
              subtasks: [...task.subtasks, newSubtask]
            };
            break;
          }
        }
        
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
                onEditTask={handleEditTask}
                onToggleExpand={(taskId) => {
                  setColumns(prev => {
                    const newColumns = { ...prev };
                    const task = newColumns[columnId].items.find(item => item.id === taskId);
                    if (task) {
                      task.isExpanded = !task.isExpanded;
                    }
                    return newColumns;
                  });
                }}
              />
            ))}
          </div>
        </div>
      </DragDropContext>

      {/* Add Task Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name</Label>
              <Input
                id="clientName"
                placeholder="Enter client name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                placeholder="Enter project name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>

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
                      if (date) {
                        const endOfDay = new Date(date.setHours(23, 59, 59, 999));
                        setNewTaskDueDate(endOfDay);
                      } else {
                        setNewTaskDueDate(undefined);
                      }
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
            </div>

            <div className="space-y-2">
              <Label>Subtasks</Label>
              {newSubtasks.map((subtask, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={subtask}
                    onChange={(e) => handleSubtaskChange(index, e.target.value)}
                    placeholder={`Subtask ${index + 1}`}
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={handleAddSubtaskField}
                className="w-full"
              >
                <ListPlus className="mr-2 h-4 w-4" />
                Add Subtask
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsDialogOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddTask}>Add Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name</Label>
              <Input
                id="clientName"
                placeholder="Enter client name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                placeholder="Enter project name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>

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
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newTaskDueDate}
                    onSelect={(date) => {
                      if (date) {
                        const endOfDay = new Date(date.setHours(23, 59, 59, 999));
                        setNewTaskDueDate(endOfDay);
                      } else {
                        setNewTaskDueDate(undefined);
                      }
                    }}
                    initialFocus
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
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
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false);
              setEditingTask(null);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTask}>Update Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subtask Dialog */}
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
